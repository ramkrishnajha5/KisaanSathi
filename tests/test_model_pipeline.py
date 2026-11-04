"""Unit and integration tests for Phase 2 ML pipeline components.

Tests:
- Dataset inspection logic (class detection, corrupt file handling, imbalance calculation)
- Dataset splitting logic (stratification, reproducibility, seed consistency, zero leakage)
- Class name loading and indexing
- Dual-engine prediction output structure and confidence bounds
- Fallback prediction behavior when model is not found
- Grad-CAM overlay generation and dimension consistency
- Invalid/corrupt image handling
"""

import io
import json
import shutil
import tempfile
from pathlib import Path
from PIL import Image
import numpy as np
import pytest

from ml.dataset.inspect_dataset import inspect_dataset
from ml.dataset.split_dataset import split_dataset
from ml.inference.predictor import CropDiseasePredictor
from utils.gradcam import generate_gradcam_overlay, encode_image_to_base64
from utils.preprocessing import validate_image_bytes, preprocess_for_inference


@pytest.fixture
def temp_dataset():
    """Creates a temporary miniature dataset with 2 classes and synthetic images."""
    temp_dir = tempfile.mkdtemp(prefix="kisaan_test_data_")
    root = Path(temp_dir)

    cls_a = root / "Tomato___Early_blight"
    cls_b = root / "Tomato___healthy"
    cls_a.mkdir(parents=True)
    cls_b.mkdir(parents=True)

    # Create 10 images for class A (with synthetic brown spots)
    for i in range(10):
        img = Image.new("RGB", (100, 100), color=(60, 140, 40))
        # Add brown spot
        img_np = np.array(img)
        img_np[30:70, 30:70] = [120, 60, 20]
        Image.fromarray(img_np).save(cls_a / f"img_a_{i}.jpg")

    # Create 10 images for class B (healthy green)
    for i in range(10):
        img = Image.new("RGB", (100, 100), color=(40, 180, 50))
        img.save(cls_b / f"img_b_{i}.jpg")

    # Create 1 corrupt non-image file
    with open(cls_a / "corrupt.jpg", "wb") as f:
        f.write(b"NOT_A_VALID_IMAGE_DATA")

    # Create 1 unsupported extension file
    with open(cls_b / "notes.txt", "w") as f:
        f.write("Class B notes")

    yield root

    shutil.rmtree(temp_dir, ignore_errors=True)


def test_inspect_dataset_metrics(temp_dataset):
    """Verifies that dataset inspection detects classes, corrupt files, and statistics."""
    report = inspect_dataset(temp_dataset, verify_images=True)

    assert report["status"] == "ready"
    assert report["total_classes"] == 2
    assert report["total_images"] == 20
    assert report["corrupted_images_count"] == 1
    assert report["unsupported_files_count"] == 1
    assert report["classes"]["Tomato___Early_blight"] == 10
    assert report["classes"]["Tomato___healthy"] == 10
    assert report["imbalance"]["imbalance_ratio"] == 1.0


def test_split_dataset_reproducibility(temp_dataset):
    """Verifies stratified splitting ratios and exact reproducibility with fixed seed."""
    out_dir_1 = temp_dataset.parent / "processed_split_1"
    out_dir_2 = temp_dataset.parent / "processed_split_2"

    try:
        summary_1 = split_dataset(
            data_dir=temp_dataset,
            output_dir=out_dir_1,
            train_ratio=0.80,
            val_ratio=0.10,
            test_ratio=0.10,
            seed=42,
            verify_images=True
        )
        summary_2 = split_dataset(
            data_dir=temp_dataset,
            output_dir=out_dir_2,
            train_ratio=0.80,
            val_ratio=0.10,
            test_ratio=0.10,
            seed=42,
            verify_images=True
        )

        assert summary_1["total_images"] == 20
        # 10 per class -> 8 train, 1 val, 1 test each -> 16 train, 2 val, 2 test
        assert summary_1["split_counts"]["train"] == 16
        assert summary_1["split_counts"]["val"] == 2
        assert summary_1["split_counts"]["test"] == 2

        # Verify exact reproducibility
        with open(summary_1["manifests"]["train"]) as f1, open(summary_2["manifests"]["train"]) as f2:
            assert f1.read() == f2.read()

        # Zero leakage assertion: test files must not appear in train or val
        with open(summary_1["manifests"]["train"]) as f:
            train_lines = set(f.read().splitlines()[1:])
        with open(summary_1["manifests"]["test"]) as f:
            test_lines = set(f.read().splitlines()[1:])

        assert len(train_lines.intersection(test_lines)) == 0

    finally:
        shutil.rmtree(out_dir_1, ignore_errors=True)
        shutil.rmtree(out_dir_2, ignore_errors=True)


