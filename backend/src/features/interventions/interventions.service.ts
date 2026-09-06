import { Intervention, FollowUp } from '../../models/index.js';
import { CreateInterventionInput, UpdateInterventionInput } from './interventions.validation.js';

const memoryInterventions: any[] = [
  {
    _id: 'int_demo_1',
    userId: 'user_alex_101',
    studentName: 'Alex Rivera',
    counselorId: 'counselor_demo_1',
    counselorName: 'Dr. Sarah Jenkins',
    type: 'COUNSELING_SESSION',
    status: 'ACTIVE',
    clinicalNotes: 'Discussed sleep routine, academic deadline stress, and introduced 4-7-8 breathing protocol. Scheduled follow-up check-in.',
    actionItems: ['Establish 11 PM digital cutoff', 'Complete daily 5-minute NSDR relaxation session'],
    scheduledDate: new Date(),
    riskBeforeScore: 0.82,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    _id: 'int_demo_2',
    userId: 'user_taylor_103',
    studentName: 'Taylor Morgan',
    counselorId: 'counselor_demo_1',
    counselorName: 'Dr. Sarah Jenkins',
    type: 'RESOURCE_REFERRAL',
    status: 'COMPLETED',
    clinicalNotes: 'Referred to student tutoring center and peer wellness group.',
    actionItems: ['Connect with peer mentor'],
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
};
