from typing import List, Dict
from app.schemas.risk import RiskFactor

def calculate_feature_attribution(features: Dict[str, float]) -> List[RiskFactor]:
    """
    Computes explainability factors inspired by SHAP local feature importance.
    Maps feature metrics to non-diagnostic contributing signal percentages.
    """
    factors: List[RiskFactor] = []

    # Sleep deficit factor
    sleep_def = features.get("sleep_deficit_ratio", 0.0)
    if sleep_def > 0.15:
        impact_pct = min(0.35, sleep_def * 0.4)
        factors.append(RiskFactor(
            feature="Sleep Reduction",
            impact=round(impact_pct, 2),
            direction="increase",
            description=f"Average sleep ({features.get('avg_sleep', 0)}h) is below target baseline"
        ))

    # Stress elevation factor
    avg_stress = features.get("avg_stress", 5.0)
    if avg_stress > 5.5:
        impact_pct = min(0.30, (avg_stress - 5.0) / 10.0 * 0.5)
        factors.append(RiskFactor(
            feature="Elevated Stress",
            impact=round(impact_pct, 2),
            direction="increase",
            description=f"Reported stress averages {avg_stress}/10"
        ))

    # Mood decline factor
    avg_mood = features.get("avg_mood", 7.0)
    if avg_mood < 5.0:
        impact_pct = min(0.25, (5.0 - avg_mood) / 10.0 * 0.5)
        factors.append(RiskFactor(
            feature="Mood Decline",
            impact=round(impact_pct, 2),
            direction="increase",
            description=f"Reported mood averages {avg_mood}/10"
        ))

    # Energy reduction factor
    avg_energy = features.get("avg_energy", 6.0)
    if avg_energy < 4.5:
        impact_pct = min(0.20, (5.0 - avg_energy) / 10.0 * 0.4)
        factors.append(RiskFactor(
            feature="Energy Depletion",
            impact=round(impact_pct, 2),
            direction="increase",
            description=f"Reported energy level is lower ({avg_energy}/10)"
        ))

    # If no risk factors detected, provide positive baseline balance
    if not factors:
        factors.append(RiskFactor(
            feature="Stable Behavioral Patterns",
            impact=0.05,
            direction="decrease",
            description="Metrics are within expected normal baseline ranges"
        ))

    # Sort factors by impact descending
    factors.sort(key=lambda x: x.impact, reverse=True)
    return factors
