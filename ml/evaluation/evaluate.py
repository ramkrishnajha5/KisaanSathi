"""Independent Test Set Model Evaluation & Error Diagnostics for KisaanSathi.

Evaluates trained MobileNetV2 models STRICTLY on the holdout test set:
- Computes overall test accuracy, macro/weighted precision, recall, and F1-score
- Generates per-class classification report
- Plots high-resolution confusion matrix heatmap
- Pinpoints top confused class pairs for agronomic analysis
- Saves structured JSON and text artifacts for academic viva documentation
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
import matplotlib.pyplot as plt
import numpy as np

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments for model evaluation."""
    parser = argparse.ArgumentParser(description="KisaanSathi Test Set Model Evaluation")
    parser.add_argument(
        "--model-path",
        type=str,
        default="ml/models/crop_disease_model.keras",
        help="Path to trained .keras model weights (default: ml/models/crop_disease_model.keras)"
    )
    parser.add_argument(
        "--test-dir",
        type=str,
        default="data/processed/test",
        help="Path to test set directory (default: data/processed/test)"
    )
    parser.add_argument(
        "--class-names",
        type=str,
        default="ml/models/class_names.json",
        help="Path to class mapping JSON (default: ml/models/class_names.json)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="reports",
        help="Directory to save evaluation reports and plots (default: reports)"
    )
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size (default: 32)")
    parser.add_argument("--img-size", type=int, default=224, help="Spatial resolution (default: 224)")
    return parser.parse_args()


def load_class_names(class_names_path: Path) -> List[str]:
    """Loads ordered class names from JSON file."""
    if not class_names_path.exists():
        raise FileNotFoundError(f"Class names file not found: {class_names_path.resolve()}")

    with open(class_names_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict):
        # Sort by integer keys if numeric string
        try:
            sorted_items = sorted(data.items(), key=lambda x: int(x[0]))
            return [v for _, v in sorted_items]
        except ValueError:
            return list(data.values())
    elif isinstance(data, list):
        return data
    raise ValueError(f"Unexpected JSON format in {class_names_path}")


