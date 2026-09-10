import math
from typing import List, Optional
from app.schemas.risk import CheckInItem, ForecastPoint, ForecastResponse
from app.feature_engineering.extractors import extract_longitudinal_features
from app.services.model_engine import model_engine
from app.config import settings

def generate_risk_forecast(
    user_id: str,
    check_ins: List[CheckInItem],
    days: int = 7,
    case_stage: Optional[str] = None,
) -> ForecastResponse:
    """
    Simulates a non-diagnostic short-term distress trajectory forecast
    using longitudinal momentum, personal baseline variance, and uncertainty bounds.
    """
    limitations: List[str] = []
    days = max(1, min(days, 30))

    if not check_ins:
        limitations.append("No check-in history provided. Default normative baseline projection used.")
        points = [
            ForecastPoint(
                dayOffset=d,
                predictedScore=0.25,
                projectedLevel="STABLE",
                confidenceLower=0.15,
                confidenceUpper=0.35
            )
            for d in range(1, days + 1)
        ]
        return ForecastResponse(
            userId=user_id,
            forecast=points,
            trajectoryDirection="stable",
            confidence=0.30,
            limitations=limitations,
            modelVersion=settings.model_version,
            disclaimer="Projected trend based on historical trajectory. Non-diagnostic decision support only."
        )

    # Extract longitudinal features
    feat_data = extract_longitudinal_features(check_ins, case_stage=case_stage)
    feature_vector = feat_data["feature_vector"]
    feat_dict = feat_data["feature_dict"]
    baseline_info = feat_data["baseline_info"]

    if len(check_ins) < 3:
        limitations.append(f"Short history ({len(check_ins)} entries): forecast uncertainty bounds are widened.")

    # Starting baseline risk score from model engine
    base_risk = model_engine.predict_risk(feature_vector)

    # Calculate trajectory momentum slope
    # Stress slope (+ means escalating), Safety slope (- means escalating), Mood slope (- means escalating)
    stress_slope = feat_dict.get("stress_slope", 0.0)
    safety_slope = feat_dict.get("safety_slope", 0.0)
    mood_slope = feat_dict.get("mood_slope", 0.0)

    # Combined daily velocity
    daily_velocity = (stress_slope * 0.03) - (safety_slope * 0.025) - (mood_slope * 0.02)
    
    # Dampening factor to prevent runaway divergence over horizon
    dampening = 0.88

    # Uncertainty dispersion based on personal volatility
    volatility = feat_dict.get("stress_volatility", 0.15) + feat_dict.get("safety_volatility", 0.15)
    sample_factor = 1.0 / math.sqrt(max(1, len(check_ins)))

    points: List[ForecastPoint] = []
    current_score = base_risk
    cumulative_delta = 0.0

    for day in range(1, days + 1):
        # Velocity dampened over time
        step_velocity = daily_velocity * (dampening ** (day - 1))
        cumulative_delta += step_velocity
        projected_score = round(max(0.05, min(0.95, base_risk + cumulative_delta)), 2)

        # Expanding confidence envelope: sqrt(day)
        uncertainty = round(math.sqrt(day) * (0.025 + volatility * 0.04 + sample_factor * 0.03), 2)
        lower_bound = round(max(0.00, projected_score - uncertainty), 2)
        upper_bound = round(min(1.00, projected_score + uncertainty), 2)

        # Categorize projected tier
        if projected_score < 0.30:
            level = "STABLE"
        elif projected_score < 0.55:
            level = "WATCH"
        elif projected_score < 0.75:
            level = "ELEVATED"
        else:
            level = "REQUIRES_REVIEW"

        points.append(ForecastPoint(
            dayOffset=day,
            predictedScore=projected_score,
            projectedLevel=level,
            confidenceLower=lower_bound,
            confidenceUpper=upper_bound
        ))

    # Overall trajectory classification
    total_change = points[-1].predictedScore - points[0].predictedScore
    if total_change >= 0.05:
        trajectory = "escalating"
    elif total_change <= -0.05:
        trajectory = "improving"
    else:
        trajectory = "stable"

    confidence = round(feat_data.get("confidence", 0.80), 2)

    return ForecastResponse(
        userId=user_id,
        forecast=points,
        trajectoryDirection=trajectory,
        confidence=confidence,
        limitations=limitations,
        modelVersion=settings.model_version,
        disclaimer="Projected trend based on historical trajectory. Non-diagnostic decision support only."
    )
