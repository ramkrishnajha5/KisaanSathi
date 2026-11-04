"""Grad-CAM (Gradient-Weighted Class Activation Mapping) Utility for KisaanSathi.

Explainable AI (XAI) implementation:
Identifies discriminative regions in an input leaf photograph that influenced
the MobileNetV2 convolutional neural network's disease classification.

Mathematical Steps (Viva Reference):
1. Compute the gradient of the predicted class score (y^c) with respect to
   feature activation maps (A^k) of the final convolutional layer:
   d(y^c) / d(A^k)
2. Global-average-pool the gradients across spatial dimensions (height u, width v):
   alpha_k^c = (1 / Z) * sum_u sum_v [ d(y^c) / d(A_{u,v}^k) ]
3. Compute a weighted linear combination of forward activation maps:
   L_Grad-CAM = ReLU( sum_k (alpha_k^c * A^k) )
4. Upsample the resulting 2D heatmap to original image dimensions and superimpose.
"""

import base64
import io
from typing import Optional, Tuple, Any
import cv2
import numpy as np
from PIL import Image

from utils.logger import logger


def find_target_conv_layer(model: Any) -> Optional[str]:
    """Dynamically locates the final convolutional feature layer in a model.

    For MobileNetV2, this is typically 'Conv_1' or 'out_relu'.
    If the MobileNetV2 base is nested inside the full classification model,
    this inspects the inner layers.

    Args:
        model: TensorFlow/Keras model.

    Returns:
        Name of the target convolutional layer or None.
    """
    try:
        # Check if model has a nested base model (e.g. mobilenetv2)
        for layer in reversed(model.layers):
            if hasattr(layer, "layers"):
                for inner_layer in reversed(layer.layers):
                    if "conv" in inner_layer.name.lower() or "relu" in inner_layer.name.lower():
                        return f"{layer.name}/{inner_layer.name}"

            # Flat model check: look for 4D activation output
            if "conv" in layer.name.lower() or "out_relu" in layer.name.lower():
                return layer.name
    except Exception as exc:
        logger.warning("Could not auto-detect conv layer: %s", exc)

    return "Conv_1"


