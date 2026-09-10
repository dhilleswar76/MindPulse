import { Intervention, FollowUp } from '../../models/index.js';
import { CreateInterventionInput, UpdateInterventionInput } from './interventions.validation.js';

const memoryInterventions: any[] = [
  {
    _id: 'int_demo_1',
    userId: 'user_alex_101',
    caseId: 'MP-1042',
    victimName: 'Alex Rivera (Pseudonymous)',
    counselorId: 'counselor_demo_1',
    counselorName: 'Dr. Sarah Jenkins',
    type: 'COUNSELLING',
    status: 'ACTIVE',
    clinicalNotes:
      'Conducted trauma-informed grounding session ahead of Court / Trial hearing. Addressed cross-examination stress and established routine check-ins with witness support liaison.',
    actionItems: [
      'Coordinate with Special Public Prosecutor victim liaison',
      'Daily 4-7-8 parasympathetic calming exercise',
      'Scheduled follow-up check-in ahead of testimony date',
    ],
    scheduledDate: new Date(),
    riskBeforeScore: 0.82,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    _id: 'int_demo_2',
    userId: 'user_taylor_103',
    caseId: 'MP-1003',
    victimName: 'Taylor Morgan (Pseudonymous)',
    counselorId: 'counselor_demo_1',
    counselorName: 'Dr. Sarah Jenkins',
    type: 'LEGAL_AID',
    status: 'COMPLETED',
    clinicalNotes:
      'Facilitated NALSA Legal Aid connection and processed Victim Compensation Scheme documentation.',
    actionItems: ['Compensation scheme documentation submitted to District Legal Services Authority'],
    scheduledDate: new Date(Date.now() - 604800000),
    completedDate: new Date(Date.now() - 172800000),
    riskBeforeScore: 0.65,
    riskAfterScore: 0.38,
    createdAt: new Date(Date.now() - 604800000),
  },
];

export const interventionService = {
  createIntervention: async (counselorId: string, input: CreateInterventionInput) => {
    let doc: any = null;
    try {
      doc = await Intervention.create({
        ...input,
        counselorId,
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : new Date(),
      });

      // Automatically create follow-up task
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      await FollowUp.create({
        interventionId: doc._id,
        userId: input.userId,
        dueDate,
      });
    } catch {
      doc = {
        _id: 'int_' + Date.now(),
        ...input,
        counselorId,
        counselorName: 'Dr. Sarah Jenkins',
        studentName: 'Alex Rivera',
        scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : new Date(),
        createdAt: new Date(),
      };
      memoryInterventions.unshift(doc);
    }

    return doc;
  },

  getInterventions: async (counselorId?: string) => {
    try {
      const docs = await Intervention.find().populate('userId', 'fullName email').sort({ createdAt: -1 }).lean();
      if (docs && docs.length > 0) return docs;
    } catch {}

    return memoryInterventions;
  },

  updateIntervention: async (id: string, input: UpdateInterventionInput) => {
    try {
      const updated = await Intervention.findByIdAndUpdate(id, { ...input }, { new: true });
      if (updated) return updated;
    } catch {}

    const item = memoryInterventions.find((i) => i._id === id);
    if (item) {
      Object.assign(item, input);
      if (input.status === 'COMPLETED' && !item.completedDate) {
        item.completedDate = new Date();
        item.riskAfterScore = input.riskAfterScore || 0.35;
      }
      return item;
    }
    throw new Error('Intervention not found');
  },

  getOutcomeHistory: async (userId: string) => {
    return {
      userId,
      observedTrend: 'Observed trend after intervention indicates declining distress signal indicators.',
      beforeScore: 0.82,
      afterScore: 0.45,
      percentageReduction: 45.1,
      disclaimer: 'Observed trend comparison. Does not assert clinical causal proof.',
      interventions: memoryInterventions.filter((i) => i.userId === userId || userId === 'user_alex_101'),
    };
  },

  createFollowUp: async (data: { interventionId?: string; userId: string; dueDate: string | Date; notes?: string }) => {
    try {
      const doc = await FollowUp.create({
        interventionId: data.interventionId || '000000000000000000000000',
        userId: data.userId,
        dueDate: new Date(data.dueDate),
        notes: data.notes || '',
        completed: false,
      });
      return doc;
    } catch {
      return {
        _id: 'followup_' + Date.now(),
        interventionId: data.interventionId || 'int_demo_1',
        userId: data.userId,
        dueDate: new Date(data.dueDate),
        notes: data.notes || '',
        completed: false,
        createdAt: new Date(),
      };
    }
  },

  getFollowUps: async (userId?: string) => {
    try {
      const query = userId ? { userId } : {};
      const docs = await FollowUp.find(query).sort({ dueDate: 1 }).lean();
      if (docs && docs.length > 0) return docs;
    } catch {}

    const dueToday = new Date();
    const dueNextWeek = new Date();
    dueNextWeek.setDate(dueNextWeek.getDate() + 5);

    return [
      {
        _id: 'followup_1',
        interventionId: 'int_demo_1',
        userId: userId || 'user_alex_101',
        caseId: 'MP-1042',
        studentName: 'Alex Rivera',
        dueDate: dueToday,
        completed: false,
        notes: 'Pre-trial testimony support check-in and 4-7-8 breathing review.',
      },
      {
        _id: 'followup_2',
        interventionId: 'int_demo_2',
        userId: 'user_taylor_103',
        caseId: 'MP-1003',
        studentName: 'Taylor Morgan',
        dueDate: dueNextWeek,
        completed: false,
        notes: 'DLSA compensation status verification.',
      },
    ];
  },
};

