# 🌾 KisaanSathi: Machine Learning & Explainable AI (XAI) Pipeline
**Academic Focus:** MCA Minor Project Technical Specification & Viva Guide  
**Domain:** Deep Learning, Computer Vision & Agricultural Decision Support Systems  
**Core Technologies:** TensorFlow 2.x, Keras, MobileNetV2, Grad-CAM, Scikit-Learn  

---

## 1. Executive Summary & Architecture Overview

The **KisaanSathi** ML pipeline classifies crop leaf pathogens and explains its predictions using Gradient-Weighted Class Activation Mapping (**Grad-CAM**).

The architecture is built on a **Dual-Engine Design**:
1. **Primary Deep Learning Engine (MobileNetV2):** When trained weights (`ml/models/crop_disease_model.keras`) and `class_names.json` exist, inference is executed via forward propagation and authentic `tf.GradientTape` Grad-CAM backpropagation.
2. **Secondary Agronomic Fallback Engine (ExG):** When trained weights are unavailable (e.g. initial setup, hardware constraints, or development demo), an agronomic vegetation index ($ExG = 2G - R - B$) detects leaf lesions without failing or halting the application.

```
                            [ Raw Leaf Image Upload ]
                                        ↓
                        [ Preprocessing & Validation ]
                        • PIL Integrity Check
                        • Resize: 224 x 224 x 3
                        • Normalization: [-1.0, 1.0]
                                        ↓
                          [ Model Availability Check ]
                                      /   \
                             (Exists)       (Not Found)
                                /               \
                 [ Primary Engine ]           [ Secondary Engine ]
                 • MobileNetV2 Base           • Excess Green Index (ExG)
                 • Softmax Probabilities      • Lesion Area Ratio
                 • Mode: "mobilenetv2"        • Mode: "exg_fallback"
                                \               /
                                 \             /
                         [ Explainability Layer (Grad-CAM) ]
                         • Gradient w.r.t. Final Conv Layer
                         • Alpha Weight Computation (GAP)
                         • Weighted Activation Overlay (Jet Colormap)
                                        ↓
                        [ Treatment & Advisory Mapper ]
                        • Cause, Symptoms, Prevention
                        • Organic Remedies & Chemical Dosages
                                        ↓
                         [ FastAPI REST Response / UI ]
```

---

## 2. Why MobileNetV2 for Agricultural Diagnosis? (Viva Point)

| Characteristic | MobileNetV2 | Traditional ResNet-50 / VGG-16 | Academic Rationale |
| :--- | :--- | :--- | :--- |
| **Parameters** | ~3.4 Million | 25M (ResNet) / 138M (VGG) | Minimal memory footprint for rural edge deployment |
| **Model Size** | ~14 MB | ~100 MB – 500 MB | Fast loading into memory upon FastAPI server startup |
| **Inference Latency** | < 45 ms on CPU | > 200 ms on CPU | Real-time response on low-cost agricultural kiosks |
| **Convolution Type** | **Inverted Residuals & Linear Bottlenecks** with Depthwise Separable Convolutions | Standard 2D Spatial Convolutions | Reduces computational operations ($MACs$) by $8\times$ to $9\times$ |

### Depthwise Separable Convolutions Explained:
Traditional convolution performs channel and spatial operations simultaneously. MobileNetV2 splits this into:
1. **Depthwise Convolution:** Applies a single $3\times 3$ filter per input channel (spatial filtering).
2. **Pointwise Convolution:** Applies a $1\times 1$ convolution across all channels (channel combination).
- **Computation Reduction Factor:**
  $$\frac{D_K \cdot D_K \cdot M \cdot D_F \cdot D_F + M \cdot N \cdot D_F \cdot D_F}{D_K \cdot D_K \cdot M \cdot N \cdot D_F \cdot D_F} = \frac{1}{N} + \frac{1}{D_K^2} \approx \frac{1}{9}$$
  *(where $D_K=3$ is kernel size, $M$ is input channels, $N$ is output channels).*

---

## 3. Dataset Preparation & Leakage Prevention

### PlantVillage Dataset Structure:
The PlantVillage dataset contains 54,306 curated leaf images spanning 38 classes (both healthy and diseased varieties of Tomato, Potato, Apple, Corn, Grape, Pepper, etc.).

```
data/raw/PlantVillage/
├── Tomato___Early_blight/
├── Tomato___Late_blight/
├── Tomato___healthy/
├── Potato___Early_blight/
└── ... (up to 38 class directories)
```

