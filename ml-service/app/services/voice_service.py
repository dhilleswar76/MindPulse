import base64
import math
import numpy as np
from typing import Optional, Dict, Any
from app.schemas.risk import VoiceAnalysisResponse

def extract_voice_stress_signals(
    user_id: str,
    audio_duration_seconds: float = 5.0,
    sample_rate: int = 16000,
    audio_base64: Optional[str] = None
) -> VoiceAnalysisResponse:
    """
    Lightweight, robust voice acoustic feature extraction pipeline (SIH26094).
    Processes raw or base64 audio streams to extract non-diagnostic acoustic proxies
    including RMS energy, zero-crossing rate, speech rate, pitch jitter, amplitude shimmer, and pause ratios.
    
    Safety Guarantee: Strictly non-diagnostic acoustic signal proxy. Not a psychiatric assessment.
    """
    duration = max(0.5, float(audio_duration_seconds))
    rms_energy = 0.05
    zcr = 0.08
    speech_rate = 4.2
    jitter = 0.032
    shimmer = 0.045
    pause_ratio = 0.22
    pitch_variability = "MODERATE"
    status_msg = "acoustic_processed_simulated"

    if audio_base64 and len(audio_base64) > 100:
        try:
            # Strip data URI header if present
            raw_base64 = audio_base64
            if "," in raw_base64:
                raw_base64 = raw_base64.split(",", 1)[1]
            
            audio_bytes = base64.b64decode(raw_base64)
            if len(audio_bytes) > 200:
                # Convert raw byte stream into numeric numpy array (int8 / uint8 / int16)
                samples = np.frombuffer(audio_bytes, dtype=np.uint8).astype(np.float32)
                # Center around zero
                samples = samples - 128.0
                
                num_samples = len(samples)
                if num_samples > 100:
                    status_msg = "acoustic_processed_real_bytes"
                    
                    # 1. RMS Energy
                    rms_val = np.sqrt(np.mean(samples ** 2))
                    rms_energy = round(float(rms_val) / 128.0, 3)

                    # 2. Zero-Crossing Rate (ZCR)
                    zero_crossings = np.nonzero(np.diff(samples > 0))[0]
                    zcr_val = len(zero_crossings) / float(num_samples)
                    zcr = round(float(zcr_val), 3)

                    # 3. Jitter proxy (period perturbation quotient via zero-crossing intervals)
                    if len(zero_crossings) > 4:
                        diffs = np.diff(zero_crossings)
                        period_std = float(np.std(diffs))
                        period_mean = float(np.mean(diffs)) + 1e-6
                        jitter = round(min(0.095, max(0.012, period_std / (period_mean * 10.0))), 3)
                    
                    # 4. Shimmer proxy (amplitude perturbation quotient via peak differences)
                    peak_diffs = np.abs(np.diff(samples[::max(1, int(len(samples)/200))]))
                    amp_mean = float(np.mean(np.abs(samples))) + 1e-6
                    shimmer = round(min(0.120, max(0.015, float(np.mean(peak_diffs)) / (amp_mean * 5.0))), 3)

                    # 5. Speech rate & pause ratio estimation
                    silence_threshold = float(np.percentile(np.abs(samples), 30))
                    silent_samples = np.sum(np.abs(samples) <= silence_threshold)
                    pause_ratio = round(min(0.60, max(0.10, float(silent_samples) / float(num_samples))), 2)
                    speech_rate = round(max(2.0, min(7.5, (1.0 - pause_ratio) * 6.5)), 1)
        except Exception:
            # Safe fallback if decoding fails
            status_msg = "acoustic_processed_fallback"

    # Compute overall voice stress index based on acoustic features
    stress_score = round(min(0.95, max(0.15, (jitter * 5.0 + shimmer * 3.5 + (1.0 - min(1.0, speech_rate / 6.0)) * 0.3 + pause_ratio * 0.4) / 1.5)), 2)

    if stress_score >= 0.65:
        pitch_variability = "ELEVATED_VARIANCE"
        level_str = "ELEVATED"
        summary_text = "Acoustic prosody signals indicate elevated vocal tension and pitch variation during speech."
    elif stress_score >= 0.45:
        pitch_variability = "MODERATE"
        level_str = "WATCH"
        summary_text = "Acoustic prosody signals show moderate vocal tension and slight cadence variation."
    else:
        pitch_variability = "LOW_VARIANCE"
        level_str = "STABLE"
        summary_text = "Acoustic speech prosody indicators remain within steady, baseline vocal parameters."

    return VoiceAnalysisResponse(
        userId=user_id,
        voiceStressIndex=stress_score,
        jitterDelta=jitter,
        shimmerDelta=shimmer,
        pitchVariability=pitch_variability,
        acousticFeatures={
            "speechRateSyllablesPerSec": speech_rate,
            "jitter": jitter,
            "shimmer": shimmer,
            "durationSeconds": round(duration, 1),
            "rmsEnergy": rms_energy,
            "zeroCrossingRate": zcr,
            "pauseFrequencyRatio": pause_ratio
        },
        voiceSignal={
            "level": level_str,
            "score": stress_score
        },
        summary=summary_text,
        status=status_msg,
        isNonDiagnostic=True,
        disclaimer="Non-clinical voice acoustic signal proxy. Not a psychological diagnosis."
    )

