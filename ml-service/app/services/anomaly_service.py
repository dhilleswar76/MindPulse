import math
from typing import List, Dict, Any, Optional
from app.schemas.risk import (
    CheckInItem,
    AnomalyDetectionResponse,
    AnomalyAffectedFeature,
)
from app.config import settings

def _calc_stats(values: List[float]):
    if not values:
        return 5.0, 1.0
    mean_val = sum(values) / len(values)
    if len(values) < 2:
        return mean_val, 1.0
    var = sum((x - mean_val) ** 2 for x in values) / (len(values) - 1)
    return mean_val, max(math.sqrt(var), 0.6)

def detect_checkin_anomaly(
    user_id: str,
    current: CheckInItem,
    history: List[CheckInItem],
    case_stage: Optional[str] = None,
) -> AnomalyDetectionResponse:
    """
    Evaluates whether the latest check-in is an outlier relative to personal normal baseline.
    Detects sudden drops in perceived safety, rapid stress spikes, acute sleep collapse,
    and multi-signal dissonances without clinical diagnostic claims.
    """
    limitations: List[str] = []

    # Handle insufficient history
    if len(history) < 2:
        limitations.append(
            f"Insufficient historical check-ins ({len(history)}) to establish a personalized statistical baseline. Anomaly evaluation is limited."
        )
        return AnomalyDetectionResponse(
            isAnomaly=False,
            anomalyDetected=False,
            anomalyScore=0.08,
            direction="stable",
            affectedFeatures=[],
            deviationMetrics={
                "moodDelta": 0.0,
                "sleepDelta": 0.0,
                "stressDelta": 0.0,
                "safetyDelta": 0.0,
                "caseStressDelta": 0.0,
            },
            confidence=0.40,
            limitations=limitations,
            modelVersion=settings.model_version,
            disclaimer="Non-diagnostic personal baseline anomaly estimation."
        )

    # Extract historical vectors
    h_moods = [c.mood for c in history]
    h_stresses = [c.stress for c in history]
    h_sleeps = [c.sleepHours for c in history]
    h_safeties = [c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in history]
    h_case_stresses = [c.caseRelatedStress if c.caseRelatedStress is not None else 5.0 for c in history]

    # Compute baseline statistics
    m_mood, s_mood = _calc_stats(h_moods)
    m_stress, s_stress = _calc_stats(h_stresses)
    m_sleep, s_sleep = _calc_stats(h_sleeps)
    m_safety, s_safety = _calc_stats(h_safeties)
    m_case, s_case = _calc_stats(h_case_stresses)

    # Current values
    curr_mood = float(current.mood)
    curr_stress = float(current.stress)
    curr_sleep = float(current.sleepHours)
    curr_safety = float(current.senseOfSafety if current.senseOfSafety is not None else 7.0)
    curr_case = float(current.caseRelatedStress if current.caseRelatedStress is not None else 5.0)

    # Calculate deviations & Z-scores
    d_mood = curr_mood - m_mood
    d_stress = curr_stress - m_stress
    d_sleep = curr_sleep - m_sleep
    d_safety = curr_safety - m_safety
    d_case = curr_case - m_case

    z_mood = d_mood / s_mood
    z_stress = d_stress / s_stress
    z_sleep = d_sleep / s_sleep
    z_safety = d_safety / s_safety
    z_case = d_case / s_case

    affected_features: List[AnomalyAffectedFeature] = []

    # 1. Sense of Safety Shock (Critical for Atrocity Victims & Protected Witnesses)
    if d_safety <= -2.0 or z_safety <= -1.8:
        sev = "high" if (d_safety <= -3.5 or z_safety <= -2.5) else "moderate"
        affected_features.append(AnomalyAffectedFeature(
            feature="Perceived Sense of Safety",
            currentValue=round(curr_safety, 1),
            baselineValue=round(m_safety, 1),
            deviation=round(d_safety, 2),
            direction="decreased",
            severity=sev,
            description=f"Sense of safety dropped {abs(d_safety):.1f} pts below normal ({m_safety:.1f}/10)."
        ))

    # 2. Stress Spike
    if d_stress >= 2.0 or z_stress >= 1.8:
        sev = "high" if (d_stress >= 3.5 or z_stress >= 2.5) else "moderate"
        affected_features.append(AnomalyAffectedFeature(
            feature="Subjective Stress",
            currentValue=round(curr_stress, 1),
            baselineValue=round(m_stress, 1),
            deviation=round(d_stress, 2),
            direction="increased",
            severity=sev,
            description=f"Stress surged {d_stress:+.1f} pts above personal normal ({m_stress:.1f}/10)."
        ))

    # 3. Acute Sleep Disruption
    if d_sleep <= -2.0 or curr_sleep < 4.5:
        sev = "high" if (curr_sleep <= 3.5 or d_sleep <= -3.5) else "moderate"
        affected_features.append(AnomalyAffectedFeature(
            feature="Sleep Duration",
            currentValue=round(curr_sleep, 1),
            baselineValue=round(m_sleep, 1),
            deviation=round(d_sleep, 2),
            direction="decreased",
            severity=sev,
            description=f"Sleep recorded at {curr_sleep:.1f}h ({abs(d_sleep):.1f}h below normal {m_sleep:.1f}h)."
        ))

    # 4. Mood Depletion
    if d_mood <= -2.0 or z_mood <= -1.8:
        sev = "high" if (d_mood <= -3.5 or z_mood <= -2.5) else "moderate"
        affected_features.append(AnomalyAffectedFeature(
            feature="Mood Level",
            currentValue=round(curr_mood, 1),
            baselineValue=round(m_mood, 1),
            deviation=round(d_mood, 2),
            direction="decreased",
            severity=sev,
            description=f"Mood dropped {abs(d_mood):.1f} pts below personal normal ({m_mood:.1f}/10)."
        ))

    # 5. Case-Related Tension Surge
    if d_case >= 2.0 or z_case >= 1.8:
        sev = "high" if (d_case >= 3.5 or z_case >= 2.5) else "moderate"
        affected_features.append(AnomalyAffectedFeature(
            feature="Case-Related Tension",
            currentValue=round(curr_case, 1),
            baselineValue=round(m_case, 1),
            deviation=round(d_case, 2),
            direction="increased",
            severity=sev,
            description=f"Legal process tension is {d_case:+.1f} pts higher than usual ({m_case:.1f}/10)."
        ))

    # Multidimensional Mahalanobis/Z-composite norm
    sq_dist = (
        (max(0.0, z_stress)) ** 2 * 1.3 +
        (min(0.0, z_safety)) ** 2 * 1.4 +
        (min(0.0, z_sleep)) ** 2 * 1.1 +
        (min(0.0, z_mood)) ** 2 * 1.0 +
        (max(0.0, z_case)) ** 2 * 1.1
    )
    composite_dist = math.sqrt(sq_dist / 5.9)
    raw_anomaly_score = min(1.0, composite_dist / 2.2)

    # Determine if any high severity flag or multiple deviations
    has_high_severity = any(f.severity == "high" for f in affected_features)
    is_anomaly = raw_anomaly_score >= 0.58 or has_high_severity or (len(affected_features) >= 2)

    # Determine direction
    if is_anomaly:
        direction = "deteriorating" if (d_stress > 0 or d_safety < 0 or d_mood < 0) else "escalating"
    elif d_stress < -1.5 and d_mood > 1.5:
        direction = "improving"
    else:
        direction = "stable"

    confidence = min(0.95, 0.65 + 0.04 * len(history))

    return AnomalyDetectionResponse(
        isAnomaly=is_anomaly,
        anomalyDetected=is_anomaly,
        anomalyScore=round(raw_anomaly_score, 2),
        direction=direction,
        affectedFeatures=affected_features,
        deviationMetrics={
            "moodDelta": round(d_mood, 2),
            "sleepDelta": round(d_sleep, 2),
            "stressDelta": round(d_stress, 2),
            "safetyDelta": round(d_safety, 2),
            "caseStressDelta": round(d_case, 2),
        },
        confidence=round(confidence, 2),
        limitations=limitations,
        modelVersion=settings.model_version,
        disclaimer="Non-diagnostic personal baseline anomaly estimation."
    )
