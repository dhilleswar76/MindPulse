import math
from typing import List, Optional, Dict, Any
from app.schemas.risk import CheckInItem, TrendAnalysisResponse
from app.feature_engineering.extractors import extract_longitudinal_features
from app.config import settings

def analyze_longitudinal_trend(
    user_id: str,
    check_ins: List[CheckInItem],
    case_stage: Optional[str] = None,
) -> TrendAnalysisResponse:
    """
    Computes rigorous longitudinal trend analysis across multi-observation check-in histories:
    1. Multi-window Moving Averages (Recent vs Historical)
    2. Dimension slopes (Stress, Safety, Mood, Anxiety, Sleep, Wellbeing)
    3. Consecutive Deterioration Velocity
    4. Volatility & Stability Evaluation
    5. High-level classification: IMPROVING | STABLE | WORSENING | VOLATILE | INSUFFICIENT_DATA
    """
    if not check_ins or len(check_ins) < 2:
        return TrendAnalysisResponse(
            userId=user_id,
            direction="INSUFFICIENT_DATA",
            confidence=0.40,
            data_quality="INSUFFICIENT",
            observations_used=len(check_ins) if check_ins else 0,
            recent_moving_average={},
            historical_moving_average={},
            slopes={},
            consecutive_deterioration_count=0,
            volatility_index=0.0,
            explanation=["Insufficient historical check-ins (minimum 2 required) to establish a longitudinal trajectory."],
            modelVersion=settings.model_version,
            disclaimer="Longitudinal trend analysis for non-diagnostic decision support."
        )

    feat_data = extract_longitudinal_features(check_ins, case_stage=case_stage)
    feat_dict = feat_data["feature_dict"]
    n_obs = len(check_ins)

    # Historical moving averages
    h_mood = sum(c.mood for c in check_ins) / n_obs
    h_stress = sum(c.stress for c in check_ins) / n_obs
    h_sleep = sum(c.sleepHours if c.sleepHours is not None else 7.0 for c in check_ins) / n_obs
    h_safety = sum(c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in check_ins) / n_obs
    h_anxiety = sum(c.anxiety if c.anxiety is not None else c.stress for c in check_ins) / n_obs

    # Recent moving averages (last 3 or all)
    r_window = check_ins[-3:]
    r_mood = sum(c.mood for c in r_window) / len(r_window)
    r_stress = sum(c.stress for c in r_window) / len(r_window)
    r_sleep = sum(c.sleepHours if c.sleepHours is not None else 7.0 for c in r_window) / len(r_window)
    r_safety = sum(c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in r_window) / len(r_window)
    r_anxiety = sum(c.anxiety if c.anxiety is not None else c.stress for c in r_window) / len(r_window)

    stress_slope = feat_dict.get("stress_slope", 0.0)
    safety_slope = feat_dict.get("safety_slope", 0.0)
    mood_slope = feat_dict.get("mood_slope", 0.0)
    sleep_slope = feat_dict.get("sleep_slope", 0.0)
    anxiety_slope = feat_dict.get("anxiety_slope", 0.0)
    wellbeing_slope = feat_dict.get("wellbeing_slope", 0.0)

    stress_vol = feat_dict.get("stress_volatility", 0.0)
    safety_vol = feat_dict.get("safety_volatility", 0.0)
    mood_vol = feat_dict.get("mood_volatility", 0.0)
    composite_volatility = round((stress_vol + safety_vol + mood_vol) / 3.0, 2)

    consecutive_deterioration = int(feat_dict.get("consecutive_deterioration_count", 0))

    # Detect oscillation / sign changes in trajectory
    stress_deltas = [check_ins[i].stress - check_ins[i - 1].stress for i in range(1, len(check_ins))]
    sign_changes = sum(1 for i in range(1, len(stress_deltas)) if stress_deltas[i] * stress_deltas[i - 1] < -0.2)

    # Evaluate Trajectory Direction
    explanations: List[str] = []

    is_worsening = (
        stress_slope > 0.20 or 
        safety_slope < -0.20 or 
        mood_slope < -0.20 or 
        anxiety_slope > 0.20 or 
        wellbeing_slope < -0.25 or 
        consecutive_deterioration >= 2 or
        (r_stress - h_stress >= 1.5) or
        (h_safety - r_safety >= 1.5)
    )
    is_improving = (
        stress_slope < -0.20 and 
        mood_slope > 0.20 and 
        safety_slope >= -0.05 and
        consecutive_deterioration == 0
    )
    is_volatile = (composite_volatility >= 0.35 and sign_changes >= 1) or (composite_volatility >= 0.50 and not is_improving)

    if is_worsening:
        direction = "WORSENING"
        if stress_slope > 0.20:
            explanations.append(f"Distress and subjective stress are accelerating (slope: {stress_slope:+.2f}).")
        if safety_slope < -0.20:
            explanations.append(f"Perceived sense of safety is trending downward (slope: {safety_slope:+.2f}).")
        if mood_slope < -0.20:
            explanations.append(f"Mood ratings show consecutive downward trend (slope: {mood_slope:+.2f}).")
        if consecutive_deterioration >= 2:
            explanations.append(f"{consecutive_deterioration} consecutive observations show progressive metric deterioration.")
        if r_stress > h_stress + 1.0:
            explanations.append(f"Recent stress average ({r_stress:.1f}) exceeds historical baseline ({h_stress:.1f}).")
    elif is_improving:
        direction = "IMPROVING"
        explanations.append("Longitudinal distress is attenuating; mood and safety metrics show positive stabilization.")
    elif is_volatile:
        direction = "VOLATILE"
        explanations.append(f"High variance and oscillation across check-ins (volatility index {composite_volatility:.2f}). Rapid oscillations in reported distress.")
    else:
        direction = "STABLE"
        explanations.append("Monitored wellbeing indicators remain consistent with baseline historical trajectory.")

    confidence = round(feat_data.get("confidence", 0.85), 2)
    data_quality = feat_data.get("data_quality", "GOOD")

    return TrendAnalysisResponse(
        userId=user_id,
        direction=direction,
        confidence=confidence,
        data_quality=data_quality,
        observations_used=n_obs,
        recent_moving_average={
            "mood": round(r_mood, 2),
            "stress": round(r_stress, 2),
            "sleep": round(r_sleep, 2),
            "safety": round(r_safety, 2),
            "anxiety": round(r_anxiety, 2),
        },
        historical_moving_average={
            "mood": round(h_mood, 2),
            "stress": round(h_stress, 2),
            "sleep": round(h_sleep, 2),
            "safety": round(h_safety, 2),
            "anxiety": round(h_anxiety, 2),
        },
        slopes={
            "stress_slope": round(stress_slope, 3),
            "safety_slope": round(safety_slope, 3),
            "mood_slope": round(mood_slope, 3),
            "sleep_slope": round(sleep_slope, 3),
            "anxiety_slope": round(anxiety_slope, 3),
            "wellbeing_slope": round(wellbeing_slope, 3),
        },
        consecutive_deterioration_count=consecutive_deterioration,
        volatility_index=composite_volatility,
        explanation=explanations,
        modelVersion=settings.model_version,
        disclaimer="Longitudinal trend analysis for non-diagnostic decision support."
    )
