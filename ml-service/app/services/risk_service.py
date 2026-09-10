from typing import List, Optional, Dict, Any
from app.schemas.risk import (
    CheckInItem,
    RiskPredictionResponse,
    ForecastSummary,
    UnifiedAnalysisResponse,
    DataQualityReport,
)
from app.feature_engineering.extractors import extract_longitudinal_features
from app.services.model_engine import model_engine
from app.explainability.shap_engine import calculate_shap_attributions
from app.services.anomaly_service import detect_checkin_anomaly
from app.services.forecast_service import generate_risk_forecast
from app.services.trend_service import analyze_longitudinal_trend
from app.config import settings

# Transparent risk weights for explainable linear baseline & auditability
DEFAULT_RISK_WEIGHTS: Dict[str, float] = {
    "mood_deterioration": 0.18,
    "anxiety": 0.14,
    "stress": 0.16,
    "sleep_deficit": 0.14,
    "safety_compromise": 0.16,
    "longitudinal_trend": 0.10,
    "nlp_voice_signals": 0.08,
    "case_stage_context": 0.04,
}

def map_risk_level(score: float) -> tuple[str, str]:
    """
    Returns (backend_level, standard_level) for a 0.00-1.00 score.
    0.00 - 0.29: STABLE / LOW
    0.30 - 0.54: WATCH / MODERATE
    0.55 - 0.74: ELEVATED / HIGH
    0.75 - 1.00: REQUIRES_REVIEW / CRITICAL
    """
    if score < 0.30:
        return "STABLE", "LOW"
    elif score < 0.55:
        return "WATCH", "MODERATE"
    elif score < 0.75:
        return "ELEVATED", "HIGH"
    else:
        return "REQUIRES_REVIEW", "CRITICAL"

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
    3. SHAP TreeExplainer local attribution for explainable contributing signals & top factors
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
    baseline_report = feat_data.get("baseline_report")
    effective_stage = feat_data["effective_stage"]
    confidence = feat_data["confidence"]
    data_quality = feat_data.get("data_quality", "GOOD")
    limitations = list(feat_data["limitations"])
    n_obs = len(check_ins)

    # 2. Risk Model Inference (Trained XGBoost Regressor)
    risk_score = model_engine.predict_risk(feature_vector)
    risk_score_100 = int(round(risk_score * 100))

    # 3. 4-Tier Risk Level Classification
    backend_level, standard_level = map_risk_level(risk_score)

    # 4. SHAP Local Feature Attribution
    shap_dict = model_engine.explain_sample(feature_vector)
    contributing_signals, legacy_factors, top_factors = calculate_shap_attributions(
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
    mood_slope = feature_dict.get("mood_slope", 0.0)
    
    if stress_slope > 0.20 or safety_slope < -0.20 or mood_slope < -0.20:
        trend = "INCREASING"
        direction = "WORSENING"
    elif stress_slope < -0.20 and safety_slope > 0.20 and mood_slope > 0.20:
        trend = "DECREASING"
        direction = "IMPROVING"
    else:
        trend = "STABLE"
        direction = "STABLE"

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
    human_review = (risk_score >= 0.55) or anomaly_detected or (backend_level in ["ELEVATED", "REQUIRES_REVIEW"])

    return RiskPredictionResponse(
        riskScore=risk_score,
        risk_score=risk_score_100,
        riskLevel=backend_level,
        risk_level=standard_level,
        direction=direction,
        trend=trend,
        anomalyDetected=anomaly_detected,
        anomalyScore=anomaly_score,
        forecast=forecast_summary,
        top_factors=top_factors,
        contributingSignals=contributing_signals,
        caseStage=effective_stage,
        caseStageContext=effective_stage,
        humanReviewRecommended=human_review,
        human_review_recommended=human_review,
        confidence=confidence,
        data_quality=data_quality,
        observations_used=n_obs,
        limitations=limitations,
        baseline_report=baseline_report,
        modelVersion=settings.model_version,
        factors=legacy_factors,
        disclaimer="Non-diagnostic early-warning and decision-support signal for human professional review only."
    )

def compute_unified_analysis(
    user_id: str,
    check_ins: List[CheckInItem],
    baseline: Optional[Dict[str, Any]] = None,
    case_stage: Optional[str] = None,
    journal_stress_signal: Optional[float] = None,
    voice_stress_index: Optional[float] = None,
    forecast_days: int = 7,
) -> UnifiedAnalysisResponse:
    """
    High-performance single-pass analysis endpoint:
    Preprocesses features once and synthesizes:
    - Risk Scoring & Level
    - Personal Baseline Anomaly Detection
    - Longitudinal Trend Analysis
    - Short-Term Trajectory Forecast
    - SHAP Factor Explainability
    - Data Quality Assessment
    """
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
    data_quality_label = feat_data.get("data_quality", "GOOD")
    limitations = list(feat_data["limitations"])
    n_obs = len(check_ins)

    # 1. Risk
    risk_score = model_engine.predict_risk(feature_vector)
    risk_score_100 = int(round(risk_score * 100))
    backend_level, standard_level = map_risk_level(risk_score)

    # 2. Explainability
    shap_dict = model_engine.explain_sample(feature_vector)
    contributing_signals, legacy_factors, top_factors = calculate_shap_attributions(
        feature_dict=feature_dict,
        raw_shap_values=shap_dict,
        baseline_info=baseline_info,
        top_k=5
    )

    # 3. Anomaly
    if n_obs >= 2:
        anom_res = detect_checkin_anomaly(
            user_id=user_id,
            current=check_ins[-1],
            history=check_ins[:-1],
            case_stage=effective_stage
        )
        anomaly_detected = anom_res.anomalyDetected
        anomaly_score = anom_res.anomalyScore
        anomaly_severity = anom_res.severity
        anomaly_affected = anom_res.affected_features
        anomaly_explanation = anom_res.explanation
    else:
        anomaly_detected = False
        anomaly_score = 0.05
        anomaly_severity = "LOW"
        anomaly_affected = []
        anomaly_explanation = ["Insufficient history for anomaly evaluation."]

    # 4. Trend
    trend_res = analyze_longitudinal_trend(
        user_id=user_id,
        check_ins=check_ins,
        case_stage=effective_stage
    )

    # 5. Forecast
    forecast_res = generate_risk_forecast(
        user_id=user_id,
        check_ins=check_ins,
        days=forecast_days,
        case_stage=effective_stage
    )

    human_review = (risk_score >= 0.55) or anomaly_detected or (backend_level in ["ELEVATED", "REQUIRES_REVIEW"])

    data_quality = DataQualityReport(
        quality_level=data_quality_label,
        confidence=confidence,
        observations_used=n_obs,
        limitations=limitations
    )

    return UnifiedAnalysisResponse(
        userId=user_id,
        caseStage=effective_stage,
        risk={
            "risk_score": risk_score_100,
            "riskScore": risk_score,
            "risk_level": standard_level,
            "riskLevel": backend_level,
            "confidence": confidence,
            "direction": trend_res.direction,
            "human_review_recommended": human_review,
        },
        anomaly={
            "is_anomaly": anomaly_detected,
            "anomaly_score": anomaly_score,
            "severity": anomaly_severity,
            "affected_features": anomaly_affected,
            "explanation": anomaly_explanation,
        },
        trend={
            "direction": trend_res.direction,
            "recent_moving_average": trend_res.recent_moving_average,
            "historical_moving_average": trend_res.historical_moving_average,
            "slopes": trend_res.slopes,
            "consecutive_deterioration_count": trend_res.consecutive_deterioration_count,
            "volatility_index": trend_res.volatility_index,
            "explanation": trend_res.explanation,
        },
        forecast={
            "forecast_available": forecast_res.forecast_available,
            "reason": forecast_res.reason,
            "trajectory": forecast_res.trajectoryDirection,
            "forecast_points": [p.model_dump() for p in forecast_res.forecast],
        },
        explanation={
            "top_factors": [tf.model_dump() for tf in top_factors],
            "contributing_signals": [cs.model_dump() for cs in contributing_signals],
            "baseline_status": baseline_info.get("status", "unknown"),
        },
        data_quality=data_quality,
        modelVersion=settings.model_version,
        humanReviewRecommended=human_review,
        disclaimer="MindPulse decision-support system provides non-diagnostic alerts to assist human professionals."
    )
