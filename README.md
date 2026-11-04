# 🌾 KisaanSathi (किसान साथी)
> **AI-Powered Crop Health Scanner & Farmer Assistance Platform**  
> *MCA Minor Project | Computer Vision & Agricultural Decision Support*

---

## 📌 Project Overview
**KisaanSathi** is an intelligent agricultural advisory application designed to empower smallholder farmers and extension workers with:
1. **Instant Crop Disease Diagnosis:** High-accuracy classification from leaf photographs using **MobileNetV2 Transfer Learning**.
2. **Visual Explainability (Grad-CAM):** Mathematical heatmaps showing *where* the AI focused on the leaf lamina, establishing trust and scientific validity for academic viva evaluation.
3. **Dual-Engine Robustness:** Primary deep learning inference with an agronomic Excess Green Index ($ExG$) fallback mode when weights are not present.
4. **Actionable Treatment Plans:** Detailed organic remedies, chemical controls with dosages, cause explanations, and preventive agronomic guidance.
5. **Scan History & Persistence:** Local SQLite database logging previous diagnoses and observations.
6. **Farmer Support Suite:** Modules for daily Mandi market prices, hyper-local weather alerts, and educational farming tips.

---

## 🏗️ System Architecture

```mermaid
graph TD
    UI[Streamlit Web UI / Mobile Simulator] -->|HTTP REST / Multipart| API[FastAPI Application Server]
    API -->|Validation & Normalization| CV[CV Preprocessor (224x224, [-1, 1])]
    CV -->|Normalized Tensor| PRED[CropDiseasePredictor]
    PRED -->|Primary Mode| ML[MobileNetV2 Engine]
    PRED -->|Fallback Mode| EXG[Excess Green Vegetation Index]
    ML -->|tf.GradientTape| GC[Grad-CAM Generator]
    PRED -->|Lookup Advisory| KB[Disease Knowledge Base]
    API -->|ORM Transactions| DB[(SQLite Database)]
```

---

## 🗂️ Project Structure

```
KisaanSathi/
├── api/
│   ├── main.py                  # FastAPI app entry point & lifespan handler
│   ├── config.py                # Pydantic settings & environment configuration
│   ├── routes/
│   │   ├── prediction.py        # /predict & /history endpoints
│   │   ├── mandi.py             # Mandi market prices (Phase 2)
│   │   ├── news.py              # Agri news feeds (Phase 2)
│   │   ├── weather.py           # Hyper-local weather advisory (Phase 2)
│   │   └── tips.py              # Agronomic tips & best practices
│   └── services/
│       └── prediction_service.py # Inference & DB persistence orchestration
│
├── frontend/
│   └── app.py                   # Streamlit multi-tab user interface (Desktop & Mobile view)
│
├── ml/
│   ├── dataset/
│   │   ├── inspect_dataset.py   # Scans class counts, dimensions, corrupt files & imbalance
│   │   └── split_dataset.py     # Reproducible 80/10/10 stratified split manifests
│   ├── training/
│   │   └── train.py             # Two-stage MobileNetV2 transfer learning pipeline
│   ├── evaluation/
│   │   └── evaluate.py          # Test-set only metrics, confusion matrix & error analysis
│   ├── inference/
│   │   └── predictor.py         # Dual-engine: Real MobileNetV2 + ExG fallback
│   └── models/                  # Saved .keras weights & class_names.json (gitignored)
│
├── data/
│   ├── raw/PlantVillage/        # Unzipped PlantVillage dataset (gitignored)
│   ├── processed/               # Stratified manifests (train/val/test) (gitignored)
│   ├── metadata/
│   │   └── disease_info.json    # Treatments, causes, and Hindi translations
│   └── samples/                 # Quick 1-click test images for viva demonstration
│
├── database/
│   ├── connection.py            # SQLite engine, sessionmaker & Base
│   └── models.py                # Scan, DiseaseAdvisory, and FarmingTip schemas
│
├── utils/
│   ├── preprocessing.py         # Image decoding, validation, and normalization
│   ├── gradcam.py               # GradientTape Grad-CAM heatmap generator & overlay
│   └── logger.py                # Standardized system logger
│
├── tests/
│   ├── test_api.py              # FastAPI endpoint unit tests
│   ├── test_preprocessing.py    # Preprocessing & tensor validation tests
│   └── test_model_pipeline.py   # Dataset inspection, splitting, class mapping & fallback tests
│
├── notebooks/
│   └── kisaansathi_mobilenetv2_colab.ipynb # Google Colab T4 GPU training notebook
├── docs/
│   └── ML_PIPELINE.md           # Comprehensive viva technical documentation
├── reports/                     # Training curves, confusion matrices, and test results
├── requirements.txt             # Project dependencies
├── .env.example                 # Configuration template
├── .gitignore                   # Git ignore rules
└── README.md                    # Project documentation
```

