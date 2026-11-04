"""SQLAlchemy ORM Data Models for KisaanSathi.

Defines schemas for:
- Scan: History of crop disease diagnoses and Grad-CAM visualizations.
- DiseaseAdvisory: Curated agricultural knowledge base (symptoms, treatments, prevention).
- FarmingTip: Educational tips and agronomic advisories for farmers.
"""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from database.connection import Base


class Scan(Base):
    """Stores scan transactions submitted by farmers with predictions and heatmaps."""
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    is_healthy = Column(Boolean, nullable=False, default=False)
    image_path = Column(String(255), nullable=True)
    gradcam_path = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<Scan id={self.id} crop={self.crop_name} disease={self.disease_name} conf={self.confidence:.2f}>"


class DiseaseAdvisory(Base):
    """Curated knowledge base containing treatments and prevention measures for each disease."""
    __tablename__ = "disease_advisories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_id = Column(String(100), unique=True, nullable=False, index=True)
    crop = Column(String(50), nullable=False)
    disease_common_name = Column(String(100), nullable=False)
    disease_hindi_name = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    cause = Column(String(100), nullable=False)
    chemical_treatment = Column(Text, nullable=False)
    organic_treatment = Column(Text, nullable=False)
    prevention_advice = Column(Text, nullable=False)

    def __repr__(self) -> str:
        return f"<DiseaseAdvisory class_id={self.class_id} crop={self.crop}>"


class FarmingTip(Base):
    """Educational agronomic tips categorized by season and topic."""
    __tablename__ = "farming_tips"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String(50), nullable=False, index=True)  # Soil, Irrigation, Pest, Organic
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    season = Column(String(50), nullable=True)  # Kharif, Rabi, Zaid, All
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self) -> str:
        return f"<FarmingTip id={self.id} title={self.title[:30]}>"