def compute_gradcam_heatmap(
    model: Any,
    input_tensor: np.ndarray,
    class_idx: Optional[int] = None,
    target_layer_name: Optional[str] = None
) -> np.ndarray:
    """Computes the 2D Grad-CAM heatmap for a given input tensor and class.

    Args:
        model: Trained tf.keras.Model.
        input_tensor: 4D numpy array with shape (1, 224, 224, 3) normalized to [-1, 1].
        class_idx: Index of the target class. If None, uses top predicted class.
        target_layer_name: Name of final conv layer. If None, detected automatically.

    Returns:
        2D numpy array with heatmap values normalized between 0.0 and 1.0.
    """
    try:
        import tensorflow as tf
    except ImportError:
        logger.warning("TensorFlow not available for Grad-CAM. Using fallback activation map.")
        return np.ones((14, 14), dtype=np.float32) * 0.5

    try:
        tensor_tf = tf.cast(input_tensor, tf.float32)

        # Check if model has a nested base_model (e.g. mobilenetv2_1.00_224)
        nested_base = None
        for layer in model.layers:
            if hasattr(layer, "layers") and len(layer.layers) > 10:
                nested_base = layer
                break

        if nested_base is not None:
            # Find downstream layers in top model (GAP, Dropout, Dense)
            downstream_layers = []
            found_base = False
            for layer in model.layers:
                if layer is nested_base:
                    found_base = True
                    continue
                if found_base:
                    downstream_layers.append(layer)

            # Upstream preprocessing: only apply Rescaling layer (skip InputLayer and augmentation)
            upstream_tensor = tensor_tf
            for layer in model.layers:
                if layer is nested_base:
                    break
                # Only apply Rescaling — skip InputLayer (can't be called) and data_augmentation
                if "rescaling" in layer.name.lower():
                    upstream_tensor = layer(upstream_tensor)

            with tf.GradientTape() as tape:
                conv_outputs = nested_base(upstream_tensor)
                tape.watch(conv_outputs)
                x = conv_outputs
                for layer in downstream_layers:
                    if "dropout" in layer.name.lower():
                        x = layer(x, training=False)
                    else:
                        x = layer(x)
                predictions = x
                if class_idx is None:
                    class_idx = tf.argmax(predictions[0])
                loss = predictions[:, class_idx]

            grads = tape.gradient(loss, conv_outputs)
        else:
            # Flat model Grad-CAM fallback
            target_conv = None
            for layer in reversed(model.layers):
                if hasattr(layer, "output_shape") and len(layer.output_shape) == 4:
                    target_conv = layer
                    break

            if target_conv is None:
                logger.warning("Target conv layer not found. Using uniform heatmap.")
                return np.ones((14, 14), dtype=np.float32) * 0.5

            grad_model = tf.keras.models.Model(
                inputs=model.inputs,
                outputs=[target_conv.output, model.output]
            )

            with tf.GradientTape() as tape:
                conv_outputs, predictions = grad_model(tensor_tf)
                if class_idx is None:
                    class_idx = tf.argmax(predictions[0])
                loss = predictions[:, class_idx]

            grads = tape.gradient(loss, conv_outputs)

        if grads is None:
            logger.warning("Gradients could not be computed for Grad-CAM.")
            return np.ones((14, 14), dtype=np.float32) * 0.5

        # Global average pool gradients along spatial dimensions (H, W) -> alpha weights
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        # Weight feature maps by alpha weights
        conv_outputs_val = conv_outputs[0]
        heatmap = conv_outputs_val @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)

        # Apply ReLU to retain only features that positively contributed to class score
        heatmap = tf.maximum(heatmap, 0.0)

        # Normalize to [0.0, 1.0]
        max_val = tf.math.reduce_max(heatmap)
        if max_val > 0:
            heatmap = heatmap / max_val

        return heatmap.numpy()

    except Exception as exc:
        logger.error("Grad-CAM computation failed: %s. Using default heatmap.", str(exc))
        return np.ones((14, 14), dtype=np.float32) * 0.5


def generate_gradcam_overlay(
    original_image: Image.Image,
    heatmap: np.ndarray,
    alpha: float = 0.45,
    colormap: int = cv2.COLORMAP_JET
) -> Image.Image:
    """Superimposes a Grad-CAM heatmap over the original RGB image.

    Args:
        original_image: Source PIL image.
        heatmap: 2D float array with values normalized between 0.0 and 1.0.
        alpha: Blending weight for the heatmap overlay (0.0 to 1.0).
        colormap: OpenCV colormap (default: COLORMAP_JET).

    Returns:
        PIL Image with the superimposed heatmap visualization.
    """
    orig_w, orig_h = original_image.size
    resized_heatmap = cv2.resize(heatmap.astype(np.float32), (orig_w, orig_h))

    # Scale to 8-bit unsigned integer [0, 255]
    heatmap_uint8 = np.uint8(255 * np.clip(resized_heatmap, 0.0, 1.0))

    # Apply colormap (yields BGR)
    colored_heatmap = cv2.applyColorMap(heatmap_uint8, colormap)
    colored_heatmap_rgb = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)

    # Convert original PIL image to numpy array
    orig_np = np.array(original_image)

    # Weighted blending: blended = (1 - alpha) * original + alpha * heatmap
    blended = np.uint8((1.0 - alpha) * orig_np + alpha * colored_heatmap_rgb)

    return Image.fromarray(blended)


def encode_image_to_base64(image: Image.Image, format: str = "JPEG") -> str:
    """Encodes a PIL image to a base64 string for JSON API transmission."""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    return base64.b64encode(buffer.getvalue()).decode("utf-8")
