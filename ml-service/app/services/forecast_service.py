from typing import List
from app.schemas.risk import CheckInItem, ForecastPoint, ForecastResponse
from app.feature_engineering.extractors import extract_longitudinal_features
from app.config import settings

def generate_risk_forecast(user_id: str, check_ins: List[CheckInItem], days: int = 7) -> ForecastResponse:
    """
    Simulates a 7-day risk trajectory forecast using linear trend projection
    with statistical confidence intervals.
    """
    features = extract_longitudinal_features(check_ins)
    base_score = min(1.0, max(0.1, (features["avg_stress"] * 0.4 + (8.0 - min(8.0, features["avg_sleep"])) * 0.3 + (10.0 - features["avg_mood"]) * 0.3) / 10.0))

    # Slope based on recent mood drop and stress
    slope = 0.02 if features.get("mood_drop_recent", 0) > 0.1 else (-0.01 if features.get("avg_mood", 0) > 7.0 else 0.0)

    points: List[ForecastPoint] = []
    current_score = base_score

    for day in range(1, days + 1):
        current_score = max(0.05, min(0.95, current_score + (slope * day * 0.5)))
        lower = max(0.0, current_score - (0.05 * (day ** 0.5)))
        upper = min(1.0, current_score + (0.05 * (day ** 0.5)))

        if current_score < 0.30:
            level = "STABLE"
        elif current_score < 0.55:
            level = "WATCH"
        elif current_score < 0.75:
            level = "ELEVATED"
        else:
            level = "REQUIRES_REVIEW"

        points.append(ForecastPoint(
            dayOffset=day,
            predictedScore=round(current_score, 2),
            projectedLevel=level,
            confidenceLower=round(lower, 2),
            confidenceUpper=round(upper, 2)
        ))

    trajectory = "escalating" if slope > 0 else ("improving" if slope < 0 else "stable")

    return ForecastResponse(
        userId=user_id,
        forecast=points,
        trajectoryDirection=trajectory,
        modelVersion=settings.model_version
    )
