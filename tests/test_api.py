"""Unit tests for FastAPI endpoints."""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from api.main import app
from database.connection import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Initializes the database schema before test execution."""
    init_db()


@pytest.fixture
def client():
    """Provides a TestClient within the application lifespan context."""
    with TestClient(app) as test_client:
        yield test_client


def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "KisaanSathi" in data["app"]


def test_predict_endpoint_valid_image(client):
    # Create test in-memory image
    img = Image.new("RGB", (250, 250), color=(80, 160, 40))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    response = client.post(
        "/api/v1/predict",
        files={"file": ("leaf.jpg", buf, "image/jpeg")},
        data={"notes": "Test leaf sample"},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "crop" in payload
    assert "disease_name" in payload
    assert "confidence" in payload
    assert "treatment" in payload
    assert payload["confidence"] > 0


def test_scan_history_endpoint(client):
    response = client.get("/api/v1/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_predict_real_samples(client):
    from pathlib import Path
    sample_blight = Path("data/samples/sample_early_blight.jpg")
    sample_healthy = Path("data/samples/sample_healthy.jpg")

    if sample_blight.exists():
        with open(sample_blight, "rb") as f:
            resp = client.post(
                "/api/v1/predict",
                files={"file": ("sample_early_blight.jpg", f.read(), "image/jpeg")},
                data={"notes": "Viva early blight sample test"},
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["crop"] == "Tomato"
        assert data["disease_name"] == "Early Blight"
        assert data["is_healthy"] is False
        assert data["scan_id"] is not None
        assert data["gradcam_image_base64"] is not None

    if sample_healthy.exists():
        with open(sample_healthy, "rb") as f:
            resp = client.post(
                "/api/v1/predict",
                files={"file": ("sample_healthy.jpg", f.read(), "image/jpeg")},
                data={"notes": "Viva healthy leaf sample test"},
            )
        assert resp.status_code == 200
        data = resp.json()
        assert data["crop"] == "Tomato"
        assert data["disease_name"] == "Healthy Leaf"
        assert data["is_healthy"] is True
        assert data["scan_id"] is not None


def test_predict_invalid_file_type(client):
    response = client.post(
        "/api/v1/predict",
        files={"file": ("document.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400
    assert "not a valid image" in response.json()["detail"]


def test_mandi_prices_endpoint(client):
    response = client.get("/api/v1/mandi")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_weather_endpoint(client):
    response = client.get("/api/v1/weather")
    assert response.status_code == 200


def test_tips_endpoint(client):
    response = client.get("/api/v1/tips")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_news_endpoint(client):
    response = client.get("/api/v1/news")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
