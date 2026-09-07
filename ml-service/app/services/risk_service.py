from typing import List, Optional
from app.schemas.risk import CheckInItem, RiskPredictionResponse
from app.feature_engineering.extractors import extract_longitudinal_features
from app.explainability.shap_engine import calculate_feature_attribution
from app.config import settings

def compute_risk_prediction(
    user_id: str,
    check_ins: List[CheckInItem],
    baseline: Optional[dict] = None,
    case_stage: Optional[str] = None,
) -> RiskPredictionResponse:
    """
    Evaluates distress risk score based on engineered longitudinal features,
    case-stage sensitivity, and safety perception metrics for SIH26094.
    """
    features = extract_longitudinal_features(check_ins)
    
    # Weighted composite of stress, case-related stress, safety deficit, sleep deficit, mood depression, energy loss
    general_stress = (features["avg_stress"] / 10.0) * 0.25
    case_stress = (features["avg_case_stress"] / 10.0) * 0.20
    safety_deficit = max(0.0, (10.0 - features["avg_safety"]) / 10.0) * 0.15
    sleep_component = features["sleep_deficit_ratio"] * 0.20
    mood_component = max(0.0, (10.0 - features["avg_mood"]) / 10.0) * 0.15
    energy_component = max(0.0, (10.0 - features["avg_energy"]) / 10.0) * 0.05

    # Case stage multiplier (e.g., Court/Trial and Investigation typically show elevated acute tension)
    stage_multiplier = 1.0
    effective_stage = case_stage or (check_ins[-1].caseStage if check_ins else "INVESTIGATION")
    if effective_stage in ["COURT_TRIAL", "Court / Trial"]:
        stage_multiplier = 1.08
    elif effective_stage in ["INVESTIGATION", "Investigation"]:
        stage_multiplier = 1.04

    raw_score = (general_stress + case_stress + safety_deficit + sleep_component + mood_component + energy_component) * stage_multiplier
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
    human_review = normalized_score >= 0.55

    return RiskPredictionResponse(
        riskScore=normalized_score,
        riskLevel=level,
        modelVersion=settings.model_version,
        factors=factors,
        caseStageContext=effective_stage,
        humanReviewRecommended=human_review,
        disclaimer="Non-diagnostic decision-support signal for human counselor review only."
    )

