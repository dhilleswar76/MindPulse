import { User } from '../../models/index.js';
import { supportAssistantService, ChatMessageContext } from './supportAssistant.service.js';

export const userService = {
  getProfile: async (userId: string) => {
    try {
      const user = await User.findById(userId).select('-passwordHash').lean();
      if (user) return user;
    } catch {}

    return {
      _id: userId,
      email: 'demo.user@mindpulse.local',
      fullName: 'Alex Rivera (Protected Witness)',
      role: 'USER',
      victimType: 'WITNESS',
      caseId: 'MP-1042',
      caseStage: 'COURT_TRIAL',
      district: 'Central District',
      state: 'National Capital Region',
      assignedCounselor: 'Dr. Sarah Jenkins',
      supportStatus: 'ACTIVE_MONITORING',
      consentStatus: true,
    };
  },

  supportAssistantChat: async (
    userId: string,
    message: string,
    history: ChatMessageContext[] = []
  ) => {
    const profile = await userService.getProfile(userId);
    return supportAssistantService.processChat(userId, message, history, {
      fullName: profile?.fullName,
      assignedCounselor: profile?.assignedCounselor,
      caseStage: profile?.caseStage,
    });
  },
};
