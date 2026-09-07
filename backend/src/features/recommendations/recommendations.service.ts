import { Recommendation } from '../../models/index.js';
import { riskService } from '../risk/risk.service.js';

const defaultRecommendations = [
  {
    _id: 'rec_1',
    title: '4-7-8 Deep Breathing Exercise',
    category: 'BREATHING',
    description: 'Inhale for 4 seconds, hold for 7, and exhale slowly for 8. Helps downregulate sympathetic nervous system arousal during acute legal or investigative stress.',
    durationMinutes: 5,
    targetRiskLevels: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_2',
    title: '5-4-3-2-1 Sensory Grounding for Hearing Anxiety',
    category: 'MINDFULNESS',
    description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, and 1 you taste to re-center attention prior to court or interview sessions.',
    durationMinutes: 4,
    targetRiskLevels: ['WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_3',
    title: 'National Legal Services Authority (NALSA) Legal Aid Info',
    category: 'LEGAL_AID',
    description: 'Free, confidential legal representation and accompaniment for victims and witnesses under the SC/ST Prevention of Atrocities Act and state legal services authorities.',
    durationMinutes: 15,
    targetRiskLevels: ['WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_4',
    title: 'Victim Compensation Scheme & Interim Relief Guide',
    category: 'VICTIM_COMPENSATION',
    description: 'Step-by-step guidance on statutory relief, rehabilitation grants, and emergency medical/housing entitlements provided under Ministry guidelines.',
    durationMinutes: 20,
    targetRiskLevels: ['STABLE', 'WATCH', 'ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_5',
    title: 'Witness Protection Support & Safe Accommodations',
    category: 'WITNESS_PROTECTION',
    description: 'Protocol guidelines for requesting secure transport, pseudonymous court testimony, and relocation support through District Witness Protection committees.',
    durationMinutes: 15,
    targetRiskLevels: ['ELEVATED', 'REQUIRES_REVIEW'],
    isNonClinical: true,
  },
  {
    _id: 'rec_6',
    title: 'Designated Atrocity Support & Crisis Helpline',
    category: 'CRISIS_CONTACT',
    description: '24/7 dedicated support line for victims of atrocities and witnesses requiring immediate protection or psychosocial crisis coordination. Call toll-free 14566 / 1800-180-1551.',
    durationMinutes: 0,
    targetRiskLevels: ['ELEVATED', 'REQUIRES_REVIEW'],
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
