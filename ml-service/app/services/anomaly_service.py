from typing import List
from app.schemas.risk import CheckInItem, AnomalyDetectionResponse
from app.config import settings

def detect_checkin_anomaly(
    user_id: str,
    current: CheckInItem,
    history: List[CheckInItem]
) -> AnomalyDetectionResponse:
    """
    Evaluates whether the latest check-in is an outlier relative to personal normal.
    """
    if len(history) < 3:
        return AnomalyDetectionResponse(
            isAnomaly=False,
            anomalyScore=0.1,
            deviationMetrics={"moodZ": 0.0, "sleepDelta": 0.0},
            modelVersion=settings.model_version
        )

    avg_mood = sum(c.mood for c in history) / len(history)
    avg_sleep = sum(c.sleepHours for c in history) / len(history)
    avg_stress = sum(c.stress for c in history) / len(history)

    mood_diff = abs(current.mood - avg_mood)
    sleep_diff = abs(current.sleepHours - avg_sleep)
    stress_diff = abs(current.stress - avg_stress)

    anomaly_score = min(1.0, (mood_diff / 5.0 + sleep_diff / 4.0 + stress_diff / 5.0) / 3.0)
    is_anomaly = anomaly_score > 0.65

    return AnomalyDetectionResponse(
        isAnomaly=is_anomaly,
        anomalyScore=round(anomaly_score, 2),
        deviationMetrics={
            "moodDelta": round(current.mood - avg_mood, 2),
            "sleepDelta": round(current.sleepHours - avg_sleep, 2),
            "stressDelta": round(current.stress - avg_stress, 2)
        },
        modelVersion=settings.model_version
    )