---

## ⚙️ Quickstart & Local Setup

### 1. Create and Activate Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```

### 4. Run the Backend API (FastAPI)
```bash
uvicorn api.main:app --reload --port 8000
```
- API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/`

### 5. Run the Frontend (Streamlit) in a Separate Terminal
```bash
streamlit run frontend/app.py
```
- The web app will launch automatically at `http://localhost:8501`.

### 6. Run Automated Test Suite
```bash
pytest tests/ -v
```

---

## 🌿 Phase 2: Dataset, Training & Evaluation Workflow

### 1. Dataset Acquisition
KisaanSathi is benchmarked on the **PlantVillage** dataset (~54,300 images across 38 categories):
- **Source:** [Kaggle: PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease) or [Zenodo](https://zenodo.org/record/1327299).
- **Placement:** Extract class folders into `data/raw/PlantVillage/`.
- Expected layout:
  ```
  data/raw/PlantVillage/
  ├── Apple___Apple_scab/
  ├── Tomato___Early_blight/
  ├── Tomato___healthy/
  └── ...
  ```

### 2. Inspect Dataset Quality & Class Balance
```bash
python -m ml.dataset.inspect_dataset --data-dir data/raw/PlantVillage
```
- Scans directory, verifies image integrity with PIL, calculates class counts, detects corrupted files, and checks class imbalance ratios.

### 3. Generate Reproducible Stratified 80/10/10 Splits
```bash
python -m ml.dataset.split_dataset --data-dir data/raw/PlantVillage --output-dir data/processed --seed 42
```
- Generates clean manifests (`train_manifest.csv`, `val_manifest.csv`, `test_manifest.csv`) with zero data duplication and guaranteed zero leakage.

### 4. Model Training (Two-Stage Transfer Learning)
- **Local Training (CPU or GPU):**
  ```bash
  python -m ml.training.train --data-dir data/raw/PlantVillage --stage1-epochs 10 --stage2-epochs 10
  ```
- **Google Colab Training (Recommended for GPU):**
  - Open `notebooks/kisaansathi_mobilenetv2_colab.ipynb` in [Google Colab](https://colab.research.google.com).
  - Train with free T4 GPU in ~25 minutes.
  - Download `crop_disease_model.keras` and `class_names.json` and place them into `ml/models/`.

### 5. Evaluate Strictly on Holdout Test Set
```bash
python -m ml.evaluation.evaluate --model-path ml/models/crop_disease_model.keras --test-dir data/processed/test
```
- Generates `reports/confusion_matrix.png`, `reports/classification_report.txt`, and reports top confused class pairs.

---

## 🧠 Predictor Dual-Engine Behavior

When a leaf photo is submitted to `POST /api/v1/predict` or the Streamlit UI:
1. **If `ml/models/crop_disease_model.keras` exists:**
   - Inference uses the trained MobileNetV2 network.
   - Exact category is mapped via `class_names.json`.
   - Real Grad-CAM heatmap is computed via `tf.GradientTape` on the final convolution layer.
   - Response includes `"mode": "mobilenetv2"`.
2. **If trained model weights are missing:**
   - Predictor automatically engages the **Excess Green Index ($ExG = 2G - R - B$) fallback engine**.
   - Differentiates diseased vs healthy leaf tissue, highlights lesions, and generates realistic viva-demo visualizations.
   - Response includes `"mode": "exg_fallback"`.
   - Prevents application downtime during grading or offline viva demos.

---

## ⚠️ Known Academic Limitations
1. **Lab vs Field Background Bias:** PlantVillage images were captured with uniform grey/black backgrounds. Field photographs containing complex soil, weeds, or shadows may reduce confidence.
2. **Co-Infection:** The classifier assigns single Top-1 categorical labels; multiple concurrent diseases on a single leaf requires multi-label segmentation (targeted for Phase 3).
3. **Edge Hardware Execution:** Local training on 54,000 images is compute-intensive; GPU acceleration (Google Colab T4) is strongly advised for training, while CPU forward inference is sub-50ms.
