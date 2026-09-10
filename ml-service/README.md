# MindPulse AI/ML Microservice (Member 3 — Risk, Anomaly & Forecasting)

**Problem Statement 26094 (Smart India Hackathon)**:  
*“AI-Powered Dynamic Mental Health Monitoring & Distress Prediction System for Victims of Atrocities”*

---

## 1. Overview

The **MindPulse ML Microservice** is a high-performance, trauma-informed, non-diagnostic early-warning and decision-support engine designed to monitor longitudinal wellbeing trajectories for victims of atrocities, witnesses under protection, and individuals undergoing legal proceedings.

### Core Responsibilities (Member 3)
- **Longitudinal Wellbeing & Feature Engineering**: Extracts 43 dynamic temporal features across personal baselines, multi-window moving averages (3-day, 7-day), velocity slopes, and case-stage sensitivity.
- **Personal Baseline Normalization**: Compares current metrics against an individual's personal statistical baseline ($\mu, \sigma, \Delta, z$) rather than applying rigid population stereotypes.
- **Calibrated Risk Engine**: Dual-scale scoring ($0.00-1.00$ and $0-100$), transparent audit weights, 4-tier risk levels (`STABLE/LOW`, `WATCH/MODERATE`, `ELEVATED/HIGH`, `REQUIRES_REVIEW/CRITICAL`), and human review triggers.
- **Multi-Tier Anomaly Detection**: Detects sudden safety shocks, rapid stress spikes, acute sleep collapse, and multi-signal divergence using personal Z-scores and unsupervised Isolation Forest ($N \ge 5$).
- **Longitudinal Trend Analysis**: Evaluates trajectory direction (`IMPROVING`, `STABLE`, `WORSENING`, `VOLATILE`, `INSUFFICIENT_DATA`), linear regression slopes, oscillation counts, and consecutive deteriorations.
- **Short-Term Forecasting**: Projects 3 to 14-day distress trajectories with exponential dampening, personal baseline variance, and expanding uncertainty envelopes ($\sqrt{d}$); rejects forecasting when data is insufficient ($< 2$ entries).
- **Explainability**: Translates exact local **SHAP TreeExplainer** values into structured, counselor-friendly `top_factors` and contributing signals without clinical diagnostic jargon.
- **Unified Single-Pass API (`POST /analyze`)**: Computes features once and delivers all analysis components in sub-50ms latency.

---

## 2. Architecture

```text
ml-service/
│
├── app/
│   ├── main.py                          # FastAPI application & lifespan setup
│   ├── config.py                        # Service configuration & environment settings
│   │
│   ├── api/
│   │   └── endpoints.py                 # REST API routes (/predict-risk, /analyze, /forecast, etc.)
│   │
│   ├── schemas/
│   │   ├── risk.py                      # Pydantic input/output models, aliases & validation
│   │   └── journal.py                   # Journal sentiment analysis schemas
│   │
│   ├── services/
│   │   ├── risk_service.py              # Risk scoring, calibration & unified analysis pipeline
│   │   ├── anomaly_service.py           # Personal baseline Z-score & Isolation Forest anomaly detector
│   │   ├── trend_service.py             # Longitudinal slope, moving average & volatility analyzer
│   │   ├── forecast_service.py          # Short-term trajectory forecaster with uncertainty bounds
│   │   ├── model_engine.py              # XGBoost Regressor singleton & SHAP TreeExplainer cache
│   │   ├── nlp_service.py               # Linguistic distress proxy screener
│   │   └── voice_service.py             # Acoustic biomarker screener (jitter, shimmer, pitch)
│   │
│   ├── feature_engineering/
│   │   └── extractors.py                # 43 longitudinal feature extractors & baseline stats
│   │
│   └── explainability/
│       └── shap_engine.py               # SHAP feature attribution & TopFactor formatting
│
├── tests/
│   ├── test_ml_pipeline.py              # Exhaustive 17-scenario unit & integration test suite
│   └── evaluate_models.py               # Quantitative model validation report (MAE, RMSE, ROC-AUC)
│
├── requirements.txt                     # Python dependencies (FastAPI, XGBoost, SHAP, Scikit-learn)
└── README.md                            # Complete technical documentation
```

---

## 3. Data Model & Field Mappings

The service accepts longitudinal check-in records with robust fallback mappings and aliases:

| Field Name | Type | Allowed Range | Aliases | Description |
| :--- | :--- | :--- | :--- | :--- |
| `mood` | `float` | `1.0 - 10.0` | — | Subjective mood rating |
| `stress` | `float` | `1.0 - 10.0` | — | Perceived distress / stress level |
| `sleepHours` | `float` | `0.0 - 24.0` | `sleep` | Duration of sleep in hours |
| `energy` | `float` | `1.0 - 10.0` | — | Energy and physical stamina score |
| `senseOfSafety` | `float` | `1.0 - 10.0` | — | Perceived safety (critical for atrocity / protection cases) |
| `supportAvailability` | `float` | `1.0 - 10.0` | `social_connection` | Available social & rehabilitation support |
| `caseRelatedStress` | `float` | `1.0 - 10.0` | — | Specific stress originating from legal process |
| `anxiety` | `float` | `1.0 - 10.0` | — | Anxiety score (falls back to stress if absent) |
| `wellbeing_score` | `float` | `0.0 - 100.0` | — | Optional composite wellbeing indicator |
| `caseStage` | `str` | Enum | — | Legal milestone (`CASE_REGISTRATION`, `INVESTIGATION`, `COURT_TRIAL`, `COMPENSATION`, `REHABILITATION`, `PROTECTION_SUPPORT`) |
| `journalStressSignal` | `float` | `0.0 - 1.0` | `journal_sentiment` | Optional NLP stress signal from journal |
| `voiceStressIndex` | `float` | `0.0 - 1.0` | `voice_stress` | Optional acoustic voice biomarker |

