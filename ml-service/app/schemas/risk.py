from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, model_validator

class CheckInItem(BaseModel):
    mood: float = Field(..., ge=1, le=10, description="Mood score 1 to 10")
    stress: float = Field(..., ge=1, le=10, description="Stress score 1 to 10")
    energy: Optional[float] = Field(default=6.0, ge=1, le=10, description="Energy score 1 to 10")
    sleepHours: Optional[float] = Field(default=7.0, ge=0, le=24, description="Hours of sleep")
    
    # Aliases and optional expanded fields for SIH 26094 longitudinal wellbeing
    sleep: Optional[float] = Field(default=None, ge=0, le=24, description="Alias for sleepHours")
    anxiety: Optional[float] = Field(default=None, ge=1, le=10, description="Anxiety score 1 to 10")
    senseOfSafety: Optional[float] = Field(default=7.0, ge=1, le=10, description="Perceived sense of safety 1 to 10")
    supportAvailability: Optional[float] = Field(default=7.0, ge=1, le=10, description="Support availability 1 to 10")
    social_connection: Optional[float] = Field(default=None, ge=1, le=10, description="Alias for supportAvailability")
    caseRelatedStress: Optional[float] = Field(default=5.0, ge=1, le=10, description="Case-related stress 1 to 10")
    wellbeing_score: Optional[float] = Field(default=None, ge=0, le=100, description="Optional composite wellbeing score")
    caseStage: Optional[str] = Field(default="INVESTIGATION", description="Current stage in case journey")
    timestamp: Optional[str] = None
    optionalNote: Optional[str] = None
    check_in_frequency: Optional[float] = Field(default=None, description="Average check-in frequency (days between submissions)")
    previous_risk: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Previous calculated risk score")

    # Multimodal signals that may accompany a checkin
    journalStressSignal: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Optional NLP stress score")
    journalSentiment: Optional[str] = Field(default=None, description="Optional NLP sentiment tag (positive/neutral/negative)")
    journal_sentiment: Optional[str] = Field(default=None, description="Alias for journalSentiment")
    journal_emotion: Optional[List[str]] = Field(default=None, description="Optional detected journal emotions")
    voiceStressIndex: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Optional voice acoustic stress score")
    voice_stress: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Alias for voiceStressIndex")

    @model_validator(mode='before')
    @classmethod
    def reconcile_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Resolve sleep / sleepHours
            if "sleepHours" not in data and "sleep" in data:
                data["sleepHours"] = data["sleep"]
            elif "sleepHours" in data and "sleep" not in data:
                data["sleep"] = data["sleepHours"]
            
            # Resolve social_connection / supportAvailability
            if "supportAvailability" not in data and "social_connection" in data:
                data["supportAvailability"] = data["social_connection"]
            elif "supportAvailability" in data and "social_connection" not in data:
                data["social_connection"] = data["supportAvailability"]
                
            # Resolve journal sentiment / voice aliases
            if "voiceStressIndex" not in data and "voice_stress" in data:
                data["voiceStressIndex"] = data["voice_stress"]
            if "journalSentiment" not in data and "journal_sentiment" in data:
                data["journalSentiment"] = data["journal_sentiment"]
        return data


class TopFactorItem(BaseModel):
    feature: str
    impact: str = "MODERATE"  # LOW | MODERATE | HIGH | CRITICAL
    direction: str = "NEGATIVE"  # POSITIVE | NEGATIVE | STABLE
    value: Optional[float] = None
    baseline: Optional[float] = None
    reason: Optional[str] = None
    impactScore: float = Field(default=0.15, description="Normalized attribution weight 0.0 to 1.0")


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
    direction: str = "STABLE"  # INCREASING | STABLE | DECREASING | WORSENING | IMPROVING
    horizonDays: int = 7
    projectedEndScore: Optional[float] = None
    projectedEndLevel: Optional[str] = None


class MetricBaselineDetail(BaseModel):
    baseline_mean: float
    baseline_std: float
    current_value: float
    deviation_from_baseline: float
    z_score: float
    status: str = "normal"  # normal | elevated | depleted


class PersonalBaselineReport(BaseModel):
    baseline_available: bool
    status: str = "personal_baseline_active"  # personal_baseline_active | default_normative_baseline
    observations_used: int
    metrics: Dict[str, MetricBaselineDetail] = Field(default_factory=dict)


class DataQualityReport(BaseModel):
    quality_level: str = "GOOD"  # INSUFFICIENT | LIMITED | FAIR | GOOD
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    observations_used: int
    limitations: List[str] = Field(default_factory=list)


class RiskPredictionRequest(BaseModel):
    userId: str
    caseId: Optional[str] = None
    caseStage: Optional[str] = None
    recentCheckIns: List[CheckInItem] = Field(..., min_length=1)
    historicalBaseline: Optional[Dict[str, Any]] = None
    journalStressSignal: Optional[float] = None
    voiceStressIndex: Optional[float] = None


