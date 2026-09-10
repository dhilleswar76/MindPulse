import math
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.ensemble import IsolationForest
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
    current: Optional[CheckInItem] = None,
    history: Optional[List[CheckInItem]] = None,
    case_stage: Optional[str] = None,
    check_ins: Optional[List[CheckInItem]] = None,
) -> AnomalyDetectionResponse:
    """
    Evaluates whether the latest check-in is an outlier relative to the user's personal baseline.
    Detects sudden drops in perceived safety, rapid stress/anxiety spikes, acute sleep collapse,
    and multi-signal dissonances without clinical diagnostic claims.
    
    Combines:
    1. Personal baseline Z-score and magnitude deviations
    2. Multidimensional Composite Distance
    3. Unsupervised Isolation Forest outlier assessment (when historical samples >= 5)
    """
    # Reconcile arguments if list passed
    if check_ins and (current is None or not history):
        current = check_ins[-1]
        history = check_ins[:-1]

    if current is None:
        return AnomalyDetectionResponse(
            is_anomaly=False,
            isAnomaly=False,
            anomalyDetected=False,
            anomaly_score=0.0,
            anomalyScore=0.0,
            severity="LOW",
            direction="stable",
            affected_features=[],
            affectedFeatures=[],
            explanation=["No check-in provided for anomaly detection."],
            deviationMetrics={},
            confidence=0.30,
            data_quality="INSUFFICIENT",
            observations_used=0,
            limitations=["No check-in provided."],
            modelVersion=settings.model_version,
            disclaimer="Non-diagnostic personal baseline anomaly estimation."
        )

    history = history or []
    limitations: List[str] = []
    n_hist = len(history)

    # Handle insufficient history (< 2 entries)
    if n_hist < 2:
        limitations.append(
            f"Insufficient historical check-ins ({n_hist}) to establish a personalized statistical baseline. Anomaly evaluation is limited to normative priors."
        )
        return AnomalyDetectionResponse(
            is_anomaly=False,
            isAnomaly=False,
            anomalyDetected=False,
            anomaly_score=0.08,
            anomalyScore=0.08,
            severity="LOW",
            direction="stable",
            affected_features=[],
            affectedFeatures=[],
            explanation=["Insufficient history to detect personal baseline anomaly; normative reference applied."],
            deviationMetrics={
                "moodDelta": 0.0,
                "sleepDelta": 0.0,
                "stressDelta": 0.0,
                "safetyDelta": 0.0,
                "anxietyDelta": 0.0,
                "caseStressDelta": 0.0,
            },
            confidence=0.40,
            data_quality="INSUFFICIENT" if n_hist == 0 else "LIMITED",
            observations_used=n_hist + 1,
            limitations=limitations,
            modelVersion=settings.model_version,
            disclaimer="Non-diagnostic personal baseline anomaly estimation."
        )

    # Extract historical vectors
    h_moods = [float(c.mood) for c in history]
    h_stresses = [float(c.stress) for c in history]
    h_sleeps = [float(c.sleepHours if c.sleepHours is not None else (c.sleep if c.sleep is not None else 7.0)) for c in history]
    h_safeties = [float(c.senseOfSafety if c.senseOfSafety is not None else 7.0) for c in history]
    h_case_stresses = [float(c.caseRelatedStress if c.caseRelatedStress is not None else 5.0) for c in history]
    h_anxieties = [float(c.anxiety if c.anxiety is not None else c.stress) for c in history]

    # Compute personal baseline statistics
    m_mood, s_mood = _calc_stats(h_moods)
    m_stress, s_stress = _calc_stats(h_stresses)
    m_sleep, s_sleep = _calc_stats(h_sleeps)
    m_safety, s_safety = _calc_stats(h_safeties)
    m_case, s_case = _calc_stats(h_case_stresses)
    m_anxiety, s_anxiety = _calc_stats(h_anxieties)

    # Current values
    curr_mood = float(current.mood)
    curr_stress = float(current.stress)
    curr_sleep = float(current.sleepHours if current.sleepHours is not None else (current.sleep if current.sleep is not None else 7.0))
    curr_safety = float(current.senseOfSafety if current.senseOfSafety is not None else 7.0)
    curr_case = float(current.caseRelatedStress if current.caseRelatedStress is not None else 5.0)
    curr_anxiety = float(current.anxiety if current.anxiety is not None else current.stress)

    # Calculate deviations & Z-scores
    d_mood = curr_mood - m_mood
    d_stress = curr_stress - m_stress
    d_sleep = curr_sleep - m_sleep
    d_safety = curr_safety - m_safety
    d_case = curr_case - m_case
    d_anxiety = curr_anxiety - m_anxiety

    z_mood = d_mood / s_mood
    z_stress = d_stress / s_stress
    z_sleep = d_sleep / s_sleep
    z_safety = d_safety / s_safety
    z_case = d_case / s_case
    z_anxiety = d_anxiety / s_anxiety

    affected_features_models: List[AnomalyAffectedFeature] = []
    affected_feature_names: List[str] = []
    explanation_strings: List[str] = []

    # 1. Sense of Safety Shock (Critical for Atrocity Victims & Protected Witnesses)
    if d_safety <= -2.0 or z_safety <= -1.8:
        sev = "high" if (d_safety <= -3.5 or z_safety <= -2.5) else "moderate"
        msg = f"Perceived sense of safety is significantly below personal baseline ({curr_safety:.1f} vs normal {m_safety:.1f}/10)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Perceived Sense of Safety",
            currentValue=round(curr_safety, 1),
            baselineValue=round(m_safety, 1),
            deviation=round(d_safety, 2),
            direction="decreased",
            severity=sev,
            description=msg
        ))
        affected_feature_names.append("safety")
        explanation_strings.append(msg)

    # 2. Stress Surge
    if d_stress >= 2.0 or z_stress >= 1.8:
        sev = "high" if (d_stress >= 3.5 or z_stress >= 2.5) else "moderate"
        msg = f"Subjective stress surged {d_stress:+.1f} pts above personal normal ({m_stress:.1f}/10)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Subjective Stress",
            currentValue=round(curr_stress, 1),
            baselineValue=round(m_stress, 1),
            deviation=round(d_stress, 2),
            direction="increased",
            severity=sev,
            description=msg
        ))
        affected_feature_names.append("stress")
        explanation_strings.append(msg)

    # 3. Anxiety Surge
    if d_anxiety >= 2.0 or z_anxiety >= 1.8:
        sev = "high" if (d_anxiety >= 3.5 or z_anxiety >= 2.5) else "moderate"
        msg = f"Anxiety level surged {d_anxiety:+.1f} pts above personal normal ({m_anxiety:.1f}/10)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Anxiety Level",
            currentValue=round(curr_anxiety, 1),
            baselineValue=round(m_anxiety, 1),
            deviation=round(d_anxiety, 2),
            direction="increased",
            severity=sev,
            description=msg
        ))
        if "anxiety" not in affected_feature_names:
            affected_feature_names.append("anxiety")
        explanation_strings.append(msg)

    # 4. Acute Sleep Disruption
    if d_sleep <= -2.0 or curr_sleep < 4.5:
        sev = "high" if (curr_sleep <= 3.5 or d_sleep <= -3.5) else "moderate"
        msg = f"Sleep duration recorded at {curr_sleep:.1f}h ({abs(d_sleep):.1f}h below normal {m_sleep:.1f}h)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Sleep Duration",
            currentValue=round(curr_sleep, 1),
            baselineValue=round(m_sleep, 1),
            deviation=round(d_sleep, 2),
            direction="decreased",
            severity=sev,
            description=msg
        ))
        affected_feature_names.append("sleep")
        explanation_strings.append(msg)

    # 5. Mood Depletion
    if d_mood <= -2.0 or z_mood <= -1.8:
        sev = "high" if (d_mood <= -3.5 or z_mood <= -2.5) else "moderate"
        msg = f"Mood rating dropped {abs(d_mood):.1f} pts below personal normal ({m_mood:.1f}/10)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Mood Level",
            currentValue=round(curr_mood, 1),
            baselineValue=round(m_mood, 1),
            deviation=round(d_mood, 2),
            direction="decreased",
            severity=sev,
            description=msg
        ))
        affected_feature_names.append("mood")
        explanation_strings.append(msg)

    # 6. Case-Related Tension Surge
    if d_case >= 2.0 or z_case >= 1.8:
        sev = "high" if (d_case >= 3.5 or z_case >= 2.5) else "moderate"
        msg = f"Legal process tension is {d_case:+.1f} pts higher than usual ({m_case:.1f}/10)."
        affected_features_models.append(AnomalyAffectedFeature(
            feature="Case-Related Tension",
            currentValue=round(curr_case, 1),
            baselineValue=round(m_case, 1),
            deviation=round(d_case, 2),
            direction="increased",
            severity=sev,
            description=msg
        ))
        affected_feature_names.append("case_stress")
        explanation_strings.append(msg)

    # Multidimensional Mahalanobis/Z-composite norm
    sq_dist = (
        (max(0.0, z_stress)) ** 2 * 1.3 +
        (max(0.0, z_anxiety)) ** 2 * 1.2 +
        (min(0.0, z_safety)) ** 2 * 1.4 +
        (min(0.0, z_sleep)) ** 2 * 1.1 +
        (min(0.0, z_mood)) ** 2 * 1.0 +
        (max(0.0, z_case)) ** 2 * 1.1
    )
    composite_dist = math.sqrt(sq_dist / 7.1)
    raw_anomaly_score = min(1.0, composite_dist / 2.2)

    # If history >= 5, supplement with Isolation Forest outlier score
    if n_hist >= 5:
        try:
            X_hist = np.array([
                [h_moods[i], h_stresses[i], h_sleeps[i], h_safeties[i], h_case_stresses[i], h_anxieties[i]]
                for i in range(n_hist)
            ], dtype=np.float32)
            x_curr = np.array([[curr_mood, curr_stress, curr_sleep, curr_safety, curr_case, curr_anxiety]], dtype=np.float32)
            
            iso = IsolationForest(n_estimators=50, contamination=0.10, random_state=42)
            iso.fit(X_hist)
            # decision_function gives negative score for outliers
            iso_score = float(iso.decision_function(x_curr)[0])
            if iso_score < -0.05:
                raw_anomaly_score = max(raw_anomaly_score, min(1.0, 0.60 + abs(iso_score)))
        except Exception:
            pass

    has_high_severity = any(f.severity == "high" for f in affected_features_models)
    is_anomaly = raw_anomaly_score >= 0.55 or has_high_severity or (len(affected_features_models) >= 2)

    # Determine Severity Level
    if raw_anomaly_score >= 0.75 or (has_high_severity and len(affected_features_models) >= 2):
        severity = "HIGH"
    elif is_anomaly or raw_anomaly_score >= 0.50:
        severity = "MODERATE"
    else:
        severity = "LOW"

    # Determine direction
    if is_anomaly:
        direction = "deteriorating" if (d_stress > 0 or d_safety < 0 or d_mood < 0 or d_anxiety > 0) else "escalating"
    elif d_stress < -1.5 and d_mood > 1.5:
        direction = "improving"
    else:
        direction = "stable"

    if not explanation_strings:
        explanation_strings.append("Current check-in metrics align with personal normal baseline.")

    data_quality = "GOOD" if n_hist >= 6 else "FAIR"
    confidence = min(0.95, 0.68 + 0.035 * n_hist)

    return AnomalyDetectionResponse(
        is_anomaly=is_anomaly,
        isAnomaly=is_anomaly,
        anomalyDetected=is_anomaly,
        anomaly_score=round(raw_anomaly_score, 2),
        anomalyScore=round(raw_anomaly_score, 2),
        severity=severity,
        direction=direction,
        affected_features=affected_feature_names,
        affectedFeatures=affected_features_models,
        explanation=explanation_strings,
        deviationMetrics={
            "moodDelta": round(d_mood, 2),
            "sleepDelta": round(d_sleep, 2),
            "stressDelta": round(d_stress, 2),
            "safetyDelta": round(d_safety, 2),
            "anxietyDelta": round(d_anxiety, 2),
            "caseStressDelta": round(d_case, 2),
        },
        confidence=round(confidence, 2),
        data_quality=data_quality,
        observations_used=n_hist + 1,
        limitations=limitations,
        modelVersion=settings.model_version,
        disclaimer="Non-diagnostic personal baseline anomaly estimation."
    )
