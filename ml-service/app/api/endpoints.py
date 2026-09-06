from fastapi import APIRouter, HTTPException
from app.schemas.risk import (
    RiskPredictionRequest,
    RiskPredictionResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    ForecastRequest,
    ForecastResponse
)
from app.schemas.journal import (
    JournalAnalysisRequest,
    JournalAnalysisResponse
)
from app.services.risk_service import compute_risk_prediction
from app.services.nlp_service import analyze_journal_text
from app.services.forecast_service import generate_risk_forecast
from app.services.anomaly_service import detect_checkin_anomaly
from app.feature_engineering.extractors import extract_longitudinal_features
from app.explainability.shap_engine import calculate_feature_attribution

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MindPulse ML Microservice",
        "nonDiagnostic": True
    }

@router.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk_endpoint(request: RiskPredictionRequest):
    try:
        return compute_risk_prediction(
            user_id=request.userId,
            check_ins=request.recentCheckIns,
            baseline=request.historicalBaseline
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-risk")
def explain_risk_endpoint(request: RiskPredictionRequest):
    try:
        features = extract_longitudinal_features(request.recentCheckIns)
        factors = calculate_feature_attribution(features)
        return {
            "userId": request.userId,
            "features": features,
            "factors": factors,
            "disclaimer": "Non-diagnostic contributing factors estimation."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-anomaly", response_model=AnomalyDetectionResponse)
def detect_anomaly_endpoint(request: AnomalyDetectionRequest):
    try:
        return detect_checkin_anomaly(
            user_id=request.userId,
            current=request.currentCheckIn,
            history=request.historicalCheckIns
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast-risk", response_model=ForecastResponse)
def forecast_risk_endpoint(request: ForecastRequest):
    try:
        return generate_risk_forecast(
            user_id=request.userId,
            check_ins=request.checkIns,
            days=request.forecastDays
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze-journal", response_model=JournalAnalysisResponse)
def analyze_journal_endpoint(request: JournalAnalysisRequest):
    try:
        return analyze_journal_text(
            user_id=request.userId,
            text=request.text
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
