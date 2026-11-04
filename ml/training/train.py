"""KisaanSathi MobileNetV2 Two-Stage Transfer Learning Pipeline.

Trains an industrial-grade crop disease classifier on the PlantVillage dataset.
Compatible with local CPU/GPU and Google Colab (with free T4 GPU).

Architecture:
  Input (224, 224, 3)
         ↓
  Data Augmentation (Flip, Rotation, Zoom, Translation) [Training only]
         ↓
  Rescaling [-1.0, 1.0] (Formula: pixel / 127.5 - 1.0)
         ↓
  MobileNetV2 Base (Pre-trained on ImageNet)
         ↓
  GlobalAveragePooling2D
         ↓
  Dropout (0.3)
         ↓
  Dense (num_classes, Softmax)

Two-Stage Strategy:
  - Stage 1: Feature Extraction (MobileNetV2 Base Frozen, lr = 1e-3)
  - Stage 2: Fine-Tuning (Top N layers unfrozen, lr = 1e-5)
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Tuple, Dict, Any, List, Optional
import matplotlib.pyplot as plt
import numpy as np

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def parse_arguments() -> argparse.Namespace:
    """Parses command-line arguments for training configuration."""
    parser = argparse.ArgumentParser(description="KisaanSathi MobileNetV2 Training Pipeline")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/raw/PlantVillage",
        help="Path to raw PlantVillage dataset directory (default: data/raw/PlantVillage)"
    )
    parser.add_argument(
        "--processed-dir",
        type=str,
        default="data/processed",
        help="Path to pre-split processed directory containing manifests or train/val/test folders"
    )
    parser.add_argument(
        "--model-dir",
        type=str,
        default="ml/models",
        help="Directory to save model weights and class mappings (default: ml/models)"
    )
    parser.add_argument(
        "--reports-dir",
        type=str,
        default="reports",
        help="Directory to save training plots and reports (default: reports)"
    )
    parser.add_argument("--batch-size", type=int, default=32, help="Mini-batch size (default: 32)")
    parser.add_argument("--img-size", type=int, default=224, help="Square image spatial dimension (default: 224)")
    parser.add_argument("--stage1-epochs", type=int, default=10, help="Epochs for Stage 1 (frozen base) (default: 10)")
    parser.add_argument("--stage2-epochs", type=int, default=10, help="Epochs for Stage 2 (fine-tuning) (default: 10)")
    parser.add_argument("--lr-stage1", type=float, default=1e-3, help="Learning rate for Stage 1 (default: 0.001)")
    parser.add_argument("--lr-stage2", type=float, default=1e-5, help="Learning rate for Stage 2 (default: 0.00001)")
    parser.add_argument("--unfreeze-layers", type=int, default=30, help="Number of upper layers to fine-tune in Stage 2 (default: 30)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility (default: 42)")
    return parser.parse_args()


def build_data_augmentation():
    """Constructs subtle data augmentation pipeline that preserves pathogen characteristics."""
    import tensorflow as tf
    return tf.keras.Sequential([
        tf.keras.layers.RandomFlip("horizontal", name="aug_horizontal_flip"),
        tf.keras.layers.RandomRotation(0.05, fill_mode="nearest", name="aug_small_rotation"),
        tf.keras.layers.RandomZoom(0.08, fill_mode="nearest", name="aug_small_zoom"),
        tf.keras.layers.RandomTranslation(0.05, 0.05, fill_mode="nearest", name="aug_small_translation"),
    ], name="data_augmentation")


def build_mobilenet_model(
    num_classes: int,
    input_shape: Tuple[int, int, int] = (224, 224, 3),
    dropout_rate: float = 0.3
):
    """Constructs MobileNetV2 transfer learning model with custom classification head.

    Args:
        num_classes: Number of disease categories detected dynamically.
        input_shape: Input spatial dimensions (default 224x224x3).
        dropout_rate: Dropout rate for regularization (default 0.3).

    Returns:
        (full_model, base_mobilenet_model)
    """
    import tensorflow as tf
    from tensorflow.keras import layers, models
    from tensorflow.keras.applications import MobileNetV2

    base_model = MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"
    )
    # Stage 1: Freeze base model
    base_model.trainable = False

    inputs = layers.Input(shape=input_shape, name="input_leaf_tensor")
    # Data Augmentation (active only during training)
    aug = build_data_augmentation()(inputs)
    # Normalization to [-1.0, 1.0] identical to inference utils/preprocessing.py
    norm = layers.Rescaling(scale=1.0 / 127.5, offset=-1.0, name="mobilenetv2_rescaling")(aug)

    x = base_model(norm, training=False)
    x = layers.GlobalAveragePooling2D(name="global_average_pool")(x)
    x = layers.Dropout(dropout_rate, name="head_dropout")(x)
    outputs = layers.Dense(num_classes, activation="softmax", name="disease_classification_head")(x)

    full_model = models.Model(inputs=inputs, outputs=outputs, name="KisaanSathi_MobileNetV2")
    return full_model, base_model


def configure_fine_tuning(full_model, base_model, unfreeze_layers: int = 30):
    """Unfreezes top N layers of the MobileNetV2 base for Stage 2 fine-tuning."""
    base_model.trainable = True

    total_layers = len(base_model.layers)
    cutoff = max(0, total_layers - unfreeze_layers)

    for i, layer in enumerate(base_model.layers):
        # Freeze BatchNormalization layers to preserve moving statistics
        if "BatchNormalization" in layer.__class__.__name__:
            layer.trainable = False
        elif i < cutoff:
            layer.trainable = False
        else:
            layer.trainable = True

    trainable_count = sum(np.prod(p.shape) for p in full_model.trainable_weights)
    frozen_count = sum(np.prod(p.shape) for p in full_model.non_trainable_weights)
    return trainable_count, frozen_count


def load_datasets(
    data_dir: Path,
    processed_dir: Path,
    batch_size: int = 32,
    img_size: int = 224,
    seed: int = 42
):
    """Loads training, validation, and test datasets either from processed directories or raw directory."""
    import tensorflow as tf

    train_dir = processed_dir / "train"
    val_dir = processed_dir / "val"
    test_dir = processed_dir / "test"

    # Case A: Pre-split physical directories exist
    if train_dir.exists() and val_dir.exists() and test_dir.exists():
        print("[+] Loading from pre-split directories in:", processed_dir)
        train_ds = tf.keras.utils.image_dataset_from_directory(
            train_dir,
            image_size=(img_size, img_size),
            batch_size=batch_size,
            label_mode="categorical",
            shuffle=True,
            seed=seed
        )
        val_ds = tf.keras.utils.image_dataset_from_directory(
            val_dir,
            image_size=(img_size, img_size),
            batch_size=batch_size,
            label_mode="categorical",
            shuffle=False
        )
        test_ds = tf.keras.utils.image_dataset_from_directory(
            test_dir,
            image_size=(img_size, img_size),
            batch_size=batch_size,
            label_mode="categorical",
            shuffle=False
        )
        class_names = train_ds.class_names
        return train_ds, val_ds, test_ds, class_names

    # Case B: Load from raw directory with dynamic train/val/test split
    if not data_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found at {data_dir.resolve()}")

    print("[+] Loading dataset from raw directory with 80/10/10 split:", data_dir)
    # 80% train, 20% holdout
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.20,
        subset="training",
        seed=seed,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="categorical"
    )
    holdout_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.20,
        subset="validation",
        seed=seed,
        image_size=(img_size, img_size),
        batch_size=batch_size,
        label_mode="categorical"
    )

    class_names = train_ds.class_names
    # Split the 20% holdout evenly into 10% validation and 10% test
    holdout_batches = holdout_ds.cardinality().numpy()
    val_batches = max(1, holdout_batches // 2)

    val_ds = holdout_ds.take(val_batches)
    test_ds = holdout_ds.skip(val_batches)

    # Performance optimization: prefetch
    autotune = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=autotune)
    val_ds = val_ds.prefetch(buffer_size=autotune)
    test_ds = test_ds.prefetch(buffer_size=autotune)

    return train_ds, val_ds, test_ds, class_names


def plot_training_history(history1, history2, output_path: Path):
    """Generates dual-phase training curve plot (Accuracy and Loss)."""
    acc = history1.history["accuracy"] + (history2.history["accuracy"] if history2 else [])
    val_acc = history1.history["val_accuracy"] + (history2.history["val_accuracy"] if history2 else [])
    loss = history1.history["loss"] + (history2.history["loss"] if history2 else [])
    val_loss = history1.history["val_loss"] + (history2.history["val_loss"] if history2 else [])

    stage1_len = len(history1.history["accuracy"])

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy Plot
    ax1.plot(acc, label="Training Accuracy", color="#10b981", lw=2)
    ax1.plot(val_acc, label="Validation Accuracy", color="#0284c7", lw=2)
    if history2:
        ax1.axvline(x=stage1_len - 1, color="#f59e0b", linestyle="--", label="Start Fine-Tuning (Stage 2)")
    ax1.set_title("KisaanSathi MobileNetV2: Accuracy", fontsize=13, fontweight="bold")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Accuracy")
    ax1.grid(True, alpha=0.3)
    ax1.legend()

    # Loss Plot
    ax2.plot(loss, label="Training Loss", color="#ef4444", lw=2)
    ax2.plot(val_loss, label="Validation Loss", color="#8b5cf6", lw=2)
    if history2:
        ax2.axvline(x=stage1_len - 1, color="#f59e0b", linestyle="--", label="Start Fine-Tuning (Stage 2)")
    ax2.set_title("KisaanSathi MobileNetV2: Categorical Cross-Entropy Loss", fontsize=13, fontweight="bold")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Loss")
    ax2.grid(True, alpha=0.3)
    ax2.legend()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    plt.tight_layout()
    plt.savefig(output_path, dpi=200)
    plt.close()
    print(f"[+] Saved training history curve to: {output_path.resolve()}")


def run_training_pipeline(args: argparse.Namespace):
    """Executes the complete two-stage transfer learning pipeline."""
    try:
        import tensorflow as tf
    except ImportError:
        print("\n[!] TensorFlow is not installed in the local environment.")
        print("    To run training, please execute on Google Colab or an environment with TensorFlow:")
        print("      pip install tensorflow\n")
        sys.exit(1)

    tf.random.set_seed(args.seed)
    np.random.seed(args.seed)

    model_dir = Path(args.model_dir)
    reports_dir = Path(args.reports_dir)
    model_dir.mkdir(parents=True, exist_ok=True)
    reports_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 65)
    print("🌾 KisaanSathi MobileNetV2 Transfer Learning Pipeline")
    print("=" * 65)
    print(f"Data Directory       : {args.data_dir}")
    print(f"Processed Directory  : {args.processed_dir}")
    print(f"Model Save Directory : {args.model_dir}")
    print(f"Reports Directory    : {args.reports_dir}")
    print(f"Batch Size           : {args.batch_size}")
    print(f"Image Resolution     : ({args.img_size}, {args.img_size})")
    print(f"Stage 1 Epochs / LR  : {args.stage1_epochs} / {args.lr_stage1}")
    print(f"Stage 2 Epochs / LR  : {args.stage2_epochs} / {args.lr_stage2} (Unfreeze {args.unfreeze_layers} layers)")
    print("-" * 65)

    # Step 1: Load Data
    data_path = Path(args.data_dir)
    proc_path = Path(args.processed_dir)

    if not data_path.exists() and not (proc_path / "train").exists():
        print(f"\n[!] Dataset not found at '{args.data_dir}'.")
        print("    Please place the PlantVillage dataset inside data/raw/PlantVillage.")
        print("    You can run training via Google Colab with GPU acceleration.")
        return

    train_ds, val_ds, test_ds, class_names = load_datasets(
        data_dir=data_path,
        processed_dir=proc_path,
        batch_size=args.batch_size,
        img_size=args.img_size,
        seed=args.seed
    )

    num_classes = len(class_names)
    print(f"\n[+] Detected {num_classes} Disease Categories:")
    for idx, name in enumerate(class_names):
        print(f"    [{idx:02d}] {name}")

    # Save class names mapping JSON
    class_names_path = model_dir / "class_names.json"
    class_mapping = {idx: name for idx, name in enumerate(class_names)}
    with open(class_names_path, "w", encoding="utf-8") as f:
        json.dump(class_mapping, f, indent=2)
    print(f"[+] Saved class names mapping to: {class_names_path.resolve()}")

    # Step 2: Build Model
    model, base_model = build_mobilenet_model(
        num_classes=num_classes,
        input_shape=(args.img_size, args.img_size, 3)
    )

    # Step 3: STAGE 1 - Feature Extraction
    print("\n" + "=" * 65)
    print(f"🚀 STAGE 1: Feature Extraction (MobileNetV2 Base FROZEN)")
    print("=" * 65)

    trainable_p = sum(np.prod(p.shape) for p in model.trainable_weights)
    frozen_p = sum(np.prod(p.shape) for p in model.non_trainable_weights)
    print(f"Trainable Parameters : {trainable_p:,}")
    print(f"Frozen Parameters    : {frozen_p:,}")

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=args.lr_stage1),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    stage1_checkpoint = model_dir / "crop_disease_model_stage1.keras"
    callbacks_s1 = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=str(stage1_checkpoint),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        ),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=2,
            min_lr=1e-6,
            verbose=1
        )
    ]

    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.stage1_epochs,
        callbacks=callbacks_s1
    )

    # Step 4: STAGE 2 - Fine-Tuning
    history2 = None
    if args.stage2_epochs > 0:
        print("\n" + "=" * 65)
        print(f"🚀 STAGE 2: Fine-Tuning (Unfreezing Upper {args.unfreeze_layers} Layers)")
        print("=" * 65)

        trainable_p, frozen_p = configure_fine_tuning(model, base_model, unfreeze_layers=args.unfreeze_layers)
        print(f"Trainable Parameters (Stage 2) : {trainable_p:,}")
        print(f"Frozen Parameters (Stage 2)    : {frozen_p:,}")

        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=args.lr_stage2),
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )

        final_model_path = model_dir / "crop_disease_model.keras"
        callbacks_s2 = [
            tf.keras.callbacks.ModelCheckpoint(
                filepath=str(final_model_path),
                monitor="val_accuracy",
                save_best_only=True,
                verbose=1
            ),
            tf.keras.callbacks.EarlyStopping(
                monitor="val_loss",
                patience=5,
                restore_best_weights=True,
                verbose=1
            ),
            tf.keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss",
                factor=0.2,
                patience=2,
                min_lr=1e-7,
                verbose=1
            )
        ]

        history2 = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=args.stage2_epochs,
            callbacks=callbacks_s2
        )
    else:
        final_model_path = model_dir / "crop_disease_model.keras"
        model.save(final_model_path)

    # Step 5: Save History Plots
    history_plot_path = reports_dir / "training_history.png"
    plot_training_history(history1, history2, history_plot_path)

    # Step 6: Final Evaluation on Independent Test Set
    print("\n" + "=" * 65)
    print("📊 Evaluating Final Model on Independent TEST Set")
    print("=" * 65)
    test_loss, test_acc = model.evaluate(test_ds, verbose=1)
    val_loss, val_acc = model.evaluate(val_ds, verbose=0)

    print(f"\nFinal Validation Accuracy : {val_acc * 100:.2f}%")
    print(f"Final Test Accuracy (Holdout): {test_acc * 100:.2f}%")

    # Record summary
    results_summary = {
        "model_architecture": "MobileNetV2",
        "num_classes": num_classes,
        "classes": class_names,
        "stage1_epochs": args.stage1_epochs,
        "stage2_epochs": args.stage2_epochs,
        "final_validation_accuracy": round(float(val_acc), 4),
        "final_test_accuracy": round(float(test_acc), 4),
        "model_path": str(final_model_path.resolve()),
        "class_names_path": str(class_names_path.resolve())
    }
    with open(reports_dir / "test_results.json", "w", encoding="utf-8") as f:
        json.dump(results_summary, f, indent=2)

    print(f"[+] Model saved to: {final_model_path.resolve()}")
    print("=" * 65 + "\n")


def main() -> None:
    args = parse_arguments()
    run_training_pipeline(args)


if __name__ == "__main__":
    main()
