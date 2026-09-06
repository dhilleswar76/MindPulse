from typing import List, Dict, Any
from app.schemas.risk import CheckInItem

def extract_longitudinal_features(check_ins: List[CheckInItem]) -> Dict[str, float]:
    """
    Extracts rolling statistics and deltas from longitudinal check-in history.
    """
    if not check_ins:
        return {
            "avg_mood": 7.0,
            "avg_stress": 4.0,
            "avg_sleep": 7.5,
            "avg_energy": 6.5,
            "sleep_deficit_ratio": 0.0,
            "stress_volatility": 0.0,
            "mood_drop_recent": 0.0
        }

    moods = [c.mood for c in check_ins]
    stresses = [c.stress for c in check_ins]
    energies = [c.energy for c in check_ins]
    sleeps = [c.sleepHours for c in check_ins]

    avg_mood = sum(moods) / len(moods)
    avg_stress = sum(stresses) / len(stresses)
    avg_energy = sum(energies) / len(energies)
    avg_sleep = sum(sleeps) / len(sleeps)

    # Sleep deficit calculated against standard recommended 8 hours
    sleep_deficit_ratio = max(0.0, (8.0 - avg_sleep) / 8.0)

    # Recent vs baseline delta if >= 2 entries
    recent_mood = moods[-1]
    mood_drop = max(0.0, (avg_mood - recent_mood) / 10.0)

    # Stress variance proxy
    stress_volatility = (max(stresses) - min(stresses)) / 10.0 if len(stresses) > 1 else 0.0

    return {
        "avg_mood": round(avg_mood, 2),
        "avg_stress": round(avg_stress, 2),
        "avg_sleep": round(avg_sleep, 2),
        "avg_energy": round(avg_energy, 2),
        "sleep_deficit_ratio": round(sleep_deficit_ratio, 2),
        "stress_volatility": round(stress_volatility, 2),
        "mood_drop_recent": round(mood_drop, 2)
    }
