from typing import List, Dict, Any, Tuple
from app.schemas.risk import ContributingSignal, RiskFactor, TopFactorItem

# Human-readable feature metadata and clinical counselor descriptions
FEATURE_METADATA: Dict[str, Dict[str, Any]] = {
    "safety_deviation": {
        "title": "Safety Perception Drop",
        "category": "safety",
        "direction_pos": "decreased",   # lower safety means higher risk
        "description_fn": lambda val, base: f"Perceived sense of safety is {abs(val):.1f} pts below personal historical baseline ({base:.1f}/10)."
    },
    "latest_safety": {
        "title": "Low Sense of Safety",
        "category": "safety",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Reported sense of safety ({val:.1f}/10) indicates heightened vulnerability."
    },
    "stress_deviation": {
        "title": "Stress Surge Above Normal",
        "category": "stress",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Recent stress level is {val:+.1f} pts above personal baseline ({base:.1f}/10)."
    },
    "latest_stress": {
        "title": "Elevated Subjective Stress",
        "category": "stress",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Reported stress averages {val:.1f}/10."
    },
    "anxiety_deviation": {
        "title": "Anxiety Surge Above Normal",
        "category": "anxiety",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Recent anxiety is {val:+.1f} pts above personal normal ({base:.1f}/10)."
    },
    "latest_anxiety": {
        "title": "Elevated Anxiety",
        "category": "anxiety",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Reported anxiety level ({val:.1f}/10) reflects heightened tension."
    },
    "case_stress_deviation": {
        "title": "Case-Related Tension Surge",
        "category": "legal_tension",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Legal process tension is {val:+.1f} pts above historical baseline ({base:.1f}/10)."
    },
    "latest_case_stress": {
        "title": "Case-Related Stress",
        "category": "legal_tension",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Case-related tension reported at {val:.1f}/10."
    },
    "sleep_deviation": {
        "title": "Acute Sleep Loss",
        "category": "sleep",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Sleep duration is {abs(val):.1f} hours below personal regular baseline ({base:.1f}h)."
    },
    "sleep_deficit_ratio": {
        "title": "Sleep Disruption",
        "category": "sleep",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Sleep duration deficit observed ({val*100:.0f}% deficit relative to 8h target)."
    },
    "sleep_disruption_flag": {
        "title": "Severe Sleep Deprivation (<5h)",
        "category": "sleep",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: "Restricted sleep under 5 hours recorded, indicating possible hyperarousal."
    },
    "latest_sleep": {
        "title": "Reduced Sleep Duration",
        "category": "sleep",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Recorded sleep duration is {val:.1f} hours."
    },
    "mood_deviation": {
        "title": "Mood Decline Below Normal",
        "category": "mood",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Mood rating is {abs(val):.1f} pts below personal historical baseline ({base:.1f}/10)."
    },
    "latest_mood": {
        "title": "Depleted Mood State",
        "category": "mood",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Reported mood level ({val:.1f}/10) reflects emotional strain."
    },
    "latest_wellbeing": {
        "title": "Low Overall Wellbeing Index",
        "category": "wellbeing",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: f"Composite wellbeing index is {val:.1f}/100."
    },
    "wellbeing_slope": {
        "title": "Declining Longitudinal Wellbeing",
        "category": "trend",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: "Longitudinal trajectory shows consecutive decline in overall wellbeing."
    },
    "consecutive_deterioration_count": {
        "title": "Repeated Consecutive Deterioration",
        "category": "trend",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Distress has intensified across {int(val)} consecutive check-in observations."
    },
    "stage_is_trial": {
        "title": "Court / Trial Stage Sensitivity",
        "category": "case_context",
        "direction_pos": "elevated",
        "description_fn": lambda val, base: "Active Court / Trial stage: acute hearing and deposition anxiety typically spike during this milestone."
    },
    "stage_is_protection": {
        "title": "Witness Protection & Threat Context",
        "category": "case_context",
        "direction_pos": "elevated",
        "description_fn": lambda val, base: "Active Witness Protection stage: elevated threat assessment context."
    },
    "stress_slope": {
        "title": "Accelerating Stress Trend",
        "category": "trend",
        "direction_pos": "increased",
        "description_fn": lambda val, base: "Upward trajectory in distress velocity over consecutive check-ins."
    },
    "safety_slope": {
        "title": "Deteriorating Safety Trajectory",
        "category": "trend",
        "direction_pos": "decreased",
        "description_fn": lambda val, base: "Downward trajectory in perceived safety over recent window."
    },
    "stress_volatility": {
        "title": "High Stress Volatility",
        "category": "volatility",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Significant variance across check-ins (volatility index {val:.2f})."
    },
    "journal_stress": {
        "title": "Journal Reflection Distress Signal",
        "category": "multimodal",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Optional linguistic analysis identified distress cues (stress signal: {val:.2f})."
    },
    "voice_stress": {
        "title": "Voice Acoustic Biomarker Screener",
        "category": "multimodal",
        "direction_pos": "increased",
        "description_fn": lambda val, base: f"Optional acoustic prosody screening indicated vocal tension index of {val:.2f}."
    },
}

