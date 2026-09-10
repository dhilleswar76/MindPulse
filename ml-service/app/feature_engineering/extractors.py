import math
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.risk import CheckInItem, MetricBaselineDetail, PersonalBaselineReport

# Canonical case stages in MindPulse
LEGAL_STAGES = [
    "CASE_REGISTRATION",
    "INVESTIGATION",
    "COURT_TRIAL",
    "COMPENSATION",
    "REHABILITATION",
    "PROTECTION_SUPPORT",
]

# Case-stage sensitivity multiplier for trauma-informed context
STAGE_WEIGHTS: Dict[str, float] = {
    "CASE_REGISTRATION": 1.05,
    "INVESTIGATION": 1.08,
    "COURT_TRIAL": 1.15,        # Highest acute tension (testimony, cross-examination)
    "COMPENSATION": 1.04,
    "REHABILITATION": 0.95,      # Recovery & stabilization focus
    "PROTECTION_SUPPORT": 1.12,  # Heightened threat perception
}

FEATURE_NAMES = [
    "latest_stress",
    "latest_mood",
    "latest_sleep",
    "latest_energy",
    "latest_safety",
    "latest_case_stress",
    "latest_anxiety",
    "latest_wellbeing",
    "stress_deviation",
    "safety_deviation",
    "sleep_deviation",
    "mood_deviation",
    "case_stress_deviation",
    "anxiety_deviation",
    "stress_z_score",
    "safety_z_score",
    "sleep_z_score",
    "mood_z_score",
    "anxiety_z_score",
    "ma3_mood",
    "ma3_stress",
    "ma7_mood",
    "ma7_stress",
    "stress_slope",
    "safety_slope",
    "mood_slope",
    "sleep_slope",
    "anxiety_slope",
    "wellbeing_slope",
    "stress_volatility",
    "safety_volatility",
    "mood_volatility",
    "consecutive_deterioration_count",
    "sleep_deficit_ratio",
    "sleep_disruption_flag",
    "stage_weight",
    "stage_is_trial",
    "stage_is_protection",
    "journal_stress",
    "voice_stress",
    "has_journal",
    "has_voice",
    "history_length_log",
]

def _calc_mean_std(values: List[float]) -> Tuple[float, float]:
    if not values:
        return 5.0, 1.0
    mean_val = sum(values) / len(values)
    if len(values) < 2:
        return mean_val, 1.0
    variance = sum((x - mean_val) ** 2 for x in values) / (len(values) - 1)
    std_val = math.sqrt(variance)
    return mean_val, max(std_val, 0.5)

