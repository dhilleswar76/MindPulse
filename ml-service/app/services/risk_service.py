from typing import List, Optional
from app.schemas.risk import CheckInItem, RiskPredictionResponse
from app.feature_engineering.extractors import extract_longitudinal_features
from app.explainability.shap_engine import calculate_feature_attribution
from app.config import settings

def compute_risk_prediction(
    user_id: str,
    check_ins: List[CheckInItem],
    baseline: Optional[dict] = None
) -> RiskPredictionResponse:
    """
    Evaluates distress risk score based on engineered longitudinal features.
    Maps score to 4 risk tiers: STABLE, WATCH, ELEVATED, REQUIRES_REVIEW.
    """
    features = extract_longitudinal_features(check_ins)
    
    # Base calculation formula for prototype
    # Weighted composite of stress, sleep deficit, mood depression, energy loss
    stress_component = (features["avg_stress"] / 10.0) * 0.35
    sleep_component = features["sleep_deficit_ratio"] * 0.25
    mood_component = max(0.0, (10.0 - features["avg_mood"]) / 10.0) * 0.25
    energy_component = max(0.0, (10.0 - features["avg_energy"]) / 10.0) * 0.15

    raw_score = stress_component + sleep_component + mood_component + energy_component
    normalized_score = round(min(1.0, max(0.0, raw_score)), 2)

    # Classify into 4 tiers
    if normalized_score < 0.30:
        level = "STABLE"
    elif normalized_score < 0.55:
        level = "WATCH"
    elif normalized_score < 0.75:
        level = "ELEVATED"
    else:
        level = "REQUIRES_REVIEW"

    factors = calculate_feature_attribution(features)

    return RiskPredictionResponse(
        riskScore=normalized_score,
        riskLevel=level,
        modelVersion=settings.model_version,
        factors=factors
    )
