"""Prediction Service: Coordinates inference, Grad-CAM, and scan persistence."""

import hashlib
from collections import OrderedDict
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from ml.inference.predictor import CropDiseasePredictor
from database.models import Scan
from utils.logger import logger

# Singleton predictor instance in memory to avoid repeated model loading
_predictor_instance: Optional[CropDiseasePredictor] = None

# High-speed LRU memory cache for fast repeated showcase & viva demonstration scans
_PREDICTION_CACHE: "OrderedDict[str, Dict[str, Any]]" = OrderedDict()
_MAX_CACHE_ENTRIES = 50


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
    # Check LRU cache for ultra-fast repeated inference (<1ms)
    img_hash = hashlib.sha256(image_bytes).hexdigest()
    if img_hash in _PREDICTION_CACHE:
        cached_result = dict(_PREDICTION_CACHE[img_hash])
        _PREDICTION_CACHE.move_to_end(img_hash)
        logger.info("Serving prediction from high-speed memory cache (hash: %s...)", img_hash[:8])
        result = dict(cached_result)
    else:
        predictor = get_predictor()
        result = predictor.predict(image_bytes)
        # Store in LRU cache
        _PREDICTION_CACHE[img_hash] = dict(result)
        if len(_PREDICTION_CACHE) > _MAX_CACHE_ENTRIES:
            _PREDICTION_CACHE.popitem(last=False)

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
