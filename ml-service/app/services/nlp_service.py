import re
from app.schemas.journal import JournalAnalysisResponse
from app.config import settings

NEGATIVE_KEYWORDS = {"stressed", "overwhelmed", "hopeless", "exhausted", "panic", "anxious", "failing", "cannot sleep", "burnout", "isolated", "tired", "sad"}
POSITIVE_KEYWORDS = {"grateful", "calm", "happy", "accomplished", "peaceful", "better", "refreshed", "energized", "hopeful", "focused", "good"}
EMOTION_MAP = {
    "anxiety": ["anxious", "panic", "worried", "nervous", "scared", "overthinking"],
    "fatigue": ["exhausted", "tired", "burned out", "drained", "sleepy", "burnout"],
    "sadness": ["sad", "depressed", "hopeless", "lonely", "isolated", "down"],
    "optimism": ["hopeful", "grateful", "excited", "happy", "energized", "motivated"],
    "calmness": ["peaceful", "relaxed", "calm", "balanced", "centered"]
}

def analyze_journal_text(user_id: str, text: str) -> JournalAnalysisResponse:
    """
    Lightweight keyword & heuristic linguistic analysis for journal reflection.
    Clearly designated as a prototype signal proxy.
    """
    cleaned_text = text.lower()
    
    pos_count = sum(1 for w in POSITIVE_KEYWORDS if re.search(r'\b' + re.escape(w) + r'\b', cleaned_text))
    neg_count = sum(1 for w in NEGATIVE_KEYWORDS if re.search(r'\b' + re.escape(w) + r'\b', cleaned_text))
    
    total = pos_count + neg_count
    if total == 0:
        sentiment = "neutral"
        stress_signal = 0.35
    elif neg_count > pos_count:
        sentiment = "negative"
        stress_signal = min(0.95, 0.4 + (neg_count * 0.12))
    elif pos_count > neg_count:
        sentiment = "positive"
        stress_signal = max(0.10, 0.35 - (pos_count * 0.08))
    else:
        sentiment = "neutral"
        stress_signal = 0.50

    detected_emotions = []
    for emotion, keywords in EMOTION_MAP.items():
        if any(re.search(r'\b' + re.escape(k) + r'\b', cleaned_text) for k in keywords):
            detected_emotions.append(emotion)

    if not detected_emotions:
        detected_emotions = ["reflective"]

    return JournalAnalysisResponse(
        sentiment=sentiment,
        stressSignal=round(stress_signal, 2),
        emotionSignals=detected_emotions,
        modelVersion=settings.model_version
    )
