from typing import List, Optional, Dict, Any
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
    # Optional multimodal signals that may accompany a checkin
    journalStressSignal: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Optional NLP stress score")
    journalSentiment: Optional[str] = Field(default=None, description="Optional NLP sentiment tag")
    voiceStressIndex: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Optional voice acoustic stress score")

class ContributingSignal(BaseModel):
    feature: str
    direction: str = "increased"  # increased | decreased | elevated | declined | stable
    impact: float = Field(..., description="Normalized positive attribution weight 0.0 to 1.0")
    description: Optional[str] = None
    baselineComparison: Optional[str] = None

class RiskFactor(BaseModel):
    """Backward-compatible factor model."""
    feature: str
    impact: float
    direction: str = "increase"  # increase | decrease
    description: str

class ForecastSummary(BaseModel):
    direction: str = "STABLE"  # INCREASING | STABLE | DECREASING
    horizonDays: int = 7
    projectedEndScore: Optional[float] = None
    projectedEndLevel: Optional[str] = None

class RiskPredictionRequest(BaseModel):
    userId: str
    caseId: Optional[str] = None
    caseStage: Optional[str] = None
    recentCheckIns: List[CheckInItem] = Field(..., min_length=1)
    historicalBaseline: Optional[Dict[str, Any]] = None
    journalStressSignal: Optional[float] = None
    voiceStressIndex: Optional[float] = None

class RiskPredictionResponse(BaseModel):
    riskScore: float = Field(..., ge=0.0, le=1.0)
    riskLevel: str  # STABLE | WATCH | ELEVATED | REQUIRES_REVIEW
    trend: str = "STABLE"  # STABLE | INCREASING | DECREASING
    anomalyDetected: bool = False
    anomalyScore: float = 0.0
    forecast: Optional[ForecastSummary] = None
    contributingSignals: List[ContributingSignal] = Field(default_factory=list)
    caseStage: Optional[str] = None
    caseStageContext: Optional[str] = None  # Backward compatibility
    humanReviewRecommended: bool = False
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    limitations: List[str] = Field(default_factory=list)
    modelVersion: str
    factors: List[RiskFactor] = Field(default_factory=list)  # Backward compatibility
    disclaimer: str = "Non-diagnostic decision-support signal for human counselor review only."

class AnomalyAffectedFeature(BaseModel):
    feature: str
    currentValue: float
    baselineValue: float
    deviation: float
    direction: str  # increased | decreased
    severity: str = "moderate"  # low | moderate | high
    description: Optional[str] = None

class AnomalyDetectionRequest(BaseModel):
    userId: str
    currentCheckIn: CheckInItem
    historicalCheckIns: List[CheckInItem] = Field(default_factory=list)
    caseStage: Optional[str] = None

class AnomalyDetectionResponse(BaseModel):
    isAnomaly: bool  # Backward compatibility
    anomalyDetected: bool
    anomalyScore: float = Field(..., ge=0.0, le=1.0)
    direction: str = "stable"  # deteriorating | escalating | stable | improving
    affectedFeatures: List[AnomalyAffectedFeature] = Field(default_factory=list)
    deviationMetrics: Dict[str, Any] = Field(default_factory=dict)  # Backward compatibility
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    limitations: List[str] = Field(default_factory=list)
    modelVersion: str
    disclaimer: str = "Non-diagnostic personal baseline anomaly estimation."

class ForecastRequest(BaseModel):
    userId: str
    checkIns: List[CheckInItem] = Field(..., min_length=1)
    forecastDays: int = 7
    caseStage: Optional[str] = None

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
    confidence: float = 0.85
    limitations: List[str] = Field(default_factory=list)
    modelVersion: str
    disclaimer: str = "Projected trend based on historical trajectory. Non-diagnostic decision support only."

class VoiceAnalysisRequest(BaseModel):
    userId: str
    audioDurationSeconds: float = 5.0
    sampleRate: Optional[int] = 16000

class VoiceAnalysisResponse(BaseModel):
    userId: str
    voiceStressIndex: float
    jitterDelta: float
    shimmerDelta: float
    pitchVariability: str
    status: str = "prototype_simulated"
    disclaimer: str = "Prototype — voice stress analysis module planned. Non-diagnostic decision support only."
