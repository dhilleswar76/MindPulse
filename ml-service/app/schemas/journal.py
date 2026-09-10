from typing import List
from pydantic import BaseModel, Field

class JournalAnalysisRequest(BaseModel):
    userId: str
    text: str = Field(..., min_length=1, max_length=10000)

class JournalAnalysisResponse(BaseModel):
    sentiment: str  # positive | neutral | negative
    stressSignal: float = Field(..., ge=0.0, le=1.0)
    emotionSignals: List[str]
    modelVersion: str
    isDemoPlaceholder: bool = True
    disclaimer: str = "Prototype linguistic signal proxy. Not a psychological diagnosis."
