import { User, RiskScore, CheckIn, Intervention } from '../../models/index.js';

const mockCases = [
  {
    id: 'case_101',
    userId: 'user_alex_101',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.r@campus.edu',
    department: 'Computer Science',
    yearOfStudy: 3,
    riskLevel: 'REQUIRES_REVIEW',
    riskScore: 0.82,
    riskTrend: 'escalating',
    daysInDistress: 4,
    recentCheckIn: {
      mood: 3,
      stress: 9,
      energy: 3,
      sleepHours: 4.0,
      timestamp: new Date(Date.now() - 3600000),
    },
    topSignals: [
      { feature: 'Sleep Deficit', impact: 0.32, description: '4.0 hours average sleep over past 4 days' },
      { feature: 'Elevated Stress', impact: 0.28, description: 'Consistently reporting 9/10 stress level' },
      { feature: 'Mood Drop', impact: 0.18, description: 'Mood decreased by 4.2 points from baseline' },
    ],
    aiSummary: 'Recent telemetry indicates significant academic pressure with acute sleep deprivation and elevated stress persistence. Marked for prioritized counselor review.',
    interventionsCount: 1,
  },
  {
    id: 'case_102',
    userId: 'user_jordan_102',
    studentName: 'Jordan Chen',
    studentEmail: 'jordan.c@campus.edu',
    department: 'Biomedical Engineering',
    yearOfStudy: 2,
    riskLevel: 'ELEVATED',
    riskScore: 0.68,
    riskTrend: 'escalating',
    daysInDistress: 2,
    recentCheckIn: {
      mood: 4,
      stress: 8,
      energy: 4,
      sleepHours: 5.5,
      timestamp: new Date(Date.now() - 7200000),
    },
    topSignals: [
      { feature: 'Elevated Stress', impact: 0.26, description: 'Reported stress score 8/10' },
      { feature: 'Energy Depletion', impact: 0.20, description: 'Energy dropped below 4.0' },
    ],
    aiSummary: 'Student shows rising stress indicators alongside emerging sleep disruption. Recommend proactive wellness check-in.',
    interventionsCount: 0,
  },
  {
    id: 'case_103',
    userId: 'user_taylor_103',
    studentName: 'Taylor Morgan',
    studentEmail: 'taylor.m@campus.edu',
    department: 'Psychology',
    yearOfStudy: 4,
    riskLevel: 'WATCH',
    riskScore: 0.44,
    riskTrend: 'stable',
    daysInDistress: 1,
    recentCheckIn: {
      mood: 6,
      stress: 6,
      energy: 6,
      sleepHours: 6.5,
      timestamp: new Date(Date.now() - 86400000),
    },
    topSignals: [
      { feature: 'Mild Sleep Fluctuation', impact: 0.14, description: 'Sleep slightly below 7h target' },
    ],
    aiSummary: 'Mild baseline deviation. Metrics remain within acceptable monitoring boundary.',
    interventionsCount: 2,
  },
];

export const counselorService = {
  getCases: async () => {
    return mockCases;
  },

  getCaseById: async (caseId: string) => {
    const c = mockCases.find((item) => item.id === caseId || item.userId === caseId);
    return c || mockCases[0];
  },

  generateAiSummary: async (userId: string) => {
    return {
      userId,
      summary: 'The student recent check-ins show increased stress, reduced sleep, and a downward mood trend compared with their historical baseline.',
      possibleSignals: [
        'Reduced sleep duration (-2.5h delta)',
        'Elevated subjective stress (8.5/10 average)',
        'Decreased energy levels',
      ],
      disclaimer: 'AI-assisted summary — requires human review. Non-diagnostic decision support only.',
      generatedAt: new Date(),
    };
  },
};
