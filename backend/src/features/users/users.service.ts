import { User } from '../../models/index.js';

export const userService = {
  getProfile: async (userId: string) => {
    try {
      const user = await User.findById(userId).select('-passwordHash').lean();
      if (user) return user;
    } catch {}

    return {
      _id: userId,
      email: 'student@mindpulse.local',
      fullName: 'Alex Student',
      role: 'USER',
      department: 'Computer Science',
      yearOfStudy: 3,
    };
  },

  supportAssistantChat: async (userId: string, message: string) => {
    const cleaned = message.toLowerCase();
    
    // Safety check for severe distress / crisis keywords
    if (/suicid|kill myself|end it all|die|self harm/i.test(cleaned)) {
      return {
        reply: "I hear that you're going through an extremely difficult moment. Please know that you are not alone and immediate human support is available. Please reach out right now:\n\n• National Crisis Lifeline: Dial 988 (Available 24/7, free & confidential)\n• Crisis Text Line: Text HOME to 741741\n• Campus Health Crisis Team: (800) 273-8255\n\nPlease connect with one of these resources or a trusted person immediately.",
        isSafetyIntervention: true,
        resourcesSuggested: ['988 Crisis Lifeline', 'Campus Crisis Center'],
        disclaimer: 'MindPulse Support Assistant is a non-clinical conversational guide, not a therapist or doctor.',
      };
    }

    if (/breath|anxi|panic|calm/i.test(cleaned)) {
      return {
        reply: "Let's do a quick grounding exercise together.\n\nTry the **4-7-8 Breathing Technique**:\n1. Inhale deeply through your nose for 4 seconds.\n2. Hold your breath gently for 7 seconds.\n3. Exhale slowly through your mouth for 8 seconds.\n\nRepeat this cycle 3 times. Would you like to try a sensory grounding exercise or explore calming campus resources?",
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide'],
        disclaimer: 'MindPulse Support Assistant is a non-clinical companion.',
      };
    }

    if (/sleep|tired|insomnia|rest/i.test(cleaned)) {
      return {
        reply: "Sleep disruption heavily influences our emotional resilience. A couple of helpful non-clinical habits:\n\n• Dim overhead lights 45 minutes before sleep.\n• Try a 10-minute Non-Sleep Deep Rest (NSDR) or progressive body scan.\n• Keep your study desk separate from your sleep area if possible.\n\nWould you like a journaling prompt to help clear nighttime thoughts?",
        isSafetyIntervention: false,
        resourcesSuggested: ['NSDR Relaxation Guide'],
        disclaimer: 'MindPulse Support Assistant is a non-clinical companion.',
      };
    }

    return {
      reply: "Thank you for sharing. I'm here as your MindPulse Support Assistant to provide gentle wellness prompts, grounding exercises, and help you navigate campus support options. How are you feeling right now?",
      isSafetyIntervention: false,
      resourcesSuggested: ['Daily Wellness Check-in', 'Campus Support Directory'],
      disclaimer: 'MindPulse Support Assistant is a non-clinical companion.',
    };
  },
};
