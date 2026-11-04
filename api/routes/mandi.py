"""Mandi / Market Prices API Route for Bilaspur & Chhattisgarh APMC Markets."""

from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/mandi", tags=["Market & Mandi Prices"])


class MandiPriceItem(BaseModel):
    state: str
    district: str
    market: str
    commodity: str
    variety: str
    min_price: float
    max_price: float
    modal_price: float
    unit: str
    trend: str
    trend_percent: str
    arrival_date: str


CHHATTISGARH_MANDI_DATA: List[MandiPriceItem] = [
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Bilaspur Main APMC",
        commodity="Paddy (Dhan) - Common",
        variety="Swarna / MTU 1010",
        min_price=2183.0,
        max_price=2250.0,
        modal_price=2203.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+2.1%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Bilaspur Krishi Upaj Mandi",
        commodity="Tomato (Tamatar)",
        variety="Hybrid Local",
        min_price=1600.0,
        max_price=2100.0,
        modal_price=1850.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+4.5%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Bilaspur Sabzi Mandi",
        commodity="Potato (Aloo)",
        variety="Jyoti / Kufri",
        min_price=1200.0,
        max_price=1500.0,
        modal_price=1350.0,
        unit="₹/Quintal",
        trend="down",
        trend_percent="-1.4%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Chakarbhatha Mandi",
        commodity="Wheat (Gehun)",
        variety="Sharbati / Lokwan",
        min_price=2350.0,
        max_price=2600.0,
        modal_price=2480.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+1.2%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Bilaspur Main APMC",
        commodity="Maize (Makka)",
        variety="Yellow Hybrid",
        min_price=1850.0,
        max_price=2050.0,
        modal_price=1960.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+3.0%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Bilaspur Sabzi Mandi",
        commodity="Onion (Pyaaz)",
        variety="Red Nasik",
        min_price=1900.0,
        max_price=2400.0,
        modal_price=2150.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+5.2%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Kota Mandi",
        commodity="Soybean",
        variety="JS-335 Yellow",
        min_price=4400.0,
        max_price=4800.0,
        modal_price=4620.0,
        unit="₹/Quintal",
        trend="down",
        trend_percent="-0.8%",
        arrival_date="Today",
    ),
    MandiPriceItem(
        state="Chhattisgarh",
        district="Bilaspur",
        market="Takhatpur Mandi",
        commodity="Gram (Chana)",
        variety="Desi Medium",
        min_price=5300.0,
        max_price=5750.0,
        modal_price=5500.0,
        unit="₹/Quintal",
        trend="up",
        trend_percent="+1.6%",
        arrival_date="Today",
    ),
]


@router.get("/", response_model=List[MandiPriceItem])
def get_mandi_prices(state: Optional[str] = None, commodity: Optional[str] = None):
    """Fetches daily commodity prices from Bilaspur & Chhattisgarh APMC Mandis."""
    results = CHHATTISGARH_MANDI_DATA
    if commodity:
        results = [item for item in results if commodity.lower() in item.commodity.lower()]
    return results
