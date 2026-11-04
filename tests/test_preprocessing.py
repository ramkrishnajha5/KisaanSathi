"""Unit tests for image validation and preprocessing pipeline."""

import io
from PIL import Image
import numpy as np
import pytest

from utils.preprocessing import validate_image_bytes, preprocess_for_inference


def create_dummy_image_bytes(format="JPEG", size=(300, 300), color=(100, 150, 50)) -> bytes:
    """Helper to generate in-memory dummy image bytes for testing."""
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format)
    return buf.getvalue()


def test_validate_image_bytes_valid():
    img_bytes = create_dummy_image_bytes(format="JPEG")
    image = validate_image_bytes(img_bytes)
    assert isinstance(image, Image.Image)
    assert image.mode == "RGB"


def test_validate_image_bytes_empty_raises():
    with pytest.raises(ValueError, match="Empty image byte stream"):
        validate_image_bytes(b"")


def test_validate_image_bytes_corrupted_raises():
    with pytest.raises(ValueError, match="Invalid or corrupted"):
        validate_image_bytes(b"not_an_image_data")


def test_preprocess_for_inference_dimensions_and_range():
    img_bytes = create_dummy_image_bytes(format="PNG", size=(400, 400))
    image = validate_image_bytes(img_bytes)
    tensor = preprocess_for_inference(image, target_size=(224, 224))

    # Assert shape is (1, 224, 224, 3)
    assert tensor.shape == (1, 224, 224, 3)
    assert tensor.dtype == np.float32

    # Assert MobileNetV2 normalization [-1.0, 1.0]
    assert np.all(tensor >= -1.0)
    assert np.all(tensor <= 1.0)
