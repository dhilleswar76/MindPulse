from fastapi import APIRouter, HTTPException
from app.schemas.risk import (
    RiskPredictionRequest,
    RiskPredictionResponse,
    AnomalyDetectionRequest,
    AnomalyDetectionResponse,
    ForecastRequest,
    ForecastResponse,
    VoiceAnalysisRequest,
    VoiceAnalysisResponse
)
from app.schemas.journal import (
    JournalAnalysisRequest,
    JournalAnalysisResponse
)
from app.services.risk_service import compute_risk_prediction
from app.services.nlp_service import analyze_journal_text
from app.services.forecast_service import generate_risk_forecast
from app.services.anomaly_service import detect_checkin_anomaly
from app.services.voice_service import extract_voice_stress_signals
from app.services.model_engine import model_engine
from app.feature_engineering.extractors import extract_longitudinal_features
from app.explainability.shap_engine import calculate_shap_attributions

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "MindPulse ML Microservice",
        "modelInfo": model_engine.get_model_info(),
        "nonDiagnostic": True
    }

@router.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk_endpoint(request: RiskPredictionRequest):
    try:
        return compute_risk_prediction(
            user_id=request.userId,
            check_ins=request.recentCheckIns,
            baseline=request.historicalBaseline,
            case_stage=request.caseStage or (request.recentCheckIns[-1].caseStage if request.recentCheckIns else None),
            journal_stress_signal=request.journalStressSignal,
            voice_stress_index=request.voiceStressIndex
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-risk")
def explain_risk_endpoint(request: RiskPredictionRequest):
    try:
        feat_data = extract_longitudinal_features(
            check_ins=request.recentCheckIns,
            baseline_override=request.historicalBaseline,
            case_stage=request.caseStage,
            journal_stress_signal=request.journalStressSignal,
            voice_stress_index=request.voiceStressIndex
        )
        feature_vector = feat_data["feature_vector"]
        feature_dict = feat_data["feature_dict"]
        baseline_info = feat_data["baseline_info"]

        shap_dict = model_engine.explain_sample(feature_vector)
        contributing_signals, legacy_factors = calculate_shap_attributions(
            feature_dict=feature_dict,
            raw_shap_values=shap_dict,
            baseline_info=baseline_info,
            top_k=5
        )

        return {
            "userId": request.userId,
            "features": feat_data.get("raw_metrics", feature_dict),
            "featureDict": feature_dict,
            "baselineInfo": baseline_info,
            "contributingSignals": contributing_signals,
            "factors": legacy_factors,
            "shapValues": shap_dict,
            "confidence": feat_data.get("confidence", 0.85),
            "limitations": feat_data.get("limitations", []),
            "disclaimer": "Non-diagnostic contributing signals estimation based on SHAP TreeExplainer."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect-anomaly", response_model=AnomalyDetectionResponse)
def detect_anomaly_endpoint(request: AnomalyDetectionRequest):
    try:
        return detect_checkin_anomaly(
            user_id=request.userId,
            current=request.currentCheckIn,
            history=request.historicalCheckIns,
            case_stage=request.caseStage
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/forecast-risk", response_model=ForecastResponse)
def forecast_risk_endpoint(request: ForecastRequest):
    try:
        return generate_risk_forecast(
            user_id=request.userId,
            check_ins=request.checkIns,
            days=request.forecastDays,
            case_stage=request.caseStage
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

@router.post("/analyze-voice", response_model=VoiceAnalysisResponse)
def analyze_voice_endpoint(request: VoiceAnalysisRequest):
    try:
        return extract_voice_stress_signals(
            user_id=request.userId,
            audio_duration_seconds=request.audioDurationSeconds,
            sample_rate=request.sampleRate or 16000
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
