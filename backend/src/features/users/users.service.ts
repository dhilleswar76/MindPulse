import { User } from '../../models/index.js';

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

  supportAssistantChat: async (userId: string, message: string) => {
    const cleaned = message.toLowerCase();

    // Safety check for severe distress / crisis keywords
    if (/suicid|kill myself|end it all|die|self harm|hurt myself/i.test(cleaned)) {
      return {
        reply:
          "I hear that you are going through an extremely heavy moment right now. Please know that you are not alone and compassionate human support is available immediately:\n\n• **KIRAN Mental Health Helpline**: 1800-599-0019 (24/7 Toll-Free, MoSJE)\n• **Tele-MANAS Helpline**: 14416 / 1800-891-4416 (24/7 National Mental Health Line)\n• **National Emergency Helpline**: Dial 112\n• **NALSA Legal Aid Helpline**: Dial 15100\n\nPlease reach out to one of these free services or contact your assigned support counselor Dr. Sarah Jenkins immediately.",
        isSafetyIntervention: true,
        resourcesSuggested: ['KIRAN: 1800-599-0019', 'Tele-MANAS: 14416', 'NALSA Legal Aid: 15100'],
        disclaimer: 'MindPulse Support Companion provides non-clinical support and is not a substitute for crisis intervention.',
      };
    }

    if (/calm|stress|anxi|panic|overwhelm|struggl|difficult day/i.test(cleaned)) {
      return {
        reply:
          "I hear you. When feeling stressed or overwhelmed, it helps to slow down and ground your body first:\n\n1. **Take 3 Somatic Breaths**: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds.\n2. **Unclench your jaw & drop your shoulders**: Notice any physical tightness you might be holding right now.\n3. **Focus on what you can control**: What is one tiny, manageable thing you can do for yourself in the next 10 minutes?\n\nWould you like to run a guided 4-7-8 breathing cycle or explore a gentle reflection prompt?",
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Somatic Breathing', '5-4-3-2-1 Sensory Grounding', 'Private Reflection Journal'],
        disclaimer: 'Non-clinical support companion.',
      };
    }

    if (/focus|organize|thoughts|mind|confused|head/i.test(cleaned)) {
      return {
        reply:
          "Organizing your thoughts when your mind feels cluttered is a gentle step forward:\n\n• **Brain-Dump**: Write down everything on your mind in your private MindPulse reflection journal without trying to edit or fix it.\n• **Identify the Core Priority**: Pick just one item that feels most urgent, and set everything else aside for now.\n• **Take Break Intervals**: Give yourself 15 minutes of quiet before making key decisions.\n\nWould you like a targeted reflection prompt to help structure your entry?",
        isSafetyIntervention: false,
        resourcesSuggested: ['Private Journal Entry', 'Reflection Prompts'],
        disclaimer: 'Non-clinical support companion.',
      };
    }

    if (/court|hearing|trial|testimony|cross.?exam|lawyer|judge/i.test(cleaned)) {
      return {
        reply:
          "Preparing for court hearings or legal testimony can evoke significant stress. Key non-clinical support steps:\n\n• **Protected Escort & Accommodations**: Under the Witness Protection Scheme, you have the right to request separate waiting rooms, video-conferencing, and legal aid escort.\n• **Pre-Hearing Grounding**: Practice a 5-minute somatic breathing routine prior to entering court.\n• **Legal Aid Consultation**: Reach out to your DLSA legal advocate to review deposition procedures ahead of time.\n\nWould you like to schedule an accompaniment review with Dr. Sarah Jenkins?",
        isSafetyIntervention: false,
        resourcesSuggested: ['DLSA Legal Aid Helpdesk', 'Witness Protection Scheme', '4-7-8 Somatic Breathing'],
        disclaimer: 'Non-clinical support companion.',
      };
    }

    if (/compensation|relief|money|scheme|357a/i.test(cleaned)) {
      return {
        reply:
          "Under Section 357A CrPC and the Central Victim Compensation Scheme:\n\n• **Interim Relief**: Financial grants can be awarded within 14–30 days for urgent medical/rehabilitation needs.\n• **Final Compensation**: Quantified upon judicial assessment by District Legal Services Authority (DLSA).\n• **Application Assistance**: Your counselor or DLSA legal aid advocate can assist with filing Form I.\n\nWould you like guidance on connecting with the DLSA helpdesk?",
        isSafetyIntervention: false,
        resourcesSuggested: ['Victim Compensation Scheme Guide', 'DLSA Directory'],
        disclaimer: 'Non-clinical support companion.',
      };
    }

    return {
      reply:
        "Thank you for sharing. I'm here to listen and help you navigate through what you're experiencing.\n\nHere are a few ways we can work together right now:\n• **Somatic Grounding**: Interactive 4-7-8 breathing and sensory exercises\n• **Organizing Thoughts**: Private reflection journaling prompts\n• **Legal Journey Support**: Information on DLSA legal aid and victim rights\n\nWhat would feel most helpful for you in this moment?",
      isSafetyIntervention: false,
      resourcesSuggested: ['Somatic Grounding', 'Private Reflection Journal', 'DLSA Legal Aid Directory'],
      disclaimer: 'Non-clinical support companion.',
    };
  },
};
