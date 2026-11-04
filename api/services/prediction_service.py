"""Prediction Service: Coordinates inference, Grad-CAM, and scan persistence."""

from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ml.inference.predictor import CropDiseasePredictor
from database.models import Scan
from utils.logger import logger

# Singleton predictor instance in memory to avoid repeated model loading
_predictor_instance: Optional[CropDiseasePredictor] = None


def get_predictor() -> CropDiseasePredictor:
    """Returns singleton CropDiseasePredictor instance."""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = CropDiseasePredictor()
    return _predictor_instance


def process_leaf_prediction(
    image_bytes: bytes,
    db: Optional[Session] = None,
    notes: Optional[str] = None
) -> Dict[str, Any]:
    """Processes leaf image through ML model, computes Grad-CAM, and saves to database.

    Args:
        image_bytes: Binary contents of leaf photograph.
        db: Optional SQLAlchemy database session.
        notes: Optional farmer notes.

    Returns:
        Structured prediction result dictionary.
    """
    predictor = get_predictor()
    result = predictor.predict(image_bytes)

    # Persist scan history if database session is available
    if db is not None:
        try:
            scan_record = Scan(
                crop_name=result["crop"],
                disease_name=result["disease_name"],
                confidence=result["confidence"],
                is_healthy=result["is_healthy"],
                notes=notes,
            )
            db.add(scan_record)
            db.commit()
            db.refresh(scan_record)
            result["scan_id"] = scan_record.id
            logger.info("Persisted scan record with ID: %d", scan_record.id)
        except Exception as exc:
            db.rollback()
            logger.error("Failed to persist scan record: %s", str(exc))
            result["scan_id"] = None
    else:
        result["scan_id"] = None

    return result