def evaluate_model(
    model_path: str | Path,
    test_dir: str | Path,
    class_names_path: Optional[str | Path] = None,
    output_dir: str | Path = "reports",
    batch_size: int = 32,
    img_size: int = 224
) -> Dict[str, Any]:
    """Runs rigorous test set evaluation with confusion matrix and top confused classes.

    Args:
        model_path: Path to trained Keras model.
        test_dir: Directory containing test set images.
        class_names_path: Optional path to class_names.json.
        output_dir: Destination directory for artifacts.
        batch_size: Evaluation batch size.
        img_size: Square image spatial dimension.

    Returns:
        Structured evaluation metrics dictionary.
    """
    try:
        import tensorflow as tf
        from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support
    except ImportError as e:
        raise ImportError(f"Required evaluation libraries not installed: {e}")

    m_path = Path(model_path)
    t_path = Path(test_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    if not m_path.exists():
        raise FileNotFoundError(f"Model file not found at: {m_path.resolve()}")
    if not t_path.exists():
        raise FileNotFoundError(f"Test directory not found at: {t_path.resolve()}")

    print(f"[+] Loading model from: {m_path.resolve()}")
    model = tf.keras.models.load_model(str(m_path))

    # Load test dataset
    print(f"[+] Loading test set from: {t_path.resolve()}")
    test_ds = tf.keras.utils.image_dataset_from_directory(
        t_path,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="categorical",
        shuffle=False
    )

    detected_classes = test_ds.class_names

    # Resolve class names
    if class_names_path and Path(class_names_path).exists():
        class_names = load_class_names(Path(class_names_path))
    else:
        class_names = detected_classes

    # Predict on entire test dataset
    print("[+] Executing forward passes on test batches...")
    y_true_list = []
    y_pred_list = []

    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_true_list.extend(np.argmax(labels.numpy(), axis=1))
        y_pred_list.extend(np.argmax(preds, axis=1))

    y_true = np.array(y_true_list)
    y_pred = np.array(y_pred_list)

    total_samples = len(y_true)
    test_accuracy = float(np.mean(y_true == y_pred))

    # Precision, Recall, F1
    precision_macro, recall_macro, f1_macro, _ = precision_recall_fscore_support(
        y_true, y_pred, average="macro", zero_division=0
    )
    precision_weighted, recall_weighted, f1_weighted, _ = precision_recall_fscore_support(
        y_true, y_pred, average="weighted", zero_division=0
    )

    # Classification Report
    cls_report_str = classification_report(
        y_true,
        y_pred,
        target_names=class_names[:len(np.unique(np.concatenate([y_true, y_pred])))],
        zero_division=0
    )

    # Save classification report text
    report_txt_file = out_path / "classification_report.txt"
    with open(report_txt_file, "w", encoding="utf-8") as f:
        f.write("=" * 65 + "\n")
        f.write("KisaanSathi Model Test Set Classification Report\n")
        f.write("=" * 65 + "\n\n")
        f.write(cls_report_str)
        f.write("\n")

    # Confusion Matrix
    cm = confusion_matrix(y_true, y_pred)

    # Top Confused Pairs (A -> B where A != B)
    confused_pairs = []
    for i in range(len(cm)):
        for j in range(len(cm)):
            if i != j and cm[i, j] > 0:
                actual_name = class_names[i] if i < len(class_names) else f"Class_{i}"
                predicted_name = class_names[j] if j < len(class_names) else f"Class_{j}"
                confused_pairs.append({
                    "actual": actual_name,
                    "predicted": predicted_name,
                    "count": int(cm[i, j])
                })

    confused_pairs.sort(key=lambda x: x["count"], reverse=True)

    # Plot Confusion Matrix
    cm_plot_path = out_path / "confusion_matrix.png"
    plt.figure(figsize=(12, 10))
    plt.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    plt.title("KisaanSathi MobileNetV2: Test Set Confusion Matrix", fontsize=14, fontweight="bold")
    plt.colorbar()

    tick_marks = np.arange(len(class_names))
    if len(class_names) <= 20:
        plt.xticks(tick_marks, class_names, rotation=90, fontsize=8)
        plt.yticks(tick_marks, class_names, fontsize=8)
    else:
        plt.xticks(tick_marks[::2], class_names[::2], rotation=90, fontsize=7)
        plt.yticks(tick_marks[::2], class_names[::2], fontsize=7)

    plt.xlabel("Predicted Disease Class", fontsize=11)
    plt.ylabel("Ground Truth Disease Class", fontsize=11)
    plt.tight_layout()
    plt.savefig(cm_plot_path, dpi=200)
    plt.close()

    results: Dict[str, Any] = {
        "status": "evaluated",
        "dataset_split": "TEST (Holdout)",
        "model_path": str(m_path.resolve()),
        "test_samples": total_samples,
        "test_accuracy": round(test_accuracy, 4),
        "macro_metrics": {
            "precision": round(float(precision_macro), 4),
            "recall": round(float(recall_macro), 4),
            "f1_score": round(float(f1_macro), 4)
        },
        "weighted_metrics": {
            "precision": round(float(precision_weighted), 4),
            "recall": round(float(recall_weighted), 4),
            "f1_score": round(float(f1_weighted), 4)
        },
        "top_confused_classes": confused_pairs[:10],
        "confusion_matrix_plot": str(cm_plot_path.resolve()),
        "classification_report_file": str(report_txt_file.resolve())
    }

    # Save test results JSON
    with open(out_path / "test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    return results


def print_evaluation_summary(results: Dict[str, Any]) -> None:
    """Prints evaluation results to stdout."""
    print("\n" + "=" * 65)
    print("🌾 KisaanSathi Independent Test Set Evaluation Results")
    print("=" * 65)
    print(f"Model Evaluated     : {results.get('model_path')}")
    print(f"Test Set Samples    : {results.get('test_samples')}")
    print(f"Overall Test Accuracy: {results.get('test_accuracy', 0) * 100:.2f}%")
    print("-" * 65)
    macro = results.get("macro_metrics", {})
    weighted = results.get("weighted_metrics", {})
    print("Macro Averages:")
    print(f"  • Precision        : {macro.get('precision', 0):.4f}")
    print(f"  • Recall           : {macro.get('recall', 0):.4f}")
    print(f"  • F1-Score         : {macro.get('f1_score', 0):.4f}")
    print("Weighted Averages:")
    print(f"  • Precision        : {weighted.get('precision', 0):.4f}")
    print(f"  • Recall           : {weighted.get('recall', 0):.4f}")
    print(f"  • F1-Score         : {weighted.get('f1_score', 0):.4f}")
    print("-" * 65)
    top_c = results.get("top_confused_classes", [])
    if top_c:
        print("Top Misclassified Class Pairs:")
        for item in top_c[:5]:
            print(f"  • Actual: {item['actual']} -> Predicted: {item['predicted']} ({item['count']} errors)")
    print("=" * 65 + "\n")


def main() -> None:
    args = parse_arguments()
    model_path = Path(args.model_path)
    test_dir = Path(args.test_dir)

    if not model_path.exists():
        print(f"\n[!] Model file not found at: '{args.model_path}'")
        print("    Please train the MobileNetV2 model using ml/training/train.py or Colab first.")
        sys.exit(0)

    if not test_dir.exists():
        print(f"\n[!] Test directory not found at: '{args.test_dir}'")
        print("    Please run ml/dataset/split_dataset.py with --create-dirs first.")
        sys.exit(0)

    results = evaluate_model(
        model_path=args.model_path,
        test_dir=args.test_dir,
        class_names_path=args.class_names,
        output_dir=args.output_dir,
        batch_size=args.batch_size,
        img_size=args.img_size
    )
    print_evaluation_summary(results)


if __name__ == "__main__":
    main()
