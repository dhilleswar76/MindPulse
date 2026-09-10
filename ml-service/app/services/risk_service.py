from typing import List, Optional, Dict, Any
from app.schemas.risk import (
    CheckInItem,
    RiskPredictionResponse,
    ForecastSummary,
)
from app.feature_engineering.extractors import extract_longitudinal_features
from app.services.model_engine import model_engine
from app.explainability.shap_engine import calculate_shap_attributions
from app.services.anomaly_service import detect_checkin_anomaly
from app.services.forecast_service import generate_risk_forecast
from app.config import settings

def compute_risk_prediction(
    user_id: str,
    check_ins: List[CheckInItem],
    baseline: Optional[Dict[str, Any]] = None,
    case_stage: Optional[str] = None,
    journal_stress_signal: Optional[float] = None,
    voice_stress_index: Optional[float] = None,
) -> RiskPredictionResponse:
    """
    Executes the comprehensive trauma-informed ML pipeline for distress risk prediction:
    1. Feature Engineering (personal baseline deviations, z-scores, velocity, case-stage context, optional multimodal signals)
    2. Model Inference via trained Gradient Boosted Tree (XGBoost)
    3. SHAP TreeExplainer local attribution for explainable contributing signals
    4. Personal baseline anomaly evaluation
    5. Short-term forecast trajectory synthesis
    6. Structured, non-diagnostic decision-support output for counselor review
    """
    # 1. Feature Engineering
    feat_data = extract_longitudinal_features(
        check_ins=check_ins,
        baseline_override=baseline,
        case_stage=case_stage,
        journal_stress_signal=journal_stress_signal,
        voice_stress_index=voice_stress_index
    )
    feature_vector = feat_data["feature_vector"]
    feature_dict = feat_data["feature_dict"]
    baseline_info = feat_data["baseline_info"]
    effective_stage = feat_data["effective_stage"]
    confidence = feat_data["confidence"]
    limitations = list(feat_data["limitations"])

    # 2. Risk Model Inference (Trained XGBoost Regressor)
    risk_score = model_engine.predict_risk(feature_vector)

    # 3. 4-Tier Risk Level Classification
    if risk_score < 0.30:
        level = "STABLE"
    elif risk_score < 0.55:
        level = "WATCH"
    elif risk_score < 0.75:
        level = "ELEVATED"
    else:
        level = "REQUIRES_REVIEW"

    # 4. SHAP Local Feature Attribution
    shap_dict = model_engine.explain_sample(feature_vector)
    contributing_signals, legacy_factors = calculate_shap_attributions(
        feature_dict=feature_dict,
        raw_shap_values=shap_dict,
        baseline_info=baseline_info,
        top_k=5
    )

    # 5. Longitudinal Anomaly Evaluation
    if len(check_ins) >= 2:
        anomaly_res = detect_checkin_anomaly(
            user_id=user_id,
            current=check_ins[-1],
            history=check_ins[:-1],
            case_stage=effective_stage
        )
        anomaly_detected = anomaly_res.anomalyDetected
        anomaly_score = anomaly_res.anomalyScore
    else:
        anomaly_detected = False
        anomaly_score = 0.05

    # 6. Trajectory & Trend Synthesis
    stress_slope = feature_dict.get("stress_slope", 0.0)
    safety_slope = feature_dict.get("safety_slope", 0.0)
    
    if stress_slope > 0.25 or safety_slope < -0.25:
        trend = "INCREASING"
    elif stress_slope < -0.25 and safety_slope > 0.25:
        trend = "DECREASING"
    else:
        trend = "STABLE"

    # 7. Short-Term Forecast Summary (7 days)
    forecast_res = generate_risk_forecast(
        user_id=user_id,
        check_ins=check_ins,
        days=7,
        case_stage=effective_stage
    )
    forecast_direction = "INCREASING" if forecast_res.trajectoryDirection == "escalating" else (
        "DECREASING" if forecast_res.trajectoryDirection == "improving" else "STABLE"
    )
    last_pt = forecast_res.forecast[-1] if forecast_res.forecast else None
    forecast_summary = ForecastSummary(
        direction=forecast_direction,
        horizonDays=7,
        projectedEndScore=last_pt.predictedScore if last_pt else None,
        projectedEndLevel=last_pt.projectedLevel if last_pt else None
    )

    # 8. Human Review Recommendation
    # Recommended if risk is ELEVATED or REQUIRES_REVIEW, or anomaly detected, or active Court/Trial during surge
    human_review = (risk_score >= 0.55) or anomaly_detected or (level in ["ELEVATED", "REQUIRES_REVIEW"])

    return RiskPredictionResponse(
        riskScore=risk_score,
        riskLevel=level,
        trend=trend,
        anomalyDetected=anomaly_detected,
        anomalyScore=anomaly_score,
        forecast=forecast_summary,
        contributingSignals=contributing_signals,
        caseStage=effective_stage,
        caseStageContext=effective_stage,
        humanReviewRecommended=human_review,
        confidence=confidence,
        limitations=limitations,
        modelVersion=settings.model_version,
        factors=legacy_factors,
        disclaimer="Non-diagnostic decision-support signal for human counselor review only."
    )
