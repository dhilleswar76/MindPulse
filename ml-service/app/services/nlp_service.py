import re
from typing import Dict, List, Tuple
from app.schemas.journal import JournalAnalysisResponse
from app.config import settings

# Non-diagnostic signal lexicons
STRESS_KEYWORDS = {"stressed", "overwhelmed", "exhausted", "burnout", "pressure", "panic", "failing", "drained", "breaking point", "heavy", "tension"}
FEAR_KEYWORDS = {"scared", "afraid", "terrified", "fear", "dread", "anxious", "nervous", "threatened", "unsafe", "worry", "worried", "panic"}
SLEEP_KEYWORDS = {"sleep", "insomnia", "nightmare", "awake", "toss", "turning", "tired", "restless", "exhausted", "sleepless", "waking"}
CASE_KEYWORDS = {"court", "hearing", "trial", "testimony", "examination", "deposition", "judge", "lawyer", "advocate", "police", "fir", "case", "investigation", "proceeding"}
SUPPORT_KEYWORDS = {"help", "support", "counselor", "advocate", "talk", "guidance", "reach out", "assistance", "grounding", "escort", "dlsa", "friend", "family"}

POSITIVE_KEYWORDS = {"grateful", "calm", "happy", "accomplished", "peaceful", "better", "refreshed", "energized", "hopeful", "focused", "good", "relieved", "safe", "reassured"}

def _calculate_keyword_density(text: str, keywords: set) -> Tuple[int, float]:
    """Calculate match count and normalized intensity score [0.0 - 1.0]."""
    count = 0
    for kw in keywords:
        pattern = r'\b' + re.escape(kw) + r'\b'
        matches = len(re.findall(pattern, text))
        count += matches
    
    # Sigmoidal scaling for signal intensity
    score = min(0.95, round(count * 0.22, 2)) if count > 0 else 0.0
    return count, score

def analyze_journal_text(user_id: str, text: str) -> JournalAnalysisResponse:
    """
    Lightweight, deterministic linguistic signal analysis for free-text reflection entries.
    Extracts non-diagnostic stress, fear, sleep, case-tension, and support-seeking indicators.
    
    Safety Guarantee: Strictly non-diagnostic decision-support signal proxy.
    """
    if not text or not text.strip():
        return JournalAnalysisResponse(
            sentiment="neutral",
            stressSignal=0.15,
            emotionSignals=["reflective"],
            signals={
                "stress": 0.0,
                "fear": 0.0,
                "sleep_concern": 0.0,
                "case_tension": 0.0,
                "support_seeking": 0.0
            },
            signalSummary="minimal text provided - baseline neutral reflection",
            modelVersion=settings.model_version,
            isNonDiagnostic=True,
            isDemoPlaceholder=False,
            disclaimer="Non-clinical linguistic signal proxy. Not a psychological evaluation."
        )

    cleaned_text = text.lower().strip()
    
    # Calculate non-diagnostic signal intensities
    stress_cnt, stress_score = _calculate_keyword_density(cleaned_text, STRESS_KEYWORDS)
    fear_cnt, fear_score = _calculate_keyword_density(cleaned_text, FEAR_KEYWORDS)
    sleep_cnt, sleep_score = _calculate_keyword_density(cleaned_text, SLEEP_KEYWORDS)
    case_cnt, case_score = _calculate_keyword_density(cleaned_text, CASE_KEYWORDS)
    support_cnt, support_score = _calculate_keyword_density(cleaned_text, SUPPORT_KEYWORDS)
    pos_cnt, pos_score = _calculate_keyword_density(cleaned_text, POSITIVE_KEYWORDS)

    # Calculate overall sentiment
    neg_total = stress_cnt + fear_cnt + sleep_cnt
    if pos_cnt > neg_total:
        sentiment = "positive"
        overall_stress = max(0.10, round(0.30 - (pos_cnt * 0.05), 2))
    elif neg_total > pos_cnt:
        sentiment = "negative"
        overall_stress = min(0.95, round(0.40 + (neg_total * 0.10), 2))
    else:
        sentiment = "neutral"
        overall_stress = 0.35 if neg_total == 0 else 0.50

    # Build emotion/signal tag list
    tags = []
    if stress_score >= 0.20:
        tags.append("stress_elevated")
    if fear_score >= 0.20:
        tags.append("fear_related")
    if sleep_score >= 0.20:
        tags.append("sleep_concern")
    if case_score >= 0.20:
        tags.append("case_tension")
    if support_score >= 0.20:
        tags.append("support_seeking")
    if pos_score >= 0.20:
        tags.append("grounded_reassurance")

    if not tags:
        tags = ["reflective"]

    # Construct non-diagnostic human-readable summary
    summary_parts = []
    if stress_score >= 0.30:
        summary_parts.append("elevated stress-related language")
    if fear_score >= 0.30:
        summary_parts.append("fear-related language detected")
    if sleep_score >= 0.30:
        summary_parts.append("sleep concern signal detected")
    if case_score >= 0.30:
        summary_parts.append("case-related tension language detected")
    if support_score >= 0.30:
        summary_parts.append("support-seeking language detected")
    if pos_score >= 0.30:
        summary_parts.append("positive/grounding indicators present")

    if summary_parts:
        signal_summary = "; ".join(summary_parts)
    else:
        signal_summary = "general reflection with baseline emotional balance"

    return JournalAnalysisResponse(
        sentiment=sentiment,
        stressSignal=overall_stress,
        emotionSignals=tags,
        signals={
            "stress": stress_score,
            "fear": fear_score,
            "sleep_concern": sleep_score,
            "case_tension": case_score,
            "support_seeking": support_score
        },
        signalSummary=signal_summary,
        modelVersion=settings.model_version,
        isNonDiagnostic=True,
        isDemoPlaceholder=False,
        disclaimer="Non-clinical linguistic signal proxy. Not a psychological evaluation."
    )