def calculate_shap_attributions(
    feature_dict: Dict[str, float],
    raw_shap_values: Dict[str, float],
    baseline_info: Dict[str, Any],
    top_k: int = 5
) -> Tuple[List[ContributingSignal], List[RiskFactor], List[TopFactorItem]]:
    """
    Translates exact mathematical SHAP tree attributions into counselor-friendly,
    non-diagnostic contributing signals and top factors.
    """
    contributing_signals: List[ContributingSignal] = []
    legacy_factors: List[RiskFactor] = []
    top_factors: List[TopFactorItem] = []

    # Filter positive SHAP contributions (features pushing risk upward)
    positive_shaps = [
        (feat, shap_val) for feat, shap_val in raw_shap_values.items()
        if shap_val > 0.005 and feat in FEATURE_METADATA
    ]

    # Sort descending by SHAP magnitude
    positive_shaps.sort(key=lambda x: x[1], reverse=True)

    total_pos_shap = sum(s[1] for s in positive_shaps) or 1.0
    seen_categories = set()

    for feat_name, shap_val in positive_shaps:
        meta = FEATURE_METADATA[feat_name]
        cat = meta.get("category", feat_name)
        
        if cat in seen_categories and len(contributing_signals) >= 3:
            continue
        seen_categories.add(cat)

        feat_val = feature_dict.get(feat_name, 0.0)
        
        # Determine relevant baseline value
        base_val = 5.0
        if "stress" in feat_name:
            base_val = baseline_info.get("mean_stress", 4.0)
        elif "anxiety" in feat_name:
            base_val = baseline_info.get("mean_anxiety", 4.0)
        elif "safety" in feat_name:
            base_val = baseline_info.get("mean_safety", 7.5)
        elif "sleep" in feat_name:
            base_val = baseline_info.get("mean_sleep", 7.5)
        elif "mood" in feat_name:
            base_val = baseline_info.get("mean_mood", 7.0)
        elif "wellbeing" in feat_name:
            base_val = baseline_info.get("mean_wellbeing", 72.0)
        elif "case_stress" in feat_name:
            base_val = baseline_info.get("mean_case_stress", 4.0)

        # Impact as normalized percentage of positive risk force
        normalized_impact = round(min(0.45, shap_val / total_pos_shap), 2)
        if normalized_impact < 0.05:
            normalized_impact = 0.05

        impact_tier = "HIGH" if normalized_impact >= 0.25 else ("MODERATE" if normalized_impact >= 0.12 else "LOW")
        desc = meta["description_fn"](feat_val, base_val)

        # Baseline comparison string
        baseline_comp = None
        if "deviation" in feat_name or "z_score" in feat_name:
            baseline_comp = f"Deviation: {feat_val:+.1f} vs personal baseline {base_val:.1f}"

        signal = ContributingSignal(
            feature=meta["title"],
            direction=meta["direction_pos"],
            impact=normalized_impact,
            description=f"Possible contributing signal: {desc}",
            baselineComparison=baseline_comp
        )
        contributing_signals.append(signal)

        # Legacy RiskFactor for backward compatibility
        legacy_factors.append(RiskFactor(
            feature=meta["title"],
            impact=normalized_impact,
            direction="increase",
            description=desc
        ))

        # TopFactorItem for Step 11 schema
        top_factors.append(TopFactorItem(
            feature=meta["title"],
            impact=impact_tier,
            direction="NEGATIVE" if meta["direction_pos"] in ["increased", "decreased", "elevated"] else "STABLE",
            value=round(feat_val, 2),
            baseline=round(base_val, 2),
            reason=desc,
            impactScore=normalized_impact
        ))

        if len(contributing_signals) >= top_k:
            break

    # If no positive risk factors detected (stable individual)
    if not contributing_signals:
        contributing_signals.append(ContributingSignal(
            feature="Stable Behavioral Patterns",
            direction="stable",
            impact=0.05,
            description="Possible contributing signal: Recent metrics align with expected personal baseline and normative wellness ranges.",
            baselineComparison="All signals within personal historical normal."
        ))
        legacy_factors.append(RiskFactor(
            feature="Stable Baseline",
            impact=0.05,
            direction="decrease",
            description="Metrics are within expected personal normal baseline ranges."
        ))
        top_factors.append(TopFactorItem(
            feature="Stable Baseline",
            impact="LOW",
            direction="POSITIVE",
            value=7.5,
            baseline=7.5,
            reason="All monitored distress indicators remain within personal baseline ranges.",
            impactScore=0.05
        ))

    return contributing_signals, legacy_factors, top_factors

def calculate_feature_attribution(features: Dict[str, float]) -> List[RiskFactor]:
    """
    Backward compatible helper for existing callers.
    """
    from app.services.model_engine import model_engine
    from app.feature_engineering.extractors import FEATURE_NAMES
    
    vec = [features.get(f, 0.0) for f in FEATURE_NAMES]
    shap_vals = model_engine.explain_sample(vec)
    _, legacy_factors, _ = calculate_shap_attributions(
        feature_dict=features,
        raw_shap_values=shap_vals,
        baseline_info={"mean_stress": features.get("avg_stress", 4.0),
                       "mean_safety": features.get("avg_safety", 7.5),
                       "mean_sleep": features.get("avg_sleep", 7.5),
                       "mean_mood": features.get("avg_mood", 7.0),
                       "mean_case_stress": features.get("avg_case_stress", 4.0)}
    )
    return legacy_factors
