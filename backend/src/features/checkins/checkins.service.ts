import { CheckIn, RiskScore, Alert } from '../../models/index.js';
import { mlClient } from '../../services/mlClient.service.js';
import { emitCounselorAlert } from '../../services/socket.service.js';
import { CreateCheckInInput } from './checkins.validation.js';

// In-memory demo checkin store fallback
const memoryCheckIns: Map<string, any[]> = new Map();

export const checkinService = {
  createCheckIn: async (userId: string, input: CreateCheckInInput) => {
    let checkinDoc: any = null;
    let recentHistory: any[] = [];

    try {
      checkinDoc = await CheckIn.create({
        userId,
        ...input,
        timestamp: new Date(),
      });

      recentHistory = await CheckIn.find({ userId }).sort({ timestamp: -1 }).limit(14).lean();
    } catch {
      // In-memory fallback
      const userList = memoryCheckIns.get(userId) || [];
      checkinDoc = {
        _id: 'checkin_' + Date.now(),
        userId,
        ...input,
        timestamp: new Date(),
      };
      userList.unshift(checkinDoc);
      memoryCheckIns.set(userId, userList);
      recentHistory = userList.slice(0, 14);
    }

    // Trigger ML risk inference
    const mlRisk = await mlClient.predictRisk(userId, recentHistory.reverse());

    try {
      await RiskScore.create({
        userId,
        riskScore: mlRisk.riskScore,
        riskLevel: mlRisk.riskLevel,
        factors: mlRisk.factors,
        calculatedAt: new Date(),
      });

      // If risk is elevated, trigger counselor alert
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
      // Ignore DB write errors in demo standalone mode
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
          totalLogs: 0,
        },
        trend: [],
      };
    }

    const avgMood = checkins.reduce((a, b) => a + (b.mood || 7), 0) / checkins.length;
    const avgStress = checkins.reduce((a, b) => a + (b.stress || 5), 0) / checkins.length;
    const avgEnergy = checkins.reduce((a, b) => a + (b.energy || 6), 0) / checkins.length;
    const avgSleep = checkins.reduce((a, b) => a + (b.sleepHours || 7), 0) / checkins.length;
    const avgSafety = checkins.reduce((a, b) => a + (b.senseOfSafety || 7), 0) / checkins.length;
    const avgCaseStress = checkins.reduce((a, b) => a + (b.caseRelatedStress || 5), 0) / checkins.length;

    return {
      baseline: {
        avgMood: Math.round(avgMood * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgSleep: Math.round(avgSleep * 10) / 10,
        avgSafety: Math.round(avgSafety * 10) / 10,
        avgCaseStress: Math.round(avgCaseStress * 10) / 10,
        totalLogs: checkins.length,
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
          caseStage: c.caseStage || 'COURT_TRIAL',
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
      generated.push({
        _id: `synth_${i}`,
        userId,
        mood: Math.max(2, Math.min(10, Math.floor(7 - (i < 4 ? 3 : 0) + Math.sin(i) * 1.2))),
        stress: Math.max(1, Math.min(10, Math.floor(4 + (i < 4 ? 4 : 0) + Math.cos(i) * 1.2))),
        energy: Math.max(2, Math.min(10, Math.floor(6 - (i < 4 ? 2 : 0) + Math.sin(i * 0.8)))),
        sleepHours: Math.max(4, Math.min(10, Math.floor(7.5 - (i < 4 ? 2.5 : 0)))),
        senseOfSafety: Math.max(2, Math.min(10, Math.floor(8 - (i < 4 ? 3 : 0)))),
        supportAvailability: 7,
        caseRelatedStress: Math.max(2, Math.min(10, Math.floor(4 + (i < 4 ? 4 : 0)))),
        caseStage: 'COURT_TRIAL',
        optionalNote: i === 0 ? 'Upcoming court hearing scheduled for cross-examination' : undefined,
        timestamp: d,
      });
    }

    memoryCheckIns.set(userId, generated);
    return generated;
  },
};
