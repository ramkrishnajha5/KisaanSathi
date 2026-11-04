"""Prediction and Scan History API routes."""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import Scan
from api.services.prediction_service import process_leaf_prediction

router = APIRouter(prefix="/api/v1", tags=["Prediction & Crop Health"])


class TreatmentResponse(BaseModel):
    organic: Optional[str] = None
    chemical: Optional[str] = None


class PredictionResponse(BaseModel):
    scan_id: Optional[int] = None
    crop: str
    disease_name: str
    hindi_name: Optional[str] = None
    is_healthy: bool
    confidence: float
    cause: Optional[str] = None
    symptoms: Optional[str] = None
    treatment: TreatmentResponse
    prevention: Optional[str] = None
    gradcam_image_base64: Optional[str] = None
    mode: str
    model: Optional[str] = None


class ScanHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    timestamp: str
    crop_name: str
    disease_name: str
    confidence: float
    is_healthy: bool
    notes: Optional[str] = None


@router.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
async def predict_crop_disease(
    file: UploadFile = File(..., description="Leaf image file (.jpg, .jpeg, .png, .webp)"),
    notes: Optional[str] = Form(None, description="Optional notes from farmer"),
    db: Session = Depends(get_db),
):
    """Diagnoses a crop leaf image, provides treatments, and returns Grad-CAM visual heatmap."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Uploaded file type '{file.content_type}' is not a valid image.",
        )

    try:
        image_bytes = await file.read()
        result = process_leaf_prediction(image_bytes=image_bytes, db=db, notes=notes)
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference pipeline error: {str(exc)}",
        )


@router.get("/history", response_model=List[ScanHistoryItem])
def get_scan_history(limit: int = 20, db: Session = Depends(get_db)):
    """Retrieves recent crop health diagnosis history from SQLite database."""
    scans = db.query(Scan).order_by(Scan.timestamp.desc()).limit(limit).all()
    # Format timestamp for JSON serialization
    results = [
        ScanHistoryItem(
            id=s.id,
            timestamp=s.timestamp.strftime("%Y-%m-%d %H:%M:%S") if s.timestamp else "",
            crop_name=s.crop_name,
            disease_name=s.disease_name,
            confidence=s.confidence,
            is_healthy=s.is_healthy,
            notes=s.notes,
        )
        for s in scans
    ]
    return results
