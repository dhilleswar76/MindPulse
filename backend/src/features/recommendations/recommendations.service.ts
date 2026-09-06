import { Recommendation } from '../../models/index.js';
import { riskService } from '../risk/risk.service.js';

const defaultRecommendations = [
  {
    _id: 'rec_1',
    title: '4-7-8 Deep Breathing Exercise',
    category: 'BREATHING',
    description: 'Inhale for 4 seconds, hold for 7, and exhale slowly for 8. Helps downregulate sympathetic nervous system arousal during acute stress.',
    durationMinutes: 5,
    targetRiskLevels: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_2',
    title: 'Non-Sleep Deep Rest (NSDR) Protocol',
    category: 'SLEEP',
    description: 'A 10-minute guided relaxation session designed to restore cognitive clarity and recover from sleep deficits.',
    durationMinutes: 10,
    targetRiskLevels: ['WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_3',
    title: '5-4-3-2-1 Sensory Grounding Technique',
    category: 'MINDFULNESS',
    description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste to anchor yourself.',
    durationMinutes: 3,
    targetRiskLevels: ['ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_4',
    title: 'Campus Peer Wellness Drop-in Hours',
    category: 'CAMPUS_RESOURCE',
    description: 'Connect with trained student peer advocates at the Student Center, Mon-Fri 2-5 PM for open, supportive conversations.',
    durationMinutes: 30,
    targetRiskLevels: ['WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_5',
    title: 'University Counseling & Crisis Resource Line',
    category: 'CRISIS_CONTACT',
    description: '24/7 Confidential crisis counseling support line. Dial 988 or call Campus Health at (800) 273-8255.',
    durationMinutes: 0,
    targetRiskLevels: ['REQUIRES_REVIEW'],
    isNonClinical: false,
  },
];

export const recommendationService = {
  getPersonalized: async (userId: string) => {
    const currentRisk = await riskService.getCurrentRisk(userId);
    const level = currentRisk.riskLevel || 'STABLE';

    try {
      const dbRecs = await Recommendation.find({ targetRiskLevels: level }).lean();
      if (dbRecs && dbRecs.length > 0) return dbRecs;
    } catch {}

    // Filter defaults matching risk level
    return defaultRecommendations.filter((r) => r.targetRiskLevels.includes(level));
  },
};
