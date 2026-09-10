import os
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
import xgboost as xgb
import shap
from app.feature_engineering.extractors import FEATURE_NAMES

class DistressRiskModelEngine:
    """
    Trained Gradient Boosted Decision Tree (XGBoost) model engine for
    non-diagnostic trauma-informed distress risk scoring and SHAP feature attribution.
    """
    _instance: Optional["DistressRiskModelEngine"] = None

    def __init__(self):
        self.feature_names = FEATURE_NAMES
        self.model: Optional[xgb.XGBRegressor] = None
        self.explainer: Optional[shap.TreeExplainer] = None
        self._initialize_and_fit()

    @classmethod
    def get_instance(cls) -> "DistressRiskModelEngine":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _generate_synthetic_training_data(self, n_samples: int = 3500, seed: int = 42) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates a synthetic, clinically informed distribution of trauma-informed
        longitudinal features across legal stages, baseline deviations, and safety indicators.
        """
        rng = np.random.RandomState(seed)
        X = np.zeros((n_samples, len(self.feature_names)), dtype=np.float32)
        y = np.zeros(n_samples, dtype=np.float32)

        # Synthesize diverse cohorts
        for i in range(n_samples):
            # Cohort archetype
            archetype = rng.choice(["stable", "routine_stress", "trial_anxiety", "safety_shock", "recovery", "sleep_collapse"])
            
            # Baseline parameters
            base_mood = rng.uniform(6.0, 8.5)
            base_stress = rng.uniform(2.5, 5.0)
            base_sleep = rng.uniform(6.5, 8.5)
            base_safety = rng.uniform(6.5, 9.0)
            base_case_stress = rng.uniform(2.0, 5.0)

            if archetype == "stable":
                mood = np.clip(base_mood + rng.normal(0, 0.4), 1, 10)
                stress = np.clip(base_stress + rng.normal(0, 0.5), 1, 10)
                sleep = np.clip(base_sleep + rng.normal(0, 0.5), 4, 10)
                energy = rng.uniform(6.0, 8.5)
                safety = np.clip(base_safety + rng.normal(0, 0.4), 1, 10)
                case_stress = np.clip(base_case_stress + rng.normal(0, 0.5), 1, 10)
                stage_w = rng.choice([1.0, 0.95, 1.05])
                is_trial = 0.0
                is_prot = 0.0

            elif archetype == "routine_stress":
                mood = np.clip(base_mood - rng.uniform(0.5, 1.5), 1, 10)
                stress = np.clip(base_stress + rng.uniform(1.5, 3.0), 1, 10)
                sleep = np.clip(base_sleep - rng.uniform(0.5, 1.5), 3, 9)
                energy = rng.uniform(4.5, 6.5)
                safety = np.clip(base_safety - rng.uniform(0.2, 0.8), 1, 10)
                case_stress = np.clip(base_case_stress + rng.uniform(0.5, 2.0), 1, 10)
                stage_w = rng.choice([1.04, 1.05, 1.08])
                is_trial = 0.0
                is_prot = 0.0

            elif archetype == "trial_anxiety":
                # Court / Trial stage acute pre-hearing testimony fear
                mood = np.clip(base_mood - rng.uniform(2.0, 3.5), 1, 10)
                stress = np.clip(base_stress + rng.uniform(3.0, 5.0), 1, 10)
                sleep = np.clip(base_sleep - rng.uniform(2.0, 3.5), 2, 7)
                energy = rng.uniform(3.0, 5.0)
                safety = np.clip(base_safety - rng.uniform(1.5, 3.0), 1, 10)
                case_stress = np.clip(base_case_stress + rng.uniform(3.5, 5.5), 1, 10)
                stage_w = 1.15
                is_trial = 1.0
                is_prot = 0.0

            elif archetype == "safety_shock":
                # Witness threat perception / safety collapse
                mood = np.clip(base_mood - rng.uniform(2.5, 4.0), 1, 10)
                stress = np.clip(base_stress + rng.uniform(3.5, 5.5), 1, 10)
                sleep = np.clip(base_sleep - rng.uniform(2.5, 4.0), 1, 6)
                energy = rng.uniform(2.5, 4.5)
                safety = np.clip(base_safety - rng.uniform(4.0, 6.5), 1, 10)
                case_stress = np.clip(base_case_stress + rng.uniform(3.0, 5.0), 1, 10)
                stage_w = 1.12
                is_trial = 0.0
                is_prot = 1.0

            elif archetype == "recovery":
                # Rehabilitation / stabilized after intervention
                mood = np.clip(base_mood + rng.uniform(0.2, 1.0), 1, 10)
                stress = np.clip(base_stress - rng.uniform(0.5, 1.5), 1, 10)
                sleep = np.clip(base_sleep + rng.uniform(0.2, 1.0), 6, 9)
                energy = rng.uniform(6.5, 8.5)
                safety = np.clip(base_safety + rng.uniform(0.5, 1.5), 1, 10)
                case_stress = np.clip(base_case_stress - rng.uniform(0.5, 1.5), 1, 10)
                stage_w = 0.95
                is_trial = 0.0
                is_prot = 0.0

            else:  # sleep_collapse
                mood = np.clip(base_mood - rng.uniform(1.5, 3.0), 1, 10)
                stress = np.clip(base_stress + rng.uniform(2.0, 4.0), 1, 10)
                sleep = rng.uniform(2.0, 4.5)
                energy = rng.uniform(2.0, 4.0)
                safety = np.clip(base_safety - rng.uniform(1.0, 2.0), 1, 10)
                case_stress = np.clip(base_case_stress + rng.uniform(1.5, 3.5), 1, 10)
                stage_w = 1.08
                is_trial = 0.0
                is_prot = 0.0

            # Deviations from personal baseline
            stress_dev = stress - base_stress
            safety_dev = safety - base_safety
            sleep_dev = sleep - base_sleep
            mood_dev = mood - base_mood
            case_stress_dev = case_stress - base_case_stress

            # Z-scores
            std_p = 1.2
            stress_z = stress_dev / std_p
            safety_z = safety_dev / std_p
            sleep_z = sleep_dev / std_p
            mood_z = mood_dev / std_p

            # Trend & Volatility
            stress_slope = stress_dev * 0.25
            safety_slope = safety_dev * 0.25
            mood_slope = mood_dev * 0.25
            stress_vol = abs(stress_dev) * 0.15
            safety_vol = abs(safety_dev) * 0.15

            # Sleep deficit
            sleep_deficit = max(0.0, (8.0 - sleep) / 8.0)
            sleep_flag = 1.0 if sleep < 5.0 else 0.0

            # Optional signals
            j_stress = rng.uniform(0.3, 0.9) if rng.rand() < 0.35 else 0.0
            v_stress = rng.uniform(0.3, 0.85) if rng.rand() < 0.35 else 0.0
            has_j = 1.0 if j_stress > 0 else 0.0
            has_v = 1.0 if v_stress > 0 else 0.0
            n_hist_log = np.log1p(rng.randint(1, 30))

            # Populate feature row
            row = [
                stress, mood, sleep, energy, safety, case_stress,
                stress_dev, safety_dev, sleep_dev, mood_dev, case_stress_dev,
                stress_z, safety_z, sleep_z, mood_z,
                stress_slope, safety_slope, mood_slope,
                stress_vol, safety_vol,
                sleep_deficit, sleep_flag,
                stage_w, is_trial, is_prot,
                j_stress, v_stress, has_j, has_v, n_hist_log
            ]
            X[i] = row

            # Calibrated clinical target computation
            base_score = (
                (stress / 10.0) * 0.24 +
                ((10.0 - safety) / 10.0) * 0.22 +
                ((10.0 - mood) / 10.0) * 0.16 +
                (sleep_deficit) * 0.16 +
                (case_stress / 10.0) * 0.14 +
                (max(0.0, stress_dev) / 10.0) * 0.08
            )
            # Stage context multiplier + multimodal additions
            calibrated_y = base_score * stage_w + (0.12 * j_stress) + (0.10 * v_stress) + (0.04 * is_trial) + (0.03 * is_prot)
            y[i] = float(np.clip(calibrated_y, 0.05, 0.98))

        return X, y

    def _initialize_and_fit(self):
        """Fits the XGBoost regressor and prepares the SHAP TreeExplainer."""
        X, y = self._generate_synthetic_training_data(n_samples=3500, seed=42)
        
        self.model = xgb.XGBRegressor(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            subsample=0.88,
            colsample_bytree=0.88,
            random_state=42,
            n_jobs=1,
            eval_metric="rmse"
        )
        self.model.fit(X, y)
        
        # Initialize TreeExplainer for exact Shapley feature importance computation
        self.explainer = shap.TreeExplainer(self.model)

    def predict_risk(self, feature_vector: List[float]) -> float:
        """Predicts continuous risk score in range [0.00, 1.00]."""
        X = np.array([feature_vector], dtype=np.float32)
        raw_pred = float(self.model.predict(X)[0])
        return round(float(np.clip(raw_pred, 0.00, 1.00)), 2)

    def explain_sample(self, feature_vector: List[float]) -> Dict[str, float]:
        """
        Computes exact local SHAP feature attributions using TreeExplainer.
        Returns a dictionary mapping feature_name -> shap_value.
        """
        X = np.array([feature_vector], dtype=np.float32)
        shap_vals = self.explainer.shap_values(X)
        if isinstance(shap_vals, list):
            shap_vals = shap_vals[0]
        sample_shap = shap_vals[0]

        return {
            self.feature_names[i]: float(sample_shap[i])
            for i in range(len(self.feature_names))
        }

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_type": "XGBoost Regressor (Trained Decision Support Model)",
            "n_features": len(self.feature_names),
            "feature_names": self.feature_names,
            "explainability_engine": "SHAP TreeExplainer (Lundberg & Lee)",
            "framework": "XGBoost + SHAP",
            "deterministic_seed": 42,
            "non_diagnostic": True
        }

model_engine = DistressRiskModelEngine.get_instance()
