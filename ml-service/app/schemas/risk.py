from typing import List, Optional
from pydantic import BaseModel, Field

class CheckInItem(BaseModel):
    mood: float = Field(..., ge=1, le=10, description="Mood score 1 to 10")
    stress: float = Field(..., ge=1, le=10, description="Stress score 1 to 10")
    energy: float = Field(..., ge=1, le=10, description="Energy score 1 to 10")
    sleepHours: float = Field(..., ge=0, le=24, description="Hours of sleep")
    timestamp: Optional[str] = None

class RiskFactor(BaseModel):
    feature: str
    impact: float
    direction: str = "increase"  # increase | decrease
    description: str

class RiskPredictionRequest(BaseModel):
    userId: str
    recentCheckIns: List[CheckInItem] = Field(..., min_length=1)
    historicalBaseline: Optional[dict] = None

class RiskPredictionResponse(BaseModel):
    riskScore: float = Field(..., ge=0.0, le=1.0)
    riskLevel: str  # STABLE | WATCH | ELEVATED | REQUIRES_REVIEW
    modelVersion: str
    factors: List[RiskFactor]
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