def _calc_slope(values: List[float]) -> float:
    """Calculates normalized linear regression slope over recent values."""
    n = len(values)
    if n < 2:
        return 0.0
    x = list(range(n))
    x_mean = (n - 1) / 2.0
    y_mean = sum(values) / n
    numerator = sum((x[i] - x_mean) * (values[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    if denominator == 0:
        return 0.0
    return numerator / denominator

def _calc_composite_wellbeing(mood: float, stress: float, safety: float, energy: float, sleep: float, anxiety: float) -> float:
    """
    Computes a 0-100 composite wellbeing score from multidimensional indicators.
    Higher is better (100 = optimal wellbeing, 0 = severe distress).
    """
    pos_component = (mood * 0.30 + safety * 0.25 + energy * 0.20 + min(sleep, 8.0) * (25.0 / 8.0) * 0.25) * 10.0
    stress_penalty = (stress * 0.50 + anxiety * 0.50) * 10.0
    wellbeing = 0.65 * pos_component + 0.35 * (100.0 - stress_penalty)
    return max(0.0, min(100.0, wellbeing))

def extract_longitudinal_features(
    check_ins: List[CheckInItem],
    baseline_override: Optional[Dict[str, Any]] = None,
    case_stage: Optional[str] = None,
    journal_stress_signal: Optional[float] = None,
    voice_stress_index: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Extracts structured, personal-baseline aware longitudinal features
    from check-in sequences, case-stage context, and optional multimodal inputs.
    
    Returns a dictionary containing:
      - 'feature_vector': List[float] matching FEATURE_NAMES
      - 'feature_dict': Dict[str, float] with named feature values
      - 'baseline_info': Personal baseline statistics (mean, std)
      - 'baseline_report': Structured PersonalBaselineReport model instance
      - 'confidence': Statistical confidence score (0.0 to 1.0)
      - 'data_quality': Quality level ('INSUFFICIENT' | 'LIMITED' | 'FAIR' | 'GOOD')
      - 'limitations': Any methodological limitations (e.g. low sample size)
      - 'consecutive_deteriorations': int
      - 'raw_metrics': Standard average metrics for backward compatibility
    """
    limitations: List[str] = []
    
    if not check_ins:
        limitations.append("No check-in history provided. Using default normative estimates.")
        empty_dict = {name: 0.0 for name in FEATURE_NAMES}
        empty_dict["latest_mood"] = 7.0
        empty_dict["latest_safety"] = 7.0
        empty_dict["latest_sleep"] = 7.5
        empty_dict["latest_energy"] = 6.5
        empty_dict["latest_stress"] = 4.0
        empty_dict["latest_anxiety"] = 4.0
        empty_dict["latest_wellbeing"] = 72.0
        empty_dict["latest_case_stress"] = 4.0
        empty_dict["stage_weight"] = 1.0
        return {
            "feature_vector": [empty_dict[f] for f in FEATURE_NAMES],
            "feature_dict": empty_dict,
            "baseline_info": {"status": "no_data", "samples": 0},
            "baseline_report": PersonalBaselineReport(baseline_available=False, status="no_data", observations_used=0),
            "confidence": 0.30,
            "data_quality": "INSUFFICIENT",
            "limitations": limitations,
            "consecutive_deteriorations": 0,
            "avg_mood": 7.0,
            "avg_stress": 4.0,
            "avg_sleep": 7.5,
            "avg_energy": 6.5,
            "avg_safety": 7.5,
            "avg_case_stress": 4.0,
            "sleep_deficit_ratio": 0.0,
            "stress_volatility": 0.0,
            "mood_drop_recent": 0.0,
            "safety_drop_recent": 0.0,
        }

    n_samples = len(check_ins)
    latest = check_ins[-1]

    # Extract sequences and normalize optional fields
    moods = [float(c.mood) for c in check_ins]
    stresses = [float(c.stress) for c in check_ins]
    energies = [float(c.energy if c.energy is not None else 6.0) for c in check_ins]
    sleeps = [float(c.sleepHours if c.sleepHours is not None else (c.sleep if c.sleep is not None else 7.0)) for c in check_ins]
    safeties = [float(c.senseOfSafety if c.senseOfSafety is not None else 7.0) for c in check_ins]
    case_stresses = [float(c.caseRelatedStress if c.caseRelatedStress is not None else 5.0) for c in check_ins]
    anxieties = [float(c.anxiety if c.anxiety is not None else c.stress) for c in check_ins]
    wellbeings = [
        float(c.wellbeing_score if getattr(c, 'wellbeing_score', None) is not None else _calc_composite_wellbeing(m, s, sf, e, sl, a))
        for c, m, s, sf, e, sl, a in zip(check_ins, moods, stresses, safeties, energies, sleeps, anxieties)
    ]

    # Calculate personal historical baseline
    if n_samples >= 3:
        # Personal baseline from historical entries
        mean_mood, std_mood = _calc_mean_std(moods)
        mean_stress, std_stress = _calc_mean_std(stresses)
        mean_sleep, std_sleep = _calc_mean_std(sleeps)
        mean_energy, std_energy = _calc_mean_std(energies)
        mean_safety, std_safety = _calc_mean_std(safeties)
        mean_case_stress, std_case_stress = _calc_mean_std(case_stresses)
        mean_anxiety, std_anxiety = _calc_mean_std(anxieties)
        mean_wellbeing, std_wellbeing = _calc_mean_std(wellbeings)
        baseline_status = "personal_baseline_active"
        baseline_available = True
        
        if n_samples >= 7:
            data_quality = "GOOD"
            confidence = min(0.95, 0.82 + 0.015 * min(10, n_samples))
        else:
            data_quality = "FAIR"
            confidence = 0.70 + 0.03 * n_samples
    else:
        # Insufficient history: use normative reference points
        mean_mood, std_mood = 7.0, 1.5
        mean_stress, std_stress = 4.0, 1.5
        mean_sleep, std_sleep = 7.5, 1.2
        mean_energy, std_energy = 6.5, 1.5
        mean_safety, std_safety = 7.5, 1.5
        mean_case_stress, std_case_stress = 4.0, 1.5
        mean_anxiety, std_anxiety = 4.0, 1.5
        mean_wellbeing, std_wellbeing = 72.0, 12.0
        baseline_status = "default_normative_baseline"
        baseline_available = False
        data_quality = "INSUFFICIENT" if n_samples == 1 else "LIMITED"
        confidence = 0.45 if n_samples == 1 else 0.60
        limitations.append(f"Limited history ({n_samples} check-in{'s' if n_samples > 1 else ''}): personal baseline uncalibrated; normative priors applied.")

    # Override baseline if explicit external baseline passed
    if baseline_override:
        mean_mood = baseline_override.get("mood", mean_mood)
        mean_stress = baseline_override.get("stress", mean_stress)
        mean_sleep = baseline_override.get("sleepHours", baseline_override.get("sleep", mean_sleep))
        mean_safety = baseline_override.get("senseOfSafety", mean_safety)
        mean_case_stress = baseline_override.get("caseRelatedStress", mean_case_stress)
        mean_anxiety = baseline_override.get("anxiety", mean_anxiety)
        mean_wellbeing = baseline_override.get("wellbeing_score", mean_wellbeing)
        baseline_status = "external_baseline_provided"
        baseline_available = True

    # Compute current observation metrics
    latest_stress = stresses[-1]
    latest_mood = moods[-1]
    latest_sleep = sleeps[-1]
    latest_energy = energies[-1]
    latest_safety = safeties[-1]
    latest_case_stress = case_stresses[-1]
    latest_anxiety = anxieties[-1]
    latest_wellbeing = wellbeings[-1]

    # Compute personal baseline deviations
    stress_dev = latest_stress - mean_stress
    safety_dev = latest_safety - mean_safety
    sleep_dev = latest_sleep - mean_sleep
    mood_dev = latest_mood - mean_mood
    case_stress_dev = latest_case_stress - mean_case_stress
    anxiety_dev = latest_anxiety - mean_anxiety
    wellbeing_dev = latest_wellbeing - mean_wellbeing

    # Compute Z-scores relative to personal variance
    stress_z = stress_dev / std_stress
    safety_z = safety_dev / std_safety
    sleep_z = sleep_dev / std_sleep
    mood_z = mood_dev / std_mood
    anxiety_z = anxiety_dev / std_anxiety
    wellbeing_z = wellbeing_dev / std_wellbeing

    # Moving averages: 3-window and 7-window
    w3 = check_ins[-3:]
    ma3_mood = sum(c.mood for c in w3) / len(w3)
    ma3_stress = sum(c.stress for c in w3) / len(w3)
    ma3_sleep = sum(c.sleepHours if c.sleepHours is not None else 7.0 for c in w3) / len(w3)
    ma3_safety = sum(c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in w3) / len(w3)

    w7 = check_ins[-7:]
    ma7_mood = sum(c.mood for c in w7) / len(w7)
    ma7_stress = sum(c.stress for c in w7) / len(w7)
    ma7_sleep = sum(c.sleepHours if c.sleepHours is not None else 7.0 for c in w7) / len(w7)
    ma7_safety = sum(c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in w7) / len(w7)

    # Trend slopes over recent window (up to 7 items)
    stress_slope = _calc_slope([c.stress for c in w7])
    safety_slope = _calc_slope([c.senseOfSafety if c.senseOfSafety is not None else 7.0 for c in w7])
    mood_slope = _calc_slope([c.mood for c in w7])
    sleep_slope = _calc_slope([c.sleepHours if c.sleepHours is not None else 7.0 for c in w7])
    anxiety_slope = _calc_slope([c.anxiety if c.anxiety is not None else c.stress for c in w7])
    wellbeing_slope = _calc_slope(wellbeings[-len(w7):])

    # Volatilities
    stress_vol = (max(stresses) - min(stresses)) / 10.0 if len(stresses) > 1 else 0.0
    safety_vol = (max(safeties) - min(safeties)) / 10.0 if len(safeties) > 1 else 0.0
    mood_vol = (max(moods) - min(moods)) / 10.0 if len(moods) > 1 else 0.0

    # Consecutive deterioration counter
    consecutive_deterioration = 0
    for i in range(len(wellbeings) - 1, 0, -1):
        if wellbeings[i] < wellbeings[i - 1] or stresses[i] > stresses[i - 1]:
            consecutive_deterioration += 1
        else:
            break

    # Sleep deficit (below 8.0h)
    sleep_deficit_ratio = max(0.0, (8.0 - latest_sleep) / 8.0)
    sleep_disruption_flag = 1.0 if latest_sleep < 5.0 else 0.0

    # Stage context
    effective_stage = case_stage or latest.caseStage or "INVESTIGATION"
    stage_weight = STAGE_WEIGHTS.get(effective_stage, 1.0)
    stage_is_trial = 1.0 if effective_stage in ["COURT_TRIAL", "Court / Trial"] else 0.0
    stage_is_protection = 1.0 if effective_stage in ["PROTECTION_SUPPORT", "Protection / Support"] else 0.0

    # Optional Multimodal Signals
    j_stress = journal_stress_signal if journal_stress_signal is not None else (latest.journalStressSignal or 0.0)
    has_j = 1.0 if (journal_stress_signal is not None or latest.journalStressSignal is not None) else 0.0

    v_stress = voice_stress_index if voice_stress_index is not None else (latest.voiceStressIndex or 0.0)
    has_v = 1.0 if (voice_stress_index is not None or latest.voiceStressIndex is not None) else 0.0

    if not has_j:
        limitations.append("Journal NLP signal not provided; continuing without text features.")
    if not has_v:
        limitations.append("Voice acoustic screening not provided; continuing without audio features.")

    feat_dict: Dict[str, float] = {
        "latest_stress": round(latest_stress, 2),
        "latest_mood": round(latest_mood, 2),
        "latest_sleep": round(latest_sleep, 2),
        "latest_energy": round(latest_energy, 2),
        "latest_safety": round(latest_safety, 2),
        "latest_case_stress": round(latest_case_stress, 2),
        "latest_anxiety": round(latest_anxiety, 2),
        "latest_wellbeing": round(latest_wellbeing, 2),
        "stress_deviation": round(stress_dev, 2),
        "safety_deviation": round(safety_dev, 2),
        "sleep_deviation": round(sleep_dev, 2),
        "mood_deviation": round(mood_dev, 2),
        "case_stress_deviation": round(case_stress_dev, 2),
        "anxiety_deviation": round(anxiety_dev, 2),
        "stress_z_score": round(stress_z, 2),
        "safety_z_score": round(safety_z, 2),
        "sleep_z_score": round(sleep_z, 2),
        "mood_z_score": round(mood_z, 2),
        "anxiety_z_score": round(anxiety_z, 2),
        "ma3_mood": round(ma3_mood, 2),
        "ma3_stress": round(ma3_stress, 2),
        "ma7_mood": round(ma7_mood, 2),
        "ma7_stress": round(ma7_stress, 2),
        "stress_slope": round(stress_slope, 3),
        "safety_slope": round(safety_slope, 3),
        "mood_slope": round(mood_slope, 3),
        "sleep_slope": round(sleep_slope, 3),
        "anxiety_slope": round(anxiety_slope, 3),
        "wellbeing_slope": round(wellbeing_slope, 3),
        "stress_volatility": round(stress_vol, 2),
        "safety_volatility": round(safety_vol, 2),
        "mood_volatility": round(mood_vol, 2),
        "consecutive_deterioration_count": float(consecutive_deterioration),
        "sleep_deficit_ratio": round(sleep_deficit_ratio, 2),
        "sleep_disruption_flag": sleep_disruption_flag,
        "stage_weight": round(stage_weight, 2),
        "stage_is_trial": stage_is_trial,
        "stage_is_protection": stage_is_protection,
        "journal_stress": round(j_stress, 2),
        "voice_stress": round(v_stress, 2),
        "has_journal": has_j,
        "has_voice": has_v,
        "history_length_log": round(math.log1p(n_samples), 2),
    }

    feature_vector = [feat_dict.get(f, 0.0) for f in FEATURE_NAMES]

    # Build Structured Personal Baseline Report
    def _status_for_metric(name: str, dev: float, z: float) -> str:
        if name in ["stress", "case_stress", "anxiety"]:
            return "elevated" if (dev >= 1.5 or z >= 1.5) else ("normal" if dev > -1.5 else "improved")
        else:
            return "depleted" if (dev <= -1.5 or z <= -1.5) else ("normal" if dev < 1.5 else "improved")

    baseline_report = PersonalBaselineReport(
        baseline_available=baseline_available,
        status=baseline_status,
        observations_used=n_samples,
        metrics={
            "mood": MetricBaselineDetail(
                baseline_mean=round(mean_mood, 2),
                baseline_std=round(std_mood, 2),
                current_value=round(latest_mood, 2),
                deviation_from_baseline=round(mood_dev, 2),
                z_score=round(mood_z, 2),
                status=_status_for_metric("mood", mood_dev, mood_z)
            ),
            "stress": MetricBaselineDetail(
                baseline_mean=round(mean_stress, 2),
                baseline_std=round(std_stress, 2),
                current_value=round(latest_stress, 2),
                deviation_from_baseline=round(stress_dev, 2),
                z_score=round(stress_z, 2),
                status=_status_for_metric("stress", stress_dev, stress_z)
            ),
            "sleep": MetricBaselineDetail(
                baseline_mean=round(mean_sleep, 2),
                baseline_std=round(std_sleep, 2),
                current_value=round(latest_sleep, 2),
                deviation_from_baseline=round(sleep_dev, 2),
                z_score=round(sleep_z, 2),
                status=_status_for_metric("sleep", sleep_dev, sleep_z)
            ),
            "safety": MetricBaselineDetail(
                baseline_mean=round(mean_safety, 2),
                baseline_std=round(std_safety, 2),
                current_value=round(latest_safety, 2),
                deviation_from_baseline=round(safety_dev, 2),
                z_score=round(safety_z, 2),
                status=_status_for_metric("safety", safety_dev, safety_z)
            ),
            "anxiety": MetricBaselineDetail(
                baseline_mean=round(mean_anxiety, 2),
                baseline_std=round(std_anxiety, 2),
                current_value=round(latest_anxiety, 2),
                deviation_from_baseline=round(anxiety_dev, 2),
                z_score=round(anxiety_z, 2),
                status=_status_for_metric("anxiety", anxiety_dev, anxiety_z)
            ),
            "case_stress": MetricBaselineDetail(
                baseline_mean=round(mean_case_stress, 2),
                baseline_std=round(std_case_stress, 2),
                current_value=round(latest_case_stress, 2),
                deviation_from_baseline=round(case_stress_dev, 2),
                z_score=round(case_stress_z := case_stress_dev / std_case_stress, 2),
                status=_status_for_metric("case_stress", case_stress_dev, case_stress_z)
            ),
            "wellbeing": MetricBaselineDetail(
                baseline_mean=round(mean_wellbeing, 2),
                baseline_std=round(std_wellbeing, 2),
                current_value=round(latest_wellbeing, 2),
                deviation_from_baseline=round(wellbeing_dev, 2),
                z_score=round(wellbeing_z, 2),
                status=_status_for_metric("wellbeing", wellbeing_dev, wellbeing_z)
            )
        }
    )

    # Backward compatible raw metrics
    avg_mood = sum(moods) / n_samples
    avg_stress = sum(stresses) / n_samples
    avg_sleep = sum(sleeps) / n_samples
    avg_energy = sum(energies) / n_samples
    avg_safety = sum(safeties) / n_samples
    avg_case_stress = sum(case_stresses) / n_samples
    mood_drop = max(0.0, (avg_mood - latest_mood) / 10.0)
    safety_drop = max(0.0, (avg_safety - latest_safety) / 10.0)

    return {
        "feature_vector": feature_vector,
        "feature_dict": feat_dict,
        "baseline_info": {
            "status": baseline_status,
            "samples": n_samples,
            "mean_mood": round(mean_mood, 2),
            "std_mood": round(std_mood, 2),
            "mean_stress": round(mean_stress, 2),
            "std_stress": round(std_stress, 2),
            "mean_sleep": round(mean_sleep, 2),
            "std_sleep": round(std_sleep, 2),
            "mean_safety": round(mean_safety, 2),
            "std_safety": round(std_safety, 2),
            "mean_case_stress": round(mean_case_stress, 2),
            "std_case_stress": round(std_case_stress, 2),
            "mean_anxiety": round(mean_anxiety, 2),
            "std_anxiety": round(std_anxiety, 2),
            "mean_wellbeing": round(mean_wellbeing, 2),
            "std_wellbeing": round(std_wellbeing, 2),
        },
        "baseline_report": baseline_report,
        "effective_stage": effective_stage,
        "confidence": round(confidence, 2),
        "data_quality": data_quality,
        "limitations": limitations,
        "consecutive_deteriorations": consecutive_deterioration,
        # Backward compatibility fields
        "avg_mood": round(avg_mood, 2),
        "avg_stress": round(avg_stress, 2),
        "avg_sleep": round(avg_sleep, 2),
        "avg_energy": round(avg_energy, 2),
        "avg_safety": round(avg_safety, 2),
        "avg_case_stress": round(avg_case_stress, 2),
        "sleep_deficit_ratio": round(sleep_deficit_ratio, 2),
        "stress_volatility": round(stress_vol, 2),
        "mood_drop_recent": round(mood_drop, 2),
        "safety_drop_recent": round(safety_drop, 2),
    }
