"""PlantVillage Dataset Inspection and Quality Assessment Utility for KisaanSathi.

Features:
- Discovers class subdirectories dynamically
- Supports class filtering / exclusion (e.g. Background_without_leaves)
- Validates image integrity and identifies corrupted/unsupported files
- Analyzes spatial resolutions (width, height, aspect ratios)
- Computes class imbalance ratios and distribution metrics across usable classes
- Generates structured JSON reports and clean terminal summaries
"""

import argparse
import json
import os
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


def inspect_dataset(
    data_dir: str | Path,
    output_json: Optional[str | Path] = None,
    verify_images: bool = True,
    exclude_classes: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Inspects a dataset directory and generates a comprehensive quality report.

    Args:
        data_dir: Root directory containing class subdirectories.
        output_json: Optional path to save structured summary JSON.
        verify_images: If True, opens and verifies file integrity using PIL.
        exclude_classes: Optional list of class folder names to exclude from usable classes.

    Returns:
        Dictionary containing classes, counts, dimensions, imbalance, and corruption details.
    """
    root_path = Path(data_dir)
    if not root_path.exists():
        raise FileNotFoundError(f"Dataset directory not found at: {root_path.resolve()}")

    if exclude_classes is None:
        exclude_classes = list(DEFAULT_EXCLUDE_CLASSES)

    # Find class folders (subdirectories with images or nested subdirectories)
    candidate_subdirs = [p for p in root_path.iterdir() if p.is_dir() and not p.name.startswith(".")]

    # If the folder contains only one child directory, drill in
    if len(candidate_subdirs) == 1 and not any(
        any(f.suffix.lower() in SUPPORTED_EXTENSIONS for f in candidate_subdirs[0].glob("*"))
    ):
        inner = candidate_subdirs[0]
        inner_subdirs = [p for p in inner.iterdir() if p.is_dir() and not p.name.startswith(".")]
        if len(inner_subdirs) > 1:
            candidate_subdirs = inner_subdirs
            root_path = inner

    all_subdirs = sorted(candidate_subdirs, key=lambda p: p.name)

    if not all_subdirs:
        return {
            "status": "empty",
            "data_dir": str(root_path.resolve()),
            "total_classes": 0,
            "usable_classes_count": 0,
            "total_images": 0,
            "message": f"No class subdirectories found inside {root_path.resolve()}"
        }

    usable_subdirs = [d for d in all_subdirs if d.name not in exclude_classes]
    excluded_subdirs = [d for d in all_subdirs if d.name in exclude_classes]

    class_counts: Dict[str, int] = {}
    excluded_counts: Dict[str, int] = {}
    corrupted_files: List[Dict[str, str]] = []
    unsupported_files: List[Dict[str, str]] = []
    dimensions: List[Tuple[int, int]] = []
    color_modes: Dict[str, int] = {}

    # Inspect usable classes
    for class_dir in usable_subdirs:
        class_name = class_dir.name
        valid_count = 0

        for file_path in class_dir.iterdir():
            if file_path.is_dir() or file_path.name.startswith("."):
                continue

            ext = file_path.suffix.lower()
            if ext not in SUPPORTED_EXTENSIONS:
                unsupported_files.append({
                    "file": str(file_path.relative_to(root_path)),
                    "reason": f"Unsupported extension '{ext}'"
                })
                continue

            if verify_images:
                try:
                    with Image.open(file_path) as img:
                        img.verify()
                    with Image.open(file_path) as img:
                        if len(dimensions) < 500:  # Sample dimensions for efficiency on 54k images
                            dimensions.append(img.size)
                        color_modes[img.mode] = color_modes.get(img.mode, 0) + 1
                    valid_count += 1
                except Exception as exc:
                    corrupted_files.append({
                        "file": str(file_path.relative_to(root_path)),
                        "reason": str(exc)
                    })
            else:
                valid_count += 1

        class_counts[class_name] = valid_count

    # Count excluded folders
    for class_dir in excluded_subdirs:
        class_name = class_dir.name
        c = len([f for f in class_dir.iterdir() if f.is_file() and f.suffix.lower() in SUPPORTED_EXTENSIONS])
        excluded_counts[class_name] = c

    total_usable_images = sum(class_counts.values())
    total_excluded_images = sum(excluded_counts.values())
    counts_list = list(class_counts.values())
    min_count = min(counts_list) if counts_list else 0
    max_count = max(counts_list) if counts_list else 0
    avg_count = (total_usable_images / len(class_counts)) if class_counts else 0.0

    imbalance_ratio = (max_count / min_count) if min_count > 0 else float("inf")

    dimension_summary: Dict[str, Any] = {}
    if dimensions:
        widths = [d[0] for d in dimensions]
        heights = [d[1] for d in dimensions]
        dimension_summary = {
            "min_dimension": [min(widths), min(heights)],
            "max_dimension": [max(widths), max(heights)],
            "sample_common": list(dict.fromkeys(dimensions[:10])),
            "color_modes": color_modes
        }

    report: Dict[str, Any] = {
        "status": "ready" if total_usable_images > 0 else "empty",
        "data_dir": str(root_path.resolve()),
        "total_folders_discovered": len(all_subdirs),
        "total_classes": len(class_counts),
        "usable_classes_count": len(class_counts),
        "excluded_classes_count": len(excluded_subdirs),
        "excluded_classes": excluded_counts,
        "total_images": total_usable_images,
        "total_usable_images": total_usable_images,
        "total_excluded_images": total_excluded_images,
        "classes": class_counts,
        "imbalance": {
            "min_images_per_class": min_count,
            "max_images_per_class": max_count,
            "avg_images_per_class": round(avg_count, 1),
            "imbalance_ratio": round(imbalance_ratio, 2) if min_count > 0 else "N/A"
        },
        "dimensions": dimension_summary,
        "corrupted_images_count": len(corrupted_files),
        "corrupted_files_sample": corrupted_files[:20],
        "unsupported_files_count": len(unsupported_files),
    }

    if output_json:
        out_path = Path(output_json)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

    return report


def print_inspection_report(report: Dict[str, Any]) -> None:
    """Pretty-prints dataset inspection findings to stdout."""
    print("\n" + "=" * 70)
    print("🌾 KisaanSathi PlantVillage Dataset Quality Inspection Report")
    print("=" * 70)
    print(f"Data Directory         : {report.get('data_dir')}")
    print(f"Total Folders          : {report.get('total_folders_discovered')}")
    print(f"Usable Plant Classes   : {report.get('usable_classes_count')}")
    print(f"Excluded Classes       : {report.get('excluded_classes_count')} {list(report.get('excluded_classes', {}).keys())}")
    print(f"Total Usable Images    : {report.get('total_usable_images'):,}")
    print(f"Total Excluded Images  : {report.get('total_excluded_images'):,}")
    print(f"Corrupted Images       : {report.get('corrupted_images_count')}")
    print(f"Unsupported Files      : {report.get('unsupported_files_count')}")

    imbalance = report.get("imbalance", {})
    print("-" * 70)
    print("Class Balance (38 Usable Classes):")
    print(f"  • Min Images/Class   : {imbalance.get('min_images_per_class')}")
    print(f"  • Max Images/Class   : {imbalance.get('max_images_per_class')}")
    print(f"  • Avg Images/Class   : {imbalance.get('avg_images_per_class')}")
    print(f"  • Imbalance Ratio    : {imbalance.get('imbalance_ratio')}x (Max / Min)")

    dims = report.get("dimensions", {})
    if dims:
        print("-" * 70)
        print("Image Characteristics:")
        print(f"  • Sample Resolution  : {dims.get('min_dimension')} to {dims.get('max_dimension')}")
        print(f"  • Color Modes        : {dims.get('color_modes')}")

    classes = report.get("classes", {})
    if classes:
        print("-" * 70)
        print(f"Usable Classes ({len(classes)}):")
        for i, (cls_name, count) in enumerate(classes.items(), 1):
            print(f"  [{i:02d}] {cls_name:<45} : {count:>5} images")

    print("=" * 70 + "\n")


def main() -> None:
    """CLI entry point for dataset inspection."""
    parser = argparse.ArgumentParser(description="KisaanSathi Dataset Inspection Tool")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="data/raw/PlantVillage",
        help="Path to dataset directory containing class sub-folders (default: data/raw/PlantVillage)"
    )
    parser.add_argument(
        "--output-json",
        type=str,
        default="reports/dataset_summary.json",
        help="Path to save JSON summary report (default: reports/dataset_summary.json)"
    )
    parser.add_argument(
        "--exclude-classes",
        nargs="*",
        default=["Background_without_leaves"],
        help="Class directory names to exclude (default: Background_without_leaves)"
    )
    parser.add_argument(
        "--no-verify",
        action="store_true",
        help="Skip deep PIL image verification for faster directory scanning"
    )

    args = parser.parse_args()
    data_path = Path(args.data_dir)

    if not data_path.exists():
        print(f"\n[!] Dataset directory not found at: '{args.data_dir}'")
        sys.exit(1)

    report = inspect_dataset(
        data_dir=args.data_dir,
        output_json=args.output_json,
        verify_images=not args.no_verify,
        exclude_classes=args.exclude_classes
    )
    print_inspection_report(report)


if __name__ == "__main__":
    main()
