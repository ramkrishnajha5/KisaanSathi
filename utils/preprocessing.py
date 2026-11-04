"""Image Preprocessing & Validation Utility for KisaanSathi.

Prepares raw leaf image bytes for MobileNetV2 inference:
1. Validates format (JPEG, PNG, WEBP) and integrity.
2. Resizes image while maintaining or standardizing to (224, 224, 3).
3. Normalizes pixel values for MobileNetV2 (scaled to [-1, 1] range).
"""

import io
from typing import Tuple
from PIL import Image
import numpy as np

ALLOWED_EXTENSIONS = {"jpeg", "jpg", "png", "webp"}
TARGET_IMAGE_SIZE = (224, 224)


def validate_image_bytes(image_bytes: bytes) -> Image.Image:
    """Validates raw image bytes and returns a PIL Image in RGB format.

    Args:
        image_bytes: Raw bytes uploaded from API or Streamlit.

    Returns:
        PIL Image in RGB format.

    Raises:
        ValueError: If bytes cannot be decoded or image format is unsupported.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ValueError("Empty image byte stream provided.")

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify file integrity
        # Re-open after verify() because verify() clears file pointer
        image = Image.open(io.BytesIO(image_bytes))
    except Exception as exc:
        raise ValueError(f"Invalid or corrupted image file: {str(exc)}") from exc

    format_name = (image.format or "").lower()
    if format_name not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Unsupported image format: '{format_name}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Convert grayscale or RGBA to 3-channel RGB
    if image.mode != "RGB":
        image = image.convert("RGB")

    return image


def preprocess_for_inference(
    image: Image.Image,
    target_size: Tuple[int, int] = TARGET_IMAGE_SIZE
) -> np.ndarray:
    """Preprocesses a PIL Image into a tensor ready for MobileNetV2.

    MobileNetV2 expects input shape: (1, 224, 224, 3)
    Pixel values are kept in [0.0, 255.0] range because the model architecture
    contains an internal Rescaling layer (1/127.5, offset=-1.0).

    Args:
        image: PIL Image object.
        target_size: Output spatial dimensions (height, width).

    Returns:
        np.ndarray with shape (1, 224, 224, 3) and dtype float32.
    """
    resized = image.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(resized, dtype=np.float32)

    # Expand batch dimension: (224, 224, 3) -> (1, 224, 224, 3)
    # The Keras model contains an internal layers.Rescaling(1.0/127.5, offset=-1.0),
    # so we pass raw [0, 255] float values to prevent double normalization.
    batch_tensor = np.expand_dims(img_array, axis=0)
    return batch_tensor

