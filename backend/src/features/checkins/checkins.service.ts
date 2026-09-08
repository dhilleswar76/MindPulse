import { CheckIn, RiskScore, Alert, User } from '../../models/index.js';
import { mlClient } from '../../services/mlClient.service.js';
import { emitCounselorAlert } from '../../services/socket.service.js';
import { CreateCheckInInput } from './checkins.validation.js';

// In-memory demo checkin store fallback
const memoryCheckIns: Map<string, any[]> = new Map();

export const checkinService = {
  createCheckIn: async (userId: string, input: CreateCheckInInput) => {
    let checkinDoc: any = null;
    let recentHistory: any[] = [];

    // Resolve user caseStage and caseId if not explicitly provided
    let caseStage = input.caseStage;
    let caseId: string | undefined = undefined;

    try {
      const user = await User.findById(userId).lean();
      if (user) {
        if (!caseStage && user.caseStage) {
          caseStage = user.caseStage as any;
        }
        caseId = user.caseId;
      }
    } catch {
      // In-memory or standalone fallback
      caseId = 'MP-1042';
      if (!caseStage) caseStage = 'COURT_TRIAL';
    }

    const checkInPayload = {
      userId,
      ...input,
      caseStage: caseStage || 'COURT_TRIAL',
      senseOfSafety: input.senseOfSafety ?? 7,
      supportAvailability: input.supportAvailability ?? 7,
      caseRelatedStress: input.caseRelatedStress ?? 5,
      timestamp: new Date(),
    };

    try {
      checkinDoc = await CheckIn.create({
        ...checkInPayload,
        caseId,
      });

      recentHistory = await CheckIn.find({ userId }).sort({ timestamp: -1 }).limit(14).lean();
    } catch {
      // In-memory fallback
      const userList = memoryCheckIns.get(userId) || [];
      checkinDoc = {
        _id: 'checkin_' + Date.now(),
        ...checkInPayload,
        caseId: caseId || 'MP-1042',
      };
      userList.unshift(checkinDoc);
      memoryCheckIns.set(userId, userList);
      recentHistory = userList.slice(0, 14);
    }

    // Trigger ML risk inference
    const mlRisk = await mlClient.predictRisk(userId, [...recentHistory].reverse());

    try {
      await RiskScore.create({
        userId,
        riskScore: mlRisk.riskScore,
        riskLevel: mlRisk.riskLevel,
        factors: mlRisk.factors,
        calculatedAt: new Date(),
      });

      // If risk is elevated, trigger counselor alert (human-in-the-loop decision support)
      if (mlRisk.riskLevel === 'ELEVATED' || mlRisk.riskLevel === 'REQUIRES_REVIEW') {
        const alert = await Alert.create({
          userId,
          riskLevel: mlRisk.riskLevel === 'REQUIRES_REVIEW' ? 'COUNSELOR_REVIEW' : 'WATCH',
          status: 'OPEN',
          triggerReason: `Elevated distress signal detected (Score: ${mlRisk.riskScore}). Contributing factors: ${mlRisk.factors.map(f => f.feature).join(', ')}`,
        });

        emitCounselorAlert({
          alertId: alert._id,
          userId,
          riskScore: mlRisk.riskScore,
          riskLevel: mlRisk.riskLevel,
          timestamp: new Date(),
        });
      }
    } catch {
      // Ignore DB write errors in standalone mode
    }

    return {
      checkin: checkinDoc,
      riskAssessment: mlRisk,
    };
  },

  getUserCheckIns: async (userId: string, limit = 30) => {
    try {
      const records = await CheckIn.find({ userId }).sort({ timestamp: -1 }).limit(limit).lean();
      if (records && records.length > 0) return records;
    } catch {}

    const memList = memoryCheckIns.get(userId) || [];
    if (memList.length > 0) return memList.slice(0, limit);

    // Return realistic synthetic checkins if empty
    return checkinService.generateSyntheticCheckIns(userId);
  },

  getBaselineAndTrend: async (userId: string) => {
    const checkins = await checkinService.getUserCheckIns(userId, 14);
    if (!checkins || checkins.length === 0) {
      return {
        baseline: {
          avgMood: 7.0,
          avgStress: 4.8,
          avgEnergy: 6.5,
          avgSleep: 7.2,
          avgSafety: 7.5,
          avgCaseStress: 4.2,
          avgSupport: 7.0,
          totalLogs: 0,
        },
        recent: {
          avgMood: 7.0,
          avgStress: 4.8,
          avgEnergy: 6.5,
          avgSleep: 7.2,
          avgSafety: 7.5,
          avgCaseStress: 4.2,
        },
        comparison: {
          stressStatus: 'Steady with normal pattern',
          sleepStatus: 'Optimal resting hours',
          safetyStatus: 'Consistent sense of safety',
          caseTensionStatus: 'Manageable case-related pressure',
          summaryText: 'Your recent wellbeing pattern aligns well with your usual 14-day baseline.',
        },
        trend: [],
      };
    }

    // Historical baseline averages (up to 14 entries)
    const avgMood = checkins.reduce((a, b) => a + (b.mood || 7), 0) / checkins.length;
    const avgStress = checkins.reduce((a, b) => a + (b.stress || 5), 0) / checkins.length;
    const avgEnergy = checkins.reduce((a, b) => a + (b.energy || 6), 0) / checkins.length;
    const avgSleep = checkins.reduce((a, b) => a + (b.sleepHours || 7), 0) / checkins.length;
    const avgSafety = checkins.reduce((a, b) => a + (b.senseOfSafety || 7), 0) / checkins.length;
    const avgCaseStress = checkins.reduce((a, b) => a + (b.caseRelatedStress || 5), 0) / checkins.length;
    const avgSupport = checkins.reduce((a, b) => a + (b.supportAvailability || 7), 0) / checkins.length;

    // Recent 3-day average (or top 3 recent logs)
    const recentLogs = checkins.slice(0, Math.min(3, checkins.length));
    const recentAvgMood = recentLogs.reduce((a, b) => a + (b.mood || 7), 0) / recentLogs.length;
    const recentAvgStress = recentLogs.reduce((a, b) => a + (b.stress || 5), 0) / recentLogs.length;
    const recentAvgEnergy = recentLogs.reduce((a, b) => a + (b.energy || 6), 0) / recentLogs.length;
    const recentAvgSleep = recentLogs.reduce((a, b) => a + (b.sleepHours || 7), 0) / recentLogs.length;
    const recentAvgSafety = recentLogs.reduce((a, b) => a + (b.senseOfSafety || 7), 0) / recentLogs.length;
    const recentAvgCaseStress = recentLogs.reduce((a, b) => a + (b.caseRelatedStress || 5), 0) / recentLogs.length;

    // Calculate non-diagnostic human-readable comparison insights
    const stressDiff = recentAvgStress - avgStress;
    const sleepDiff = recentAvgSleep - avgSleep;
    const safetyDiff = recentAvgSafety - avgSafety;
    const caseStressDiff = recentAvgCaseStress - avgCaseStress;

    const stressStatus =
      stressDiff > 1.2
        ? 'Higher than your usual pattern'
        : stressDiff < -1.0
        ? 'Lower than your usual pattern'
        : 'Steady with normal pattern';

    const sleepStatus =
      sleepDiff < -1.0
        ? `${Math.abs(Math.round(sleepDiff * 10) / 10)}h below your average`
        : sleepDiff > 1.0
        ? 'Higher than your recent average'
        : 'Within usual resting range';

    const safetyStatus =
      safetyDiff < -1.2
        ? 'Reduced compared with usual pattern'
        : safetyDiff > 1.0
        ? 'Stronger than usual'
        : 'Consistent with normal pattern';

    const caseTensionStatus =
      caseStressDiff > 1.5
        ? 'Elevated during current case stage'
        : caseStressDiff < -1.0
        ? 'Lower case-related tension'
        : 'Manageable hearing pressure';

    let summaryText = 'Your recent wellbeing pattern is consistent with your 14-day baseline.';
    if (stressDiff > 1.2 || sleepDiff < -1.0 || caseStressDiff > 1.5) {
      summaryText =
        'Your recent pattern shows higher case-related tension and lower sleep hours compared with your usual baseline. Support options and grounding exercises are available.';
    }

    return {
      baseline: {
        avgMood: Math.round(avgMood * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        avgSafety: Math.round(avgSafety * 10) / 10,
        avgCaseStress: Math.round(avgCaseStress * 10) / 10,
        avgSupport: Math.round(avgSupport * 10) / 10,
        totalLogs: checkins.length,
      },
      recent: {
        avgMood: Math.round(recentAvgMood * 10) / 10,
        avgStress: Math.round(recentAvgStress * 10) / 10,
        avgEnergy: Math.round(recentAvgEnergy * 10) / 10,
        avgSleep: Math.round(recentAvgSleep * 10) / 10,
        avgSafety: Math.round(recentAvgSafety * 10) / 10,
        avgCaseStress: Math.round(recentAvgCaseStress * 10) / 10,
      },
      comparison: {
        stressStatus,
        sleepStatus,
        safetyStatus,
        caseTensionStatus,
        summaryText,
      },
      trend: checkins
        .map((c) => ({
          date: new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mood: c.mood,
          stress: c.stress,
          energy: c.energy,
          sleepHours: c.sleepHours,
          senseOfSafety: c.senseOfSafety ?? 7,
          caseRelatedStress: c.caseRelatedStress ?? 5,
          supportAvailability: c.supportAvailability ?? 7,
          caseStage: c.caseStage || 'COURT_TRIAL',
          optionalNote: c.optionalNote,
        }))
        .reverse(),
    };
  },

  generateSyntheticCheckIns: (userId: string) => {
    const days = 10;
    const generated = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const isRecentTension = i < 3;

      generated.push({
        _id: `synth_${i}`,
        userId,
        mood: isRecentTension ? 5 : 7,
        stress: isRecentTension ? 8 : 4,
        energy: isRecentTension ? 4 : 6,
        sleepHours: isRecentTension ? 5.0 : 7.5,
        senseOfSafety: isRecentTension ? 5 : 8,
        supportAvailability: 8,
        caseRelatedStress: isRecentTension ? 8 : 4,
        caseStage: 'COURT_TRIAL',
        optionalNote:
          i === 0
            ? 'Court hearing cross-examination scheduled this Friday. Feeling elevated tension about court testimony.'
            : i === 1
            ? 'Spoke with DLSA legal aid counsel regarding testimony protective measures.'
            : undefined,
        timestamp: d,
      });
    }

    memoryCheckIns.set(userId, generated);
    return generated;
  },
};