### Stratified 80/10/10 Partitioning Protocol:
- **Seed-Controlled Determinism:** `seed = 42` ensures identical splits across runs.
- **Stratification:** Each class is partitioned individually into **80% Training**, **10% Validation**, and **10% Holdout Testing**.
- **No Data Leakage:** Images assigned to the test set are never used during feature extraction, fine-tuning, or hyperparameter selection.
- **Disk Efficiency:** Instead of duplicating 54,000 images, `ml/dataset/split_dataset.py` generates lightweight CSV manifests (`train_manifest.csv`, `val_manifest.csv`, `test_manifest.csv`).

---

## 4. Two-Stage Transfer Learning Strategy

```
Input (224x224x3)
      ↓
Data Augmentation (Flip, Rotation, Small Zoom, Translation)  [Train only]
      ↓
Rescaling [-1, 1]:  x = (pixel / 127.5) - 1.0
      ↓
MobileNetV2 Base (Pre-trained on ImageNet)
      ↓
GlobalAveragePooling2D
      ↓
Dropout (0.3)
      ↓
Dense (num_classes, Softmax)
```

### Stage 1: Feature Extraction
- **Base Model Status:** All MobileNetV2 pre-trained layers are **FROZEN** (`trainable = False`).
- **Goal:** Adapt randomly initialized classification head weights to crop disease features without destroying pre-trained ImageNet edge/texture weights.
- **Optimizer:** Adam with learning rate $\eta = 10^{-3}$ ($0.001$).
- **Callbacks:**
  - `ModelCheckpoint`: Preserves weights with best validation accuracy.
  - `EarlyStopping`: Monitors validation loss (patience = 4).
  - `ReduceLROnPlateau`: Scales down learning rate by $5\times$ if validation loss plateaus.

### Stage 2: Fine-Tuning
- **Base Model Status:** Upper 30 convolutional layers of MobileNetV2 are **UNFROZEN**; all `BatchNormalization` layers remain frozen to prevent statistics corruption.
- **Goal:** Adapt high-level visual representations (such as lesion shapes, halo discolorations, and fungal rings) specifically to agricultural pathology.
- **Optimizer:** Adam with significantly lower learning rate $\eta = 10^{-5}$ ($0.00001$) to prevent **catastrophic forgetting**.

---

## 5. Explainable AI (Grad-CAM) Mathematical Formulation

A common criticism of Deep Learning in agriculture is the "black-box" dilemma: *How does an agronomist know the neural network detected early blight lesions rather than background soil or lighting artifacts?*

**Grad-CAM (Gradient-Weighted Class Activation Mapping)** solves this mathematically:

### Step 1: Compute Gradients
Compute the gradient of the predicted class score $y^c$ (before softmax) with respect to feature activation maps $A^k$ of the final convolutional layer (`Conv_1` in MobileNetV2):
$$\frac{\partial y^c}{\partial A^k}$$

### Step 2: Global Average Pooling (Neuron Importance Weights)
Calculate the importance weight $\alpha_k^c$ of feature map $k$ for class $c$ by pooling gradients across spatial height $u$ and width $v$:
$$\alpha_k^c = \frac{1}{Z} \sum_{u=1}^{U} \sum_{v=1}^{V} \frac{\partial y^c}{\partial A_{u,v}^k}$$
*(where $Z = U \times V$ is the spatial dimensions of the feature map).*

### Step 3: Weighted Linear Combination & Rectified Linear Activation
Linearly combine activation maps weighted by their importance, followed by a ReLU operation to discard features that decrease class confidence:
$$L_{\text{Grad-CAM}}^c = \text{ReLU}\left( \sum_{k} \alpha_k^c A^k \right)$$

### Step 4: Bilinear Upsampling & Jet Overlay
The $14 \times 14$ activation map is scaled to the original $224 \times 224$ (or source image) resolution using bilinear interpolation and blended over the photograph using OpenCV `COLORMAP_JET`:
$$I_{\text{blended}} = (1 - \alpha) \cdot I_{\text{original}} + \alpha \cdot I_{\text{heatmap}}$$

---

## 6. How to Run Phase 2 Pipeline (Commands Summary)

### 1. Inspect Local Dataset
```bash
python -m ml.dataset.inspect_dataset --data-dir data/raw/PlantVillage
```

### 2. Generate Stratified 80/10/10 Splits
```bash
python -m ml.dataset.split_dataset --data-dir data/raw/PlantVillage --output-dir data/processed --seed 42
```

### 3. Train Model (Local CPU or Colab GPU)
```bash
# Local execution:
python -m ml.training.train --data-dir data/raw/PlantVillage --stage1-epochs 10 --stage2-epochs 10

# Or run the Google Colab Notebook:
notebooks/kisaansathi_mobilenetv2_colab.ipynb
```

### 4. Evaluate Strictly on Holdout Test Set
```bash
python -m ml.evaluation.evaluate --model-path ml/models/crop_disease_model.keras --test-dir data/processed/test
```

### 5. Automated Verification Test Suite
```bash
pytest tests/ -v
```
