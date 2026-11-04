"""Reproducible Stratified Dataset Splitting Pipeline for KisaanSathi.

Splits PlantVillage dataset into:
- 80% Training
- 10% Validation
- 10% Testing

Key Principles:
- Filters out non-plant categories (e.g. Background_without_leaves)
- Stratified per class to maintain identical class ratios across splits
- Deterministic reproducibility using random seed 42
- Zero data leakage between partitions
- Generates comprehensive CSV manifests + class_names.json
- Constructs physical train/val/test directory hierarchies via hardlinks or copies
- NEVER alters or modifies the source dataset
"""

import argparse
import csv
import json
import os
import random
import shutil
import sys
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional
from PIL import Image

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
DEFAULT_EXCLUDE_CLASSES = ["Background_without_leaves"]


def split_dataset(
    data_dir: str | Path,
    output_dir: str | Path = "data/processed",
    train_ratio: float = 0.80,
    val_ratio: float = 0.10,
    test_ratio: float = 0.10,
    seed: int = 42,
    create_dirs: bool = True,
    copy_files: bool = False,
    verify_images: bool = False,
    exclude_classes: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Performs a reproducible stratified split of class image directories.

    Args:
        data_dir: Root directory containing class subdirectories.
        output_dir: Destination directory for manifests and processed partitions.
        train_ratio: Proportion of images for training (default 0.80).
        val_ratio: Proportion of images for validation (default 0.10).
        test_ratio: Proportion of images for testing (default 0.10).
        seed: Random seed for deterministic reproducibility (default 42).
        create_dirs: If True, organizes files into train/val/test subdirectories.
        copy_files: If True, copies files instead of creating hardlinks.
        verify_images: If True, verifies image integrity with PIL.
        exclude_classes: Optional list of class names to exclude (e.g. Background_without_leaves).

    Returns:
        Structured dictionary containing summary of splits per class.
    """
    if abs((train_ratio + val_ratio + test_ratio) - 1.0) > 1e-5:
        raise ValueError(f"Ratios must sum to 1.0. Given: {train_ratio} + {val_ratio} + {test_ratio}")

    root_path = Path(data_dir)
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    if not root_path.exists():
        raise FileNotFoundError(f"Dataset root directory not found: {root_path.resolve()}")

    if exclude_classes is None:
        exclude_classes = list(DEFAULT_EXCLUDE_CLASSES)

    # Discover candidate subdirectories
    candidate_subdirs = [p for p in root_path.iterdir() if p.is_dir() and not p.name.startswith(".")]

    # Drill down if single wrapper folder
    if len(candidate_subdirs) == 1 and not any(
        any(f.suffix.lower() in SUPPORTED_EXTENSIONS for f in candidate_subdirs[0].glob("*"))
    ):
        inner = candidate_subdirs[0]
        inner_subdirs = [p for p in inner.iterdir() if p.is_dir() and not p.name.startswith(".")]
        if len(inner_subdirs) > 1:
            candidate_subdirs = inner_subdirs
            root_path = inner

    # Filter out excluded classes (e.g. Background_without_leaves)
    usable_subdirs = sorted(
        [d for d in candidate_subdirs if d.name not in exclude_classes],
        key=lambda p: p.name
    )
    excluded_subdirs = [d for d in candidate_subdirs if d.name in exclude_classes]

    if not usable_subdirs:
        raise ValueError(f"No usable class folders discovered in '{root_path.resolve()}'.")

    # Set random seed for complete determinism
    rng = random.Random(seed)

    # Map class names alphabetically to establish canonical 0..N-1 indices
    class_names = [d.name for d in usable_subdirs]
    class_to_idx = {name: idx for idx, name in enumerate(class_names)}
    idx_to_class = {str(idx): name for idx, name in enumerate(class_names)}

    split_records: Dict[str, List[Dict[str, Any]]] = {
        "train": [],
        "val": [],
        "test": []
    }
    all_manifest_records: List[Dict[str, Any]] = []
    class_split_counts: Dict[str, Dict[str, int]] = {}

    for class_dir in usable_subdirs:
        class_name = class_dir.name
        class_idx = class_to_idx[class_name]

        # Gather all valid image files
        candidates = [
            f for f in class_dir.iterdir()
            if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS and not f.name.startswith(".")
        ]
        # Sort by filename first to guarantee exact ordering before shuffling
        candidates.sort(key=lambda p: p.name)

        images = []
        for f in candidates:
            if verify_images:
                try:
                    with Image.open(f) as img:
                        img.verify()
                    images.append(f)
                except Exception:
                    continue
            else:
                images.append(f)

        # Deterministic shuffle
        rng.shuffle(images)

        total_cls = len(images)
        if total_cls == 0:
            continue

        n_train = int(total_cls * train_ratio)
        n_val = int(total_cls * val_ratio)
        n_test = total_cls - n_train - n_val

        # Edge case guard for small classes
        if total_cls >= 3 and n_test == 0:
            n_test = 1
            if n_train > n_val:
                n_train -= 1
            else:
                n_val -= 1

        train_imgs = images[:n_train]
        val_imgs = images[n_train:n_train + n_val]
        test_imgs = images[n_train + n_val:]

        for split_key, img_list in [("train", train_imgs), ("val", val_imgs), ("test", test_imgs)]:
            for img in img_list:
                record = {
                    "image_path": str(img.resolve()),
                    "relative_path": str(img.relative_to(root_path.parent if root_path.parent.name else root_path)),
                    "class_name": class_name,
                    "class_index": class_idx,
                    "split": split_key
                }
                split_records[split_key].append(record)
                all_manifest_records.append(record)

        class_split_counts[class_name] = {
            "total": total_cls,
            "train": len(train_imgs),
            "val": len(val_imgs),
            "test": len(test_imgs)
        }

    # Write split CSV manifests
    manifest_paths: Dict[str, str] = {}
    fieldnames = ["image_path", "relative_path", "class_name", "class_index", "split"]

    for split_name in ["train", "val", "test"]:
        manifest_file = out_path / f"{split_name}_manifest.csv"
        records = split_records[split_name]
        with open(manifest_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(records)
        manifest_paths[split_name] = str(manifest_file.resolve())

    # Write Master Manifest (all 38 classes combined)
    master_manifest_file = out_path / "dataset_manifest.csv"
    with open(master_manifest_file, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_manifest_records)
    manifest_paths["master"] = str(master_manifest_file.resolve())

    # Save class_names.json (in data/processed/ and ml/models/)
    class_names_file = out_path / "class_names.json"
    with open(class_names_file, "w", encoding="utf-8") as f:
        json.dump(idx_to_class, f, indent=2)

    models_dir = Path("ml/models")
    models_dir.mkdir(parents=True, exist_ok=True)
    models_class_names_file = models_dir / "class_names.json"
    with open(models_class_names_file, "w", encoding="utf-8") as f:
        json.dump(idx_to_class, f, indent=2)

    # Save class_indices.json (class_name -> integer)
    class_indices_file = out_path / "class_indices.json"
    with open(class_indices_file, "w", encoding="utf-8") as f:
        json.dump(class_to_idx, f, indent=2)

    # Construct physical directories (train/, val/, test/)
    if create_dirs:
        for split_name in ["train", "val", "test"]:
            for item in split_records[split_name]:
                dest_dir = out_path / split_name / item["class_name"]
                dest_dir.mkdir(parents=True, exist_ok=True)
                src = Path(item["image_path"])
                dest = dest_dir / src.name

                if dest.exists():
                    continue

                if copy_files:
                    shutil.copy2(src, dest)
                else:
                    try:
                        # Attempt hardlink (instant, 0 extra disk, read-compatible)
                        os.link(src, dest)
                    except (OSError, NotImplementedError):
                        # Fallback to copy if cross-device or permission restricted
                        shutil.copy2(src, dest)

    total_images_processed = sum(len(r) for r in split_records.values())

    summary: Dict[str, Any] = {
        "status": "success",
        "seed": seed,
        "train_ratio": train_ratio,
        "val_ratio": val_ratio,
        "test_ratio": test_ratio,
        "total_classes": len(class_names),
        "usable_classes_count": len(class_names),
        "excluded_classes_count": len(excluded_subdirs),
        "excluded_classes": [d.name for d in excluded_subdirs],
        "total_images": total_images_processed,
        "total_usable_images": total_images_processed,
        "split_counts": {
            "train": len(split_records["train"]),
            "val": len(split_records["val"]),
            "test": len(split_records["test"]),
        },
        "class_counts": class_split_counts,
        "manifests": manifest_paths,
        "class_names_file": str(class_names_file.resolve()),
        "models_class_names_file": str(models_class_names_file.resolve()),
        "processed_dir": str(out_path.resolve())
    }

    # Save summary report
    reports_dir = Path("reports")
    reports_dir.mkdir(parents=True, exist_ok=True)
    with open(reports_dir / "split_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    return summary


def print_split_summary(summary: Dict[str, Any]) -> None:
    """Prints a clear terminal summary of split statistics."""
    print("\n" + "=" * 70)
    print("🌾 KisaanSathi Reproducible Dataset Split Completed")
    print("=" * 70)
    print(f"Random Seed           : {summary.get('seed')}")
    print(f"Usable Classes        : {summary.get('usable_classes_count')}")
    print(f"Excluded Classes      : {summary.get('excluded_classes_count')} {summary.get('excluded_classes')}")
    print(f"Total Usable Images   : {summary.get('total_usable_images'):,}")
    counts = summary.get("split_counts", {})
    total = summary.get("total_usable_images", 1) or 1
    tr = counts.get("train", 0)
    va = counts.get("val", 0)
    te = counts.get("test", 0)
    print("-" * 70)
    print(f"  • Training Set (80%)      : {tr:>6} images ({tr/total*100:.2f}%)")
    print(f"  • Validation Set (10%)    : {va:>6} images ({va/total*100:.2f}%)")
    print(f"  • Test Set (Holdout 10%)  : {te:>6} images ({te/total*100:.2f}%)")
    print("-" * 70)
    print("Artifacts Generated:")
    for split_k, p in summary.get("manifests", {}).items():
        print(f"  - {split_k:<8} manifest -> {p}")
    print(f"  - class_names.json     -> {summary.get('class_names_file')}")
    print(f"  - models class_names   -> {summary.get('models_class_names_file')}")
    print("=" * 70 + "\n")


def main() -> None:
    """CLI entry point for dataset splitting."""
    parser = argparse.ArgumentParser(description="KisaanSathi Reproducible Dataset Splitter")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/raw/PlantVillage",
        help="Path to raw dataset directory"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="data/processed",
        help="Path to save output manifests & splits (default: data/processed)"
    )
    parser.add_argument("--train-ratio", type=float, default=0.80, help="Train ratio (default: 0.80)")
    parser.add_argument("--val-ratio", type=float, default=0.10, help="Val ratio (default: 0.10)")
    parser.add_argument("--test-ratio", type=float, default=0.10, help="Test ratio (default: 0.10)")
    parser.add_argument("--seed", type=int, default=42, help="Reproducible random seed (default: 42)")
    parser.add_argument(
        "--exclude-classes",
        nargs="*",
        default=["Background_without_leaves"],
        help="Class directory names to exclude"
    )
    parser.add_argument(
        "--no-dirs",
        action="store_true",
        help="Do not create physical train/val/test directories (manifests only)"
    )
    parser.add_argument(
        "--copy-files",
        action="store_true",
        help="Copy files instead of creating hardlinks"
    )
    parser.add_argument(
        "--verify-images",
        action="store_true",
        help="Verify each image with PIL before splitting"
    )

    args = parser.parse_args()
    data_path = Path(args.data_dir)

    if not data_path.exists():
        print(f"\n[!] Dataset directory not found at: '{args.data_dir}'")
        sys.exit(1)

    try:
        summary = split_dataset(
            data_dir=args.data_dir,
            output_dir=args.output_dir,
            train_ratio=args.train_ratio,
            val_ratio=args.val_ratio,
            test_ratio=args.test_ratio,
            seed=args.seed,
            create_dirs=not args.no_dirs,
            copy_files=args.copy_files,
            verify_images=args.verify_images,
            exclude_classes=args.exclude_classes,
        )
        print_split_summary(summary)
    except Exception as exc:
        print(f"Error during splitting: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
