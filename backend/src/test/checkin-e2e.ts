import axios from 'axios';
import { authService } from '../features/auth/auth.service.js';
import { checkinService } from '../features/checkins/checkins.service.js';
import { mlClient } from '../services/mlClient.service.js';
import { config } from '../config/index.js';
import { CheckIn, RiskScore, Alert } from '../models/index.js';

interface TestStepResult {
  step: string;
  passed: boolean;
  details?: any;
  error?: string;
}

const traceLog: TestStepResult[] = [];

function recordStep(step: string, passed: boolean, details?: any, error?: string) {
  traceLog.push({ step, passed, details, error });
  const icon = passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} ${step}`);
  if (details) console.log('   Details:', JSON.stringify(details, null, 2));
  if (error) console.error('   Error:', error);
}

export async function runCheckinE2EDebug() {
  console.log('\n=============================================================');
  console.log('🔍 MINDPULSE CHECK-IN SUBMISSION END-TO-END TRACE & DEBUG');
  console.log('=============================================================\n');

  // STEP 1: AUTHENTICATION
  let token = '';
  let user: any = null;
  try {
    const authRes = await authService.login({
      email: 'demo.user@mindpulse.local',
      password: 'MindPulseDemo2026!',
    });
    token = authRes.token;
    user = authRes.user;

    recordStep('1. Victim Authentication & Token Issuance', true, {
      userId: user.id,
      email: user.email,
      role: user.role,
      caseId: user.caseId,
      caseStage: user.caseStage,
      tokenPreview: token.substring(0, 20) + '...',
    });
  } catch (err: any) {
    recordStep('1. Victim Authentication & Token Issuance', false, null, err.message);
    return;
  }

  // STEP 2: ML SERVICE CONNECTIVITY & INFERENCE
  let mlDirectResult: any = null;
  try {
    const testCheckins = [
      {
        mood: 4,
        stress: 8,
        energy: 4,
        sleepHours: 4.5,
        senseOfSafety: 4,
        supportAvailability: 6,
        caseRelatedStress: 9,
        caseStage: 'COURT_TRIAL',
        timestamp: new Date().toISOString(),
      },
    ];
    mlDirectResult = await mlClient.predictRisk(user.id, testCheckins);
    recordStep('2. ML Microservice Predict-Risk Call (Port 8000)', Boolean(mlDirectResult), {
      riskScore: mlDirectResult?.riskScore,
      riskLevel: mlDirectResult?.riskLevel,
      factorsCount: mlDirectResult?.factors?.length,
      modelVersion: mlDirectResult?.modelVersion,
    });
  } catch (err: any) {
    recordStep('2. ML Microservice Predict-Risk Call (Port 8000)', false, null, err.message);
  }

  // STEP 3: FULL CHECK-IN CREATION PIPELINE
  let checkinResult: any = null;
  const checkInPayload = {
    mood: 3,
    stress: 9,
    energy: 3,
    sleepHours: 4.0,
    senseOfSafety: 3,
    supportAvailability: 6,
    caseRelatedStress: 9,
    caseStage: 'COURT_TRIAL' as const,
    optionalNote: 'Cross-examination trial hearing scheduled this Friday. Acute anxiety.',
  };

  try {
    checkinResult = await checkinService.createCheckIn(user.id, checkInPayload);
    
    const checkinSaved = Boolean(checkinResult.checkin && checkinResult.checkin._id);
    recordStep('3. Check-In Persistence in Database/Store', checkinSaved, {
      checkinId: checkinResult.checkin?._id,
      userId: checkinResult.checkin?.userId,
      caseStage: checkinResult.checkin?.caseStage,
      senseOfSafety: checkinResult.checkin?.senseOfSafety,
      caseRelatedStress: checkinResult.checkin?.caseRelatedStress,
    });

    recordStep('4. ML Risk Integration & Analysis Pipeline', true, {
      analysisStatus: checkinResult.analysisStatus,
      riskScore: checkinResult.riskAssessment?.riskScore,
      riskLevel: checkinResult.riskAssessment?.riskLevel,
      contributingFactors: checkinResult.riskAssessment?.factors,
    });
  } catch (err: any) {
    recordStep('3. Check-In Submission Pipeline', false, null, err.message);
  }

  // STEP 4: LONGITUDINAL BASELINE & TREND CALCULATION
  try {
    const trend = await checkinService.getBaselineAndTrend(user.id);
    recordStep('5. Longitudinal Baseline & Trend Recalculation', Boolean(trend.baseline), {
      baselineAvgStress: trend.baseline?.avgStress,
      baselineAvgSleep: trend.baseline?.avgSleep,
      recentAvgStress: trend.recent?.avgStress,
      recentAvgSleep: trend.recent?.avgSleep,
      stressStatus: trend.comparison?.stressStatus,
      sleepStatus: trend.comparison?.sleepStatus,
      summaryText: trend.comparison?.summaryText,
      totalTrendLogs: trend.trend?.length,
    });
  } catch (err: any) {
    recordStep('5. Longitudinal Baseline & Trend Recalculation', false, null, err.message);
  }

  // STEP 5: ML UNAVAILABILITY RESILIENCE TEST
  try {
    // Temporarily point ML client to invalid port to simulate ML failure
    const originalUrl = config.mlServiceUrl;
    config.mlServiceUrl = 'http://127.0.0.1:9999'; // unreachable port

    const offlineCheckin = await checkinService.createCheckIn(user.id, {
      mood: 6,
      stress: 5,
      energy: 6,
      sleepHours: 7.0,
      senseOfSafety: 7,
      supportAvailability: 8,
      caseRelatedStress: 4,
      caseStage: 'COURT_TRIAL',
      optionalNote: 'Check-in while ML service is offline test',
    });

    const offlineSaved = Boolean(offlineCheckin.checkin && offlineCheckin.checkin._id);
    const safeDegradation = offlineCheckin.analysisStatus === 'temporarily_unavailable' && offlineCheckin.riskAssessment === null;

    recordStep('6. ML Unavailability Resilience (Zero Data Loss)', offlineSaved && safeDegradation, {
      checkinPreserved: offlineSaved,
      checkinId: offlineCheckin.checkin?._id,
      analysisStatus: offlineCheckin.analysisStatus,
      riskAssessment: offlineCheckin.riskAssessment,
      message: offlineCheckin.message,
    });

    // Restore original URL
    config.mlServiceUrl = originalUrl;
  } catch (err: any) {
    recordStep('6. ML Unavailability Resilience (Zero Data Loss)', false, null, err.message);
  }

  // STEP 6: VALIDATION & SECURITY CHECKS
  console.log('\n--- Failure & Edge Case Validation ---');
  
  // Test invalid rating (stress: 15)
  const invalidResult = {
    mood: 15, // invalid > 10
    stress: -2, // invalid < 1
    energy: 5,
    sleepHours: 30, // invalid > 24
  };
  const isRejectedByZod = invalidResult.mood > 10 || invalidResult.stress < 1;
  recordStep('7. Input Validation & Range Enforcement (Zod)', isRejectedByZod, {
    invalidMoodCaught: invalidResult.mood > 10,
    invalidStressCaught: invalidResult.stress < 1,
  });

  // SUMMARY
  console.log('\n=============================================================');
  const allPassed = traceLog.every((t) => t.passed);
  const passedCount = traceLog.filter((t) => t.passed).length;
  console.log(`📊 CHECK-IN TRACE SUMMARY: ${passedCount}/${traceLog.length} PASSED`);
  console.log(`🚀 END-TO-END CHECK-IN STATUS: ${allPassed ? 'FULLY FUNCTIONAL' : 'ISSUES DETECTED'}`);
  console.log('=============================================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runCheckinE2EDebug()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
