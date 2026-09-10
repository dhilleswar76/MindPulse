from typing import List, Optional
from pydantic import BaseModel, Field

class CheckInItem(BaseModel):
    mood: float = Field(..., ge=1, le=10, description="Mood score 1 to 10")
    stress: float = Field(..., ge=1, le=10, description="Stress score 1 to 10")
    energy: float = Field(..., ge=1, le=10, description="Energy score 1 to 10")
    sleepHours: float = Field(..., ge=0, le=24, description="Hours of sleep")
    senseOfSafety: Optional[float] = Field(default=7.0, ge=1, le=10, description="Perceived sense of safety 1 to 10")
    supportAvailability: Optional[float] = Field(default=7.0, ge=1, le=10, description="Support availability 1 to 10")
    caseRelatedStress: Optional[float] = Field(default=5.0, ge=1, le=10, description="Case-related stress 1 to 10")
    caseStage: Optional[str] = Field(default="INVESTIGATION", description="Current stage in case journey")
    timestamp: Optional[str] = None

class RiskFactor(BaseModel):
    feature: str
    impact: float
    direction: str = "increase"  # increase | decrease
    description: str

class RiskPredictionRequest(BaseModel):
    userId: str
    caseId: Optional[str] = None
    caseStage: Optional[str] = None
    recentCheckIns: List[CheckInItem] = Field(..., min_length=1)
    historicalBaseline: Optional[dict] = None

class RiskPredictionResponse(BaseModel):
    riskScore: float = Field(..., ge=0.0, le=1.0)
    riskLevel: str  # STABLE | WATCH | ELEVATED | REQUIRES_REVIEW
    modelVersion: str
    factors: List[RiskFactor]
    caseStageContext: Optional[str] = None
    humanReviewRecommended: bool = False
    disclaimer: str = "Non-diagnostic decision-support signal for human review only."

class AnomalyDetectionRequest(BaseModel):
    userId: str
    currentCheckIn: CheckInItem
    historicalCheckIns: List[CheckInItem] = Field(default_factory=list)

class AnomalyDetectionResponse(BaseModel):
    isAnomaly: bool
    anomalyScore: float
    deviationMetrics: dict
    modelVersion: str

class ForecastRequest(BaseModel):
    userId: str
    checkIns: List[CheckInItem] = Field(..., min_length=1)
    forecastDays: int = 7

class ForecastPoint(BaseModel):
    dayOffset: int
    predictedScore: float
    projectedLevel: str
    confidenceLower: float
    confidenceUpper: float

class ForecastResponse(BaseModel):
    userId: str
    forecast: List[ForecastPoint]
    trajectoryDirection: str  # improving | stable | escalating
    modelVersion: str

class VoiceAnalysisRequest(BaseModel):
    userId: str
    audioDurationSeconds: float = 5.0
    sampleRate: Optional[int] = 16000
    audioBase64: Optional[str] = None

class VoiceAnalysisResponse(BaseModel):
    userId: str
    voiceStressIndex: float
    jitterDelta: float
    shimmerDelta: float
    pitchVariability: str
    acousticFeatures: Optional[dict] = None
    voiceSignal: Optional[dict] = None
    summary: Optional[str] = None
    status: str = "acoustic_processed"
    isNonDiagnostic: bool = True
    disclaimer: str = "Non-clinical voice acoustic signal proxy. Not a psychological diagnosis."