---

## 4. Feature Vector Specification (43 Features)

| # | Feature Name | Dimension | Formula / Definition |
| :--- | :--- | :--- | :--- |
| 1–8 | `latest_*` (stress, mood, sleep, energy, safety, case_stress, anxiety, wellbeing) | Current State | Most recent check-in values |
| 9–14 | `*_deviation` (stress, safety, sleep, mood, case_stress, anxiety) | Baseline Change | $x_t - \mu_{\text{personal}}$ |
| 15–19 | `*_z_score` (stress, safety, sleep, mood, anxiety) | Baseline Variance | $\frac{x_t - \mu_{\text{personal}}}{\sigma_{\text{personal}}}$ |
| 20–23 | `ma3_*`, `ma7_*` (mood, stress) | Moving Averages | 3-entry & 7-entry rolling averages |
| 24–29 | `*_slope` (stress, safety, mood, sleep, anxiety, wellbeing) | Velocity | Normalized OLS linear regression slope |
| 30–32 | `*_volatility` (stress, safety, mood) | Stability | Normalized range $(\max - \min) / 10$ |
| 33 | `consecutive_deterioration_count` | Momentum | Consecutive downward observations |
| 34–35 | `sleep_deficit_ratio`, `sleep_disruption_flag` | Sleep Loss | $\max(0, (8.0 - \text{sleep})/8.0)$, flag if $< 5.0\text{h}$ |
| 36–38 | `stage_weight`, `stage_is_trial`, `stage_is_protection` | Case Context | Case sensitivity multipliers (e.g. 1.15 for Court Trial) |
| 39–42 | `journal_stress`, `voice_stress`, `has_journal`, `has_voice` | Multimodal | NLP/acoustic signals & presence flags |
| 43 | `history_length_log` | Sample Volume | $\ln(1 + N_{\text{history}})$ |

---

## 5. API Endpoints

### 1. Unified Analysis (Recommended for Backend)
- **Route**: `POST /analyze`
- **Request**: `UnifiedAnalysisRequest`
- **Response**: `UnifiedAnalysisResponse`
- **Description**: Single-pass feature engineering pipeline returning risk score, anomaly flags, longitudinal trend, forecast, and SHAP top factors in a single call.

### 2. Risk Prediction
- **Route**: `POST /predict-risk`
- **Request**: `RiskPredictionRequest`
- **Response**: `RiskPredictionResponse`

### 3. Personal Baseline Anomaly Detection
- **Route**: `POST /detect-anomaly`
- **Request**: `AnomalyDetectionRequest`
- **Response**: `AnomalyDetectionResponse`

### 4. Longitudinal Trend Analysis
- **Route**: `POST /analyze-trend`
- **Request**: `TrendAnalysisRequest`
- **Response**: `TrendAnalysisResponse`

### 5. Short-Term Forecasting
- **Route**: `POST /forecast` / `POST /forecast-risk`
- **Request**: `ForecastRequest`
- **Response**: `ForecastResponse`

### 6. Explainability
- **Route**: `POST /explain-risk`
- **Request**: `RiskPredictionRequest`

### 7. Multimodal Proxies
- **Route**: `POST /analyze-journal` (NLP linguistic analysis)
- **Route**: `POST /analyze-voice` (Voice acoustic features)

### 8. Health Check
- **Route**: `GET /health`

---

## 6. Model Evaluation Benchmark

Evaluated using `tests/evaluate_models.py` on an independent synthetic evaluation cohort ($N = 1000$):

```text
======================================================================
MINDPULSE ML SERVICE — MODEL EVALUATION REPORT
======================================================================
Regression MAE:       0.0085
Regression RMSE:      0.0109
Classification Acc:   98.9%
Precision:            0.9820
Recall (Sensitivity): 0.9959  <-- Prioritized to minimize false negatives in distress
F1-Score:             0.9889
ROC-AUC:              0.9997
PR-AUC:               0.9997

Confusion Matrix (Threshold >= 0.55):
  True Negative: 499  | False Positive: 9
  False Negative: 2   | True Positive:  490

Forecast Trajectory Consistency MAE: 0.0700
Status: VALIDATED & PRODUCTION READY
======================================================================
```

---

## 7. Safety & Non-Diagnostic Compliance

> [!IMPORTANT]
> **Decision-Support Guardrail**: This microservice is an **early-warning decision support tool** for human counselors, social workers, and legal aid professionals. It **does not** generate clinical diagnoses (such as "depressed" or "suicidal") or replace professional medical/legal judgment.
> 
> All responses include a mandatory safety disclaimer:
> `"Non-diagnostic early-warning and decision-support signal for human professional review only."`

---

## 8. Running & Testing

### Run Tests
```powershell
.\.venv\Scripts\python.exe -m unittest discover -s tests
```

### Run Quantitative Evaluation Benchmark
```powershell
.\.venv\Scripts\python.exe tests/evaluate_models.py
```

### Start ML Microservice
```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Swagger Docs: `http://localhost:8000/docs`
