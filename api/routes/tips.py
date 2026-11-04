from typing import List, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import FarmingTip

router = APIRouter(prefix="/api/v1/tips", tags=["Farming Tips & Knowledge"])


class FarmingTipResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    title: str
    content: str
    season: Optional[str] = None


@router.get("/", response_model=List[FarmingTipResponse])
def get_farming_tips(
    category: Optional[str] = None,
    season: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieves educational agronomic tips and seasonal best practices."""
    query = db.query(FarmingTip)
    if category:
        query = query.filter(FarmingTip.category.ilike(f"%{category}%"))
    if season:
        query = query.filter(FarmingTip.season.ilike(f"%{season}%"))
    return query.limit(50).all()
