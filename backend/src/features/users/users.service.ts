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
    if (/suicid|kill myself|end it all|die|self harm/i.test(cleaned)) {
      return {
        reply:
          "I hear that you're going through an extremely difficult moment. Please know that you are not alone and immediate human support is available. Please reach out right now:\n\n• KIRAN Mental Health Helpline: 1800-599-0019 (24/7 Toll-Free, Ministry of Social Justice & Empowerment)\n• Tele-MANAS National Helpline: 14416 / 1800-891-4416 (24/7, Free & Confidential)\n• National Emergency Helpline: Dial 112\n• NALSA Legal Aid Helpline: Dial 15100\n\nPlease connect with one of these resources or your designated support counselor Dr. Sarah Jenkins immediately.",
        isSafetyIntervention: true,
        resourcesSuggested: ['KIRAN 1800-599-0019', 'Tele-MANAS 14416', 'NALSA Legal Aid 15100'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide, not a therapist or doctor.',
      };
    }

    if (/court|hearing|trial|testimony|cross.?exam|lawyer|judge/i.test(cleaned)) {
      return {
        reply:
          "Facing court proceedings and cross-examination can evoke acute anxiety. Remember:\n\n• You have the right to request safe transit, separate waiting areas, and video-conferencing through the District Witness Protection Committee.\n• Your DLSA Legal Aid counsel can accompany you during depositions.\n• Let's do a 3-minute grounding exercise right now: inhale deeply for 4 seconds, hold for 7 seconds, and exhale for 8 seconds.\n\nWould you like guidance on scheduling an accompaniment review with Dr. Sarah Jenkins?",
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Technique', 'DLSA Witness Support Protocol', 'Special Court Accommodations'],
        disclaimer: 'MindPulse Support Companion is a non-clinical companion.',
      };
    }

    if (/breath|anxi|panic|calm|ground/i.test(cleaned)) {
      return {
        reply:
          "Let's do a quick somatic grounding exercise together.\n\nTry the **4-7-8 Somatic Calming Technique**:\n1. Inhale deeply through your nose for 4 seconds.\n2. Hold your breath gently for 7 seconds.\n3. Exhale slowly and fully through your mouth for 8 seconds.\n\nRepeat this cycle 3 times. Would you like to try the 5-4-3-2-1 sensory grounding exercise or explore NALSA legal aid contacts?",
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', '5-4-3-2-1 Grounding Guide'],
        disclaimer: 'MindPulse Support Companion is a non-clinical companion.',
      };
    }

    if (/compensation|relief|money|scheme|357a/i.test(cleaned)) {
      return {
        reply:
          "Under Section 357A CrPC and the Central Victim Compensation Fund, victims and complainants are eligible for:\n\n• First-stage interim relief within 14-30 days of FIR registration\n• Medical and immediate rehabilitation reimbursement grants\n• Final compensation upon judicial recommendation\n\nYour assigned counselor or DLSA legal aid advocate can help submit the standard Form I application.",
        isSafetyIntervention: false,
        resourcesSuggested: ['Victim Compensation Scheme Guide', 'DLSA Legal Aid Helpdesk'],
        disclaimer: 'MindPulse Support Companion is a non-clinical companion.',
      };
    }

    if (/sleep|tired|insomnia|rest|nightmare/i.test(cleaned)) {
      return {
        reply:
          "Nighttime hypervigilance and sleep disruption are very common during active case stages. A few supportive non-clinical habits:\n\n• Practice a 10-minute Non-Sleep Deep Rest (NSDR) or progressive muscle relaxation before bed.\n• Dim bright lights 45 minutes before sleep.\n• Write down lingering thoughts in your private MindPulse reflection journal to clear bedtime worry.\n\nWould you like a calming reflection prompt for tonight?",
        isSafetyIntervention: false,
        resourcesSuggested: ['NSDR Relaxation Guide', 'Private Reflection Journal'],
        disclaimer: 'MindPulse Support Companion is a non-clinical companion.',
      };
    }

    return {
      reply:
        "Thank you for reaching out. I am your MindPulse Trauma-Informed Support Companion. I can help guide you through somatic grounding exercises, explain the 6 stages of your case journey, or connect you with DLSA legal aid and victim compensation contacts. How are you feeling right now?",
      isSafetyIntervention: false,
      resourcesSuggested: ['Wellbeing Check-in', 'DLSA Legal Aid Directory', 'Grounding Exercises'],
      disclaimer: 'MindPulse Support Companion is a non-clinical companion.',
    };
  },
};