def test_predictor_fallback_structure():
    """Tests the predictor when model weights are not loaded (ExG fallback mode)."""
    predictor = CropDiseasePredictor(model_path="non_existent_weights.keras")
    assert predictor.is_loaded is False

    # Create dummy leaf image
    img = Image.new("RGB", (250, 250), color=(50, 160, 45))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    result = predictor.predict(buf.getvalue())

    assert "crop" in result
    assert "disease_name" in result
    assert "confidence" in result
    assert 0.0 <= result["confidence"] <= 1.0
    assert result["mode"] == "exg_fallback"
    assert result["model"] == "exg_fallback"
    assert "gradcam_image_base64" in result
    assert len(result["gradcam_image_base64"]) > 50


def test_class_names_loading_formats(tmp_path):
    """Verifies that class_names.json can be loaded from both list and dict formats."""
    # Test 1: List format
    list_file = tmp_path / "classes_list.json"
    classes_list = ["Apple___scab", "Corn___blight", "Tomato___healthy"]
    with open(list_file, "w") as f:
        json.dump(classes_list, f)

    p1 = CropDiseasePredictor(model_path="non_existent.keras", class_names_path=str(list_file))
    assert p1.class_names == classes_list

    # Test 2: Dict format with string numbers
    dict_file = tmp_path / "classes_dict.json"
    classes_dict = {"0": "Apple___scab", "1": "Corn___blight", "2": "Tomato___healthy"}
    with open(dict_file, "w") as f:
        json.dump(classes_dict, f)

    p2 = CropDiseasePredictor(model_path="non_existent.keras", class_names_path=str(dict_file))
    assert p2.class_names == classes_list


def test_gradcam_overlay_dimensions():
    """Verifies that Grad-CAM overlay preserves source image spatial resolution."""
    orig_img = Image.new("RGB", (320, 240), color=(100, 180, 60))
    heatmap = np.random.rand(14, 14).astype(np.float32)

    overlay = generate_gradcam_overlay(orig_img, heatmap, alpha=0.45)
    assert overlay.size == (320, 240)
    assert overlay.mode == "RGB"

    b64_str = encode_image_to_base64(overlay)
    assert isinstance(b64_str, str)
    assert len(b64_str) > 0


def test_predict_invalid_image_raises():
    """Verifies that invalid or empty image bytes raise a ValueError."""
    predictor = CropDiseasePredictor()
    with pytest.raises(ValueError, match="Empty image byte stream"):
        predictor.predict(b"")

    with pytest.raises(ValueError, match="Invalid or corrupted"):
        predictor.predict(b"corrupt_byte_sequence")


def test_real_processed_dataset_integrity():
    """Verifies that the generated data/processed dataset has 38 classes and no background class."""
    processed_dir = Path("data/processed")
    train_dir = processed_dir / "train"
    if not train_dir.exists():
        pytest.skip("data/processed has not been populated yet.")

    train_classes = sorted([d.name for d in train_dir.iterdir() if d.is_dir()])
    val_classes = sorted([d.name for d in (processed_dir / "val").iterdir() if d.is_dir()])
    test_classes = sorted([d.name for d in (processed_dir / "test").iterdir() if d.is_dir()])

    assert len(train_classes) == 38
    assert len(val_classes) == 38
    assert len(test_classes) == 38
    assert train_classes == val_classes == test_classes
    assert "Background_without_leaves" not in train_classes

    # Check class_names.json
    class_names_file = processed_dir / "class_names.json"
    assert class_names_file.exists()
    with open(class_names_file, "r") as f:
        class_names = json.load(f)
    assert len(class_names) == 38
    assert "Background_without_leaves" not in class_names.values()
