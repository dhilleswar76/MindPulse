import unittest
import sys
import os

# Ensure ml-service root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.schemas.risk import (
    CheckInItem,
    RiskPredictionRequest,
    AnomalyDetectionRequest,
    ForecastRequest,
    TrendAnalysisRequest,
    UnifiedAnalysisRequest,
)
from app.services.risk_service import compute_risk_prediction, compute_unified_analysis
from app.services.anomaly_service import detect_checkin_anomaly
from app.services.forecast_service import generate_risk_forecast
from app.services.trend_service import analyze_longitudinal_trend
from app.explainability.shap_engine import calculate_shap_attributions
from app.feature_engineering.extractors import extract_longitudinal_features
from app.services.model_engine import model_engine
from app.api.endpoints import (
    health_check,
    predict_risk_endpoint,
    explain_risk_endpoint,
    detect_anomaly_endpoint,
    analyze_trend_endpoint,
    forecast_risk_endpoint,
    unified_analyze_endpoint,
)

class TestMindPulseMLPipeline(unittest.TestCase):
    """
    Comprehensive test suite for Person 3 — AI/ML Risk, Anomaly & Forecasting.
    Verifies all behavioral scenarios, personal baselines, SHAP explainability,
    multi-window trend analysis, short-term forecasting, and unified endpoints under non-diagnostic guidelines.
    """

    # 1. Normal user with sufficient history
    def test_01_normal_user_sufficient_history(self):
        history = [
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=3.0, caseStage="INVESTIGATION"),
            CheckInItem(mood=7.5, stress=3.5, energy=7.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.5, caseStage="INVESTIGATION"),
            CheckInItem(mood=7.0, stress=4.0, energy=6.5, sleepHours=7.5, senseOfSafety=8.5, caseRelatedStress=3.0, caseStage="INVESTIGATION"),
            CheckInItem(mood=8.0, stress=3.0, energy=7.5, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0, caseStage="INVESTIGATION"),
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=3.5, caseStage="INVESTIGATION"),
        ]
        res = compute_risk_prediction("user_norm_01", history, case_stage="INVESTIGATION")
        self.assertLess(res.riskScore, 0.40)
        self.assertIn(res.riskLevel, ["STABLE", "WATCH"])
        self.assertGreaterEqual(res.confidence, 0.80)
        self.assertFalse(res.anomalyDetected)
        self.assertIn(res.trend, ["STABLE", "DECREASING"])
        self.assertEqual(res.data_quality, "FAIR")

    # 2. User with insufficient history (0-2 entries, low confidence, graceful fallback)
    def test_02_insufficient_history(self):
        history_one = [
            CheckInItem(mood=6.0, stress=5.0, energy=6.0, sleepHours=7.0, senseOfSafety=7.0, caseRelatedStress=4.0, caseStage="CASE_REGISTRATION")
        ]
        res = compute_risk_prediction("user_sparse_01", history_one, case_stage="CASE_REGISTRATION")
        self.assertIsNotNone(res.riskScore)
        self.assertLess(res.confidence, 0.60)
        self.assertTrue(any("Limited history" in lim for lim in res.limitations))

        # Check anomaly with <2 entries
        anom = detect_checkin_anomaly("user_sparse_01", history_one[0], [])
        self.assertFalse(anom.anomalyDetected)
        self.assertLess(anom.confidence, 0.50)

        # Forecast with 1 entry should gracefully state forecast_available: false
        fc = generate_risk_forecast("user_sparse_01", history_one, days=7)
        self.assertFalse(fc.forecast_available)
        self.assertIn("Insufficient historical observations", fc.reason)

    # 3. Sudden mood deterioration
    def test_03_sudden_mood_deterioration(self):
        history = [
            CheckInItem(mood=8.0, stress=3.0, energy=8.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=8.0, stress=3.5, energy=7.5, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=8.5, stress=3.0, energy=8.0, sleepHours=8.0, senseOfSafety=8.5, caseRelatedStress=3.0),
            CheckInItem(mood=3.0, stress=7.0, energy=3.0, sleepHours=5.0, senseOfSafety=6.0, caseRelatedStress=6.0),  # Sudden drop
        ]
        res = compute_risk_prediction("user_mood_drop", history)
        self.assertGreater(res.riskScore, 0.45)
        signal_features = [s.feature for s in res.contributingSignals]
        self.assertTrue(any("Mood" in f for f in signal_features))
        self.assertTrue(len(res.top_factors) > 0)

    # 4. Stress increase above personal baseline
    def test_04_stress_increase(self):
        history = [
            CheckInItem(mood=7.0, stress=2.5, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=2.0),
            CheckInItem(mood=7.0, stress=3.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=2.5),
            CheckInItem(mood=7.5, stress=2.5, energy=7.5, sleepHours=8.0, senseOfSafety=8.5, caseRelatedStress=2.0),
            CheckInItem(mood=6.0, stress=8.5, energy=5.0, sleepHours=6.0, senseOfSafety=7.0, caseRelatedStress=7.5),  # Stress spike
        ]
        res = compute_risk_prediction("user_stress_surge", history)
        self.assertGreaterEqual(res.riskScore, 0.45)
        signal_features = [s.feature for s in res.contributingSignals]
        self.assertTrue(any("Stress" in f for f in signal_features))

    # 5. Sleep deterioration
    def test_05_sleep_deterioration(self):
        history = [
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=3.5),
            CheckInItem(mood=7.5, stress=3.5, energy=7.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=5.5, stress=6.0, energy=4.0, sleepHours=3.0, senseOfSafety=7.0, caseRelatedStress=5.0),  # Sleep collapse 3.0h
        ]
        res = compute_risk_prediction("user_sleep_drop", history)
        signal_features = [s.feature for s in res.contributingSignals]
        self.assertTrue(any("Sleep" in f for f in signal_features))

    # 6. Safety deterioration (Atrocity / Witness threat)
    def test_06_safety_deterioration(self):
        history = [
            CheckInItem(mood=7.0, stress=3.5, energy=7.0, sleepHours=7.5, senseOfSafety=8.5, caseRelatedStress=3.0),
            CheckInItem(mood=7.5, stress=3.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.5, caseRelatedStress=3.0),
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=8.0, senseOfSafety=9.0, caseRelatedStress=3.0),
            CheckInItem(mood=5.0, stress=7.5, energy=5.0, sleepHours=5.5, senseOfSafety=2.5, caseRelatedStress=8.5),  # Safety dropped to 2.5
        ]
        res = compute_risk_prediction("user_safety_drop", history, case_stage="PROTECTION_SUPPORT")
        self.assertGreater(res.riskScore, 0.60)
        self.assertIn(res.riskLevel, ["ELEVATED", "REQUIRES_REVIEW"])
        self.assertTrue(res.humanReviewRecommended)
        
        # Test anomaly detector specific to safety shock
        anom = detect_checkin_anomaly("user_safety_drop", history[-1], history[:-1])
        self.assertTrue(anom.anomalyDetected)
        self.assertTrue(anom.is_anomaly)
        self.assertEqual(anom.severity, "HIGH")
        self.assertIn("safety", anom.affected_features)

    # 7. Stable user with low risk
    def test_07_stable_user(self):
        history = [
            CheckInItem(mood=8.5, stress=2.0, energy=8.0, sleepHours=8.0, senseOfSafety=9.0, caseRelatedStress=2.0),
            CheckInItem(mood=8.0, stress=2.5, energy=8.5, sleepHours=8.0, senseOfSafety=9.0, caseRelatedStress=2.0),
            CheckInItem(mood=8.5, stress=2.0, energy=8.0, sleepHours=8.5, senseOfSafety=8.5, caseRelatedStress=1.5),
        ]
        res = compute_risk_prediction("user_stable_01", history, case_stage="REHABILITATION")
        self.assertLess(res.riskScore, 0.30)
        self.assertEqual(res.riskLevel, "STABLE")
        self.assertEqual(res.risk_level, "LOW")
        self.assertFalse(res.humanReviewRecommended)

    # 8. Missing optional voice/journal features handling
    def test_08_missing_optional_features(self):
        history = [
            CheckInItem(mood=7.0, stress=4.0, energy=7.0, sleepHours=7.0, senseOfSafety=7.0, caseRelatedStress=4.0)
        ]
        # Call without optional parameters
        res = compute_risk_prediction("user_no_opt", history, journal_stress_signal=None, voice_stress_index=None)
        self.assertIsNotNone(res.riskScore)
        self.assertTrue(any("Journal" in lim for lim in res.limitations))
        self.assertTrue(any("Voice" in lim for lim in res.limitations))

        # Call WITH optional parameters
        res_with_opt = compute_risk_prediction("user_with_opt", history, journal_stress_signal=0.85, voice_stress_index=0.75)
        self.assertGreater(res_with_opt.riskScore, res.riskScore)

    # 9. Different legal stages context calibration
    def test_09_legal_stages_calibration(self):
        base_item = CheckInItem(mood=6.0, stress=5.5, energy=6.0, sleepHours=6.5, senseOfSafety=6.5, caseRelatedStress=6.0)
        history = [base_item, base_item, base_item]

        res_rehab = compute_risk_prediction("user_stage", history, case_stage="REHABILITATION")
        res_trial = compute_risk_prediction("user_stage", history, case_stage="COURT_TRIAL")
        res_protect = compute_risk_prediction("user_stage", history, case_stage="PROTECTION_SUPPORT")

        self.assertGreater(res_trial.riskScore, res_rehab.riskScore)
        self.assertGreater(res_protect.riskScore, res_rehab.riskScore)
        self.assertEqual(res_trial.caseStage, "COURT_TRIAL")

    # 10. Explainability output (SHAP TreeExplainer & TopFactors)
    def test_10_explainability_shap(self):
        history = [
            CheckInItem(mood=7.0, stress=3.5, energy=7.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=7.0, stress=3.0, energy=7.0, sleepHours=7.5, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=4.0, stress=8.0, energy=4.0, sleepHours=4.5, senseOfSafety=4.0, caseRelatedStress=8.0),
        ]
        feat_data = extract_longitudinal_features(history)
        shap_vals = model_engine.explain_sample(feat_data["feature_vector"])
        
        self.assertEqual(len(shap_vals), len(model_engine.feature_names))
        
        signals, legacy, top_factors = calculate_shap_attributions(
            feature_dict=feat_data["feature_dict"],
            raw_shap_values=shap_vals,
            baseline_info=feat_data["baseline_info"]
        )
        self.assertGreater(len(signals), 0)
        self.assertGreater(len(top_factors), 0)
        for tf in top_factors:
            self.assertIn(tf.impact, ["LOW", "MODERATE", "HIGH", "CRITICAL"])
            self.assertIsNotNone(tf.reason)

    # 11. Forecast output (trajectory, expanding confidence envelope)
    def test_11_forecast_output(self):
        history = [
            CheckInItem(mood=8.0, stress=3.0, energy=8.0, sleepHours=8.0, senseOfSafety=8.0, caseRelatedStress=3.0),
            CheckInItem(mood=7.0, stress=5.0, energy=6.5, sleepHours=7.0, senseOfSafety=7.0, caseRelatedStress=5.0),
            CheckInItem(mood=5.5, stress=7.5, energy=5.0, sleepHours=5.5, senseOfSafety=5.5, caseRelatedStress=7.5),
        ]
        f_res = generate_risk_forecast("user_fc_01", history, days=7)
        self.assertTrue(f_res.forecast_available)
        self.assertEqual(len(f_res.forecast), 7)
        self.assertEqual(f_res.trajectoryDirection, "escalating")
        
        # Verify expanding uncertainty bounds
        day1 = f_res.forecast[0]
        day7 = f_res.forecast[6]
        width_day1 = day1.confidenceUpper - day1.confidenceLower
        width_day7 = day7.confidenceUpper - day7.confidenceLower
        self.assertGreaterEqual(width_day7, width_day1)

    # 12. Dedicated Trend Analysis Service & Direction
    def test_12_trend_analysis_service(self):
        worsening_history = [
            CheckInItem(mood=8.0, stress=2.5, sleepHours=8.0, senseOfSafety=8.5),
            CheckInItem(mood=7.5, stress=3.5, sleepHours=7.5, senseOfSafety=8.0),
            CheckInItem(mood=6.5, stress=5.0, sleepHours=6.5, senseOfSafety=7.0),
            CheckInItem(mood=5.5, stress=6.5, sleepHours=5.5, senseOfSafety=5.5),
            CheckInItem(mood=4.5, stress=8.0, sleepHours=4.5, senseOfSafety=4.0),
        ]
        t_res = analyze_longitudinal_trend("user_trend_worsening", worsening_history)
        self.assertEqual(t_res.direction, "WORSENING")
        self.assertGreaterEqual(t_res.consecutive_deterioration_count, 2)
        self.assertGreater(len(t_res.explanation), 0)

        # Improving history
        improving_history = [
            CheckInItem(mood=4.0, stress=8.0, sleepHours=5.0, senseOfSafety=4.0),
            CheckInItem(mood=5.0, stress=7.0, sleepHours=6.0, senseOfSafety=5.5),
            CheckInItem(mood=6.5, stress=5.5, sleepHours=7.0, senseOfSafety=7.0),
            CheckInItem(mood=7.5, stress=4.0, sleepHours=7.5, senseOfSafety=8.0),
            CheckInItem(mood=8.0, stress=3.0, sleepHours=8.0, senseOfSafety=8.5),
        ]
        t_imp = analyze_longitudinal_trend("user_trend_improving", improving_history)
        self.assertEqual(t_imp.direction, "IMPROVING")

    # 13. Volatile user trajectory
    def test_13_volatile_user_trajectory(self):
        volatile_history = [
            CheckInItem(mood=9.0, stress=2.0, sleepHours=8.5, senseOfSafety=9.0),
            CheckInItem(mood=3.0, stress=8.5, sleepHours=4.0, senseOfSafety=3.0),
            CheckInItem(mood=8.5, stress=2.5, sleepHours=8.0, senseOfSafety=8.5),
            CheckInItem(mood=2.5, stress=9.0, sleepHours=3.5, senseOfSafety=2.5),
            CheckInItem(mood=8.0, stress=3.0, sleepHours=8.0, senseOfSafety=8.0),
        ]
        t_vol = analyze_longitudinal_trend("user_vol", volatile_history)
        self.assertIn(t_vol.direction, ["VOLATILE", "WORSENING"])
        self.assertGreaterEqual(t_vol.volatility_index, 0.40)

    # 14. Stable high baseline user (consistently moderate-to-high baseline is not an anomaly)
    def test_14_stable_high_baseline_user(self):
        # User who naturally reports stress around 6.5 and mood around 5.5 consistently
        stable_high_hist = [
            CheckInItem(mood=5.5, stress=6.5, energy=5.5, sleepHours=6.5, senseOfSafety=6.5),
            CheckInItem(mood=5.4, stress=6.6, energy=5.6, sleepHours=6.4, senseOfSafety=6.6),
            CheckInItem(mood=5.6, stress=6.5, energy=5.4, sleepHours=6.6, senseOfSafety=6.5),
            CheckInItem(mood=5.5, stress=6.4, energy=5.5, sleepHours=6.5, senseOfSafety=6.5),
            CheckInItem(mood=5.5, stress=6.5, energy=5.5, sleepHours=6.5, senseOfSafety=6.5),
        ]
        # Current entry matches personal baseline
        current_entry = CheckInItem(mood=5.5, stress=6.5, energy=5.5, sleepHours=6.5, senseOfSafety=6.5)
        anom = detect_checkin_anomaly("user_high_base", current_entry, stable_high_hist)
        self.assertFalse(anom.is_anomaly)
        self.assertEqual(anom.severity, "LOW")

    # 15. Flexible CheckInItem field aliases
    def test_15_field_aliases_and_fallbacks(self):
        # Pass aliases: 'sleep', 'anxiety', 'social_connection', 'wellbeing_score'
        item = CheckInItem(
            mood=7.0,
            stress=4.0,
            sleep=7.5,
            anxiety=3.5,
            social_connection=8.0,
            wellbeing_score=78.0
        )
        self.assertEqual(item.sleepHours, 7.5)
        self.assertEqual(item.supportAvailability, 8.0)
        self.assertEqual(item.anxiety, 3.5)

    # 16. Unified composite analysis endpoint
    def test_16_unified_analysis_endpoint(self):
        req = UnifiedAnalysisRequest(
            userId="user_unified_test",
            caseStage="COURT_TRIAL",
            recentCheckIns=[
                CheckInItem(mood=7.5, stress=3.5, sleepHours=7.5, senseOfSafety=8.0),
                CheckInItem(mood=7.0, stress=4.5, sleepHours=7.0, senseOfSafety=7.5),
                CheckInItem(mood=5.0, stress=7.5, sleepHours=5.0, senseOfSafety=4.5, caseRelatedStress=8.0),
            ],
            forecastDays=5
        )
        res = unified_analyze_endpoint(req)
        self.assertEqual(res.userId, "user_unified_test")
        self.assertIn("risk_score", res.risk)
        self.assertIn("is_anomaly", res.anomaly)
        self.assertIn("direction", res.trend)
        self.assertIn("forecast_points", res.forecast)
        self.assertIn("top_factors", res.explanation)
        self.assertIsNotNone(res.data_quality)
        self.assertEqual(res.data_quality.quality_level, "FAIR")

    # 17. API Endpoint Functions & Validation Handling
    def test_17_api_endpoints_and_validation(self):
        r_health = health_check()
        self.assertEqual(r_health["status"], "ok")
        self.assertTrue(r_health["nonDiagnostic"])
        self.assertIn("modelInfo", r_health)

        # Trend endpoint
        t_req = TrendAnalysisRequest(
            userId="user_t_api",
            checkIns=[
                CheckInItem(mood=7.0, stress=4.0, sleepHours=7.0),
                CheckInItem(mood=6.0, stress=5.0, sleepHours=6.5),
            ]
        )
        r_trend = analyze_trend_endpoint(t_req)
        self.assertEqual(r_trend.userId, "user_t_api")

        # Forecast endpoint
        f_req = ForecastRequest(
            userId="user_f_api",
            checkIns=t_req.checkIns,
            forecastDays=5
        )
        r_fc = forecast_risk_endpoint(f_req)
        self.assertTrue(r_fc.forecast_available)
        self.assertEqual(len(r_fc.forecast), 5)

if __name__ == "__main__":
    unittest.main()