class RiskPredictionResponse(BaseModel):
    # Support both 0.00-1.00 (standard backend) and 0-100 scales
    riskScore: float = Field(..., ge=0.0, le=1.0)
    risk_score: Optional[int] = Field(default=None, description="0-100 integer risk scale")
    riskLevel: str  # STABLE | WATCH | ELEVATED | REQUIRES_REVIEW or LOW | MODERATE | HIGH | CRITICAL
    risk_level: Optional[str] = None  # LOW | MODERATE | HIGH | CRITICAL
    direction: str = "STABLE"  # IMPROVING | STABLE | WORSENING
    trend: str = "STABLE"  # STABLE | INCREASING | DECREASING
    anomalyDetected: bool = False
    anomalyScore: float = 0.0
    forecast: Optional[ForecastSummary] = None
    top_factors: List[TopFactorItem] = Field(default_factory=list)
    contributingSignals: List[ContributingSignal] = Field(default_factory=list)
    caseStage: Optional[str] = None
    caseStageContext: Optional[str] = None  # Backward compatibility
    humanReviewRecommended: bool = False
    human_review_recommended: Optional[bool] = None
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    data_quality: Optional[str] = "GOOD"  # INSUFFICIENT | LIMITED | FAIR | GOOD
    observations_used: Optional[int] = None
    limitations: List[str] = Field(default_factory=list)
    baseline_report: Optional[PersonalBaselineReport] = None
    modelVersion: str
    factors: List[RiskFactor] = Field(default_factory=list)  # Backward compatibility
    disclaimer: str = "Non-diagnostic early-warning and decision-support signal for human professional review only."


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
    currentCheckIn: Optional[CheckInItem] = None
    historicalCheckIns: List[CheckInItem] = Field(default_factory=list)
    checkIns: Optional[List[CheckInItem]] = None  # Flexible alias
    caseStage: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def validate_inputs(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # If checkIns provided as a single list, slice current as last and history as preceding
            if ("currentCheckIn" not in data or data["currentCheckIn"] is None) and "checkIns" in data and data["checkIns"]:
                items = data["checkIns"]
                data["currentCheckIn"] = items[-1]
                data["historicalCheckIns"] = items[:-1]
        return data


class AnomalyDetectionResponse(BaseModel):
    is_anomaly: bool = False  # Step 8 standard
    isAnomaly: bool = False  # Backward compatibility
    anomalyDetected: bool = False
    anomaly_score: float = 0.0
    anomalyScore: float = Field(default=0.0, ge=0.0, le=1.0)
    severity: str = "LOW"  # LOW | MODERATE | HIGH | CRITICAL
    direction: str = "stable"  # deteriorating | escalating | stable | improving
    affected_features: List[str] = Field(default_factory=list)
    affectedFeatures: List[AnomalyAffectedFeature] = Field(default_factory=list)
    explanation: List[str] = Field(default_factory=list)
    deviationMetrics: Dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    data_quality: str = "GOOD"
    observations_used: int = 1
    limitations: List[str] = Field(default_factory=list)
    modelVersion: str
    disclaimer: str = "Non-diagnostic personal baseline anomaly estimation."


class TrendAnalysisRequest(BaseModel):
    userId: str
    checkIns: List[CheckInItem] = Field(..., min_length=1)
    caseStage: Optional[str] = None


class TrendAnalysisResponse(BaseModel):
    userId: str
    direction: str  # IMPROVING | STABLE | WORSENING | VOLATILE | INSUFFICIENT_DATA
    confidence: float = 0.85
    data_quality: str = "GOOD"
    observations_used: int
    recent_moving_average: Dict[str, float] = Field(default_factory=dict)
    historical_moving_average: Dict[str, float] = Field(default_factory=dict)
    slopes: Dict[str, float] = Field(default_factory=dict)
    consecutive_deterioration_count: int = 0
    volatility_index: float = 0.0
    explanation: List[str] = Field(default_factory=list)
    modelVersion: str
    disclaimer: str = "Longitudinal trend analysis for non-diagnostic decision support."


class ForecastPoint(BaseModel):
    dayOffset: int
    predictedScore: float
    projectedLevel: str
    confidenceLower: float
    confidenceUpper: float


class ForecastRequest(BaseModel):
    userId: str
    checkIns: List[CheckInItem] = Field(..., min_length=1)
    forecastDays: int = Field(default=7, ge=1, le=30)
    caseStage: Optional[str] = None


class ForecastResponse(BaseModel):
    userId: str
    forecast_available: bool = True
    reason: Optional[str] = None
    forecast: List[ForecastPoint] = Field(default_factory=list)
    trajectoryDirection: str = "stable"  # improving | stable | escalating | worsening
    confidence: float = 0.85
    data_quality: str = "GOOD"
    observations_used: int = 0
    limitations: List[str] = Field(default_factory=list)
    modelVersion: str
    disclaimer: str = "Projected trajectory based on historical momentum. Non-diagnostic decision support only."


class UnifiedAnalysisRequest(BaseModel):
    userId: str
    caseId: Optional[str] = None
    caseStage: Optional[str] = None
    recentCheckIns: List[CheckInItem] = Field(..., min_length=1)
    historicalBaseline: Optional[Dict[str, Any]] = None
    journalStressSignal: Optional[float] = None
    voiceStressIndex: Optional[float] = None
    forecastDays: int = Field(default=7, ge=1, le=14)


class UnifiedAnalysisResponse(BaseModel):
    userId: str
    caseStage: Optional[str] = None
    risk: Dict[str, Any]
    anomaly: Dict[str, Any]
    trend: Dict[str, Any]
    forecast: Dict[str, Any]
    explanation: Dict[str, Any]
    data_quality: DataQualityReport
    modelVersion: str
    humanReviewRecommended: bool = False
    disclaimer: str = "MindPulse decision-support system provides non-diagnostic alerts to assist human professionals."


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
