/**
 * MindPulse Trauma-Informed Support Assistant Engine
 * 
 * ChatGPT-style natural conversational capability, semantic intent understanding,
 * multi-turn conversation context tracking, verified statutory resources, and non-clinical safety.
 */

export interface ChatMessageContext {
  sender: 'user' | 'assistant';
  text: string;
}

export interface SupportChatResponse {
  reply: string;
  intent: string;
  isSafetyIntervention: boolean;
  resourcesSuggested: string[];
  disclaimer: string;
  followUpSuggestions?: string[];
}

export type SupportIntent =
  | 'CRISIS_URGENT'
  | 'BREATHING_EXERCISE'
  | 'GROUNDING_EXERCISE'
  | 'COURT_ANXIETY'
  | 'VICTIM_COMPENSATION'
  | 'LEGAL_ASSISTANCE'
  | 'SLEEP_REST'
  | 'COUNSELOR_SUPPORT'
  | 'SAFE_TRANSIT'
  | 'GREETING_CASUAL'
  | 'GREETING_HELLO'
  | 'GREETING_HEY'
  | 'GREETING_TIMED'
  | 'SMALLTALK_HOW_ARE_YOU'
  | 'GRATITUDE'
  | 'FAREWELL'
  | 'CAPABILITIES'
  | 'EMOTIONAL_DISCLOSURE'
  | 'CALM_REQUEST'
  | 'AFFIRMATION_FOLLOWUP'
  | 'GENERAL_INFO';

export const supportAssistantService = {
  /**
   * Main entry point to process a user chat message with conversation history.
   */
  processChat: async (
    userId: string,
    message: string,
    history: ChatMessageContext[] = [],
    userProfile?: { fullName?: string; assignedCounselor?: string; caseStage?: string }
  ): Promise<SupportChatResponse> => {
    const raw = (message || '').trim();
    if (!raw) {
      return {
        reply: "I'm here to listen and help. What would you like to talk about?",
        intent: 'GREETING_CASUAL',
        isSafetyIntervention: false,
        resourcesSuggested: ['Grounding Exercises', '4-7-8 Breathing'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
      };
    }

    // Use "your assigned counselor" unless verified user-specific counselor information is present
    const counselorName: string =
      userProfile?.assignedCounselor &&
      userProfile.assignedCounselor !== 'Dr. Sarah Jenkins' &&
      !userProfile.assignedCounselor.includes('Jenkins')
        ? (userProfile.assignedCounselor as string)
        : 'your assigned counselor';

    // 1. Analyze multi-turn conversation context
    const recentHistory = history.slice(-6);
    const lastUserTurn = [...recentHistory].reverse().find((h) => h.sender === 'user')?.text || '';
    const lastAssistantTurn = [...recentHistory].reverse().find((h) => h.sender === 'assistant')?.text || '';

    // Context flags from history
    const hadCourtContext = recentHistory.some((h) => /court|hearing|trial|deposition|tomorrow/i.test(h.text));
    const hadNervousContext = recentHistory.some((h) => /nervous|anxious|scared|panic|overwhelm/i.test(h.text));
    const assistantOfferedCalm = /exercise|breathing|grounding|calm down|settle/i.test(lastAssistantTurn);

    // 2. Identify primary intent with conversational normalization
    const intent = classifyIntent(raw, {
      hadCourtContext,
      hadNervousContext,
      assistantOfferedCalm,
      lastUserTurn,
      lastAssistantTurn,
    });

    // 3. Generate dynamic contextual response
    return generateResponse(intent, raw, {
      counselorName,
      hadCourtContext,
      hadNervousContext,
      assistantOfferedCalm,
      userProfile,
      recentHistory,
    });
  },
};

/**
 * Robust, natural-language intent classifier that handles colloquial variations,
 * greetings, emotional nuances, and contextual continuity.
 */
function classifyIntent(
  raw: string,
  ctx: {
    hadCourtContext: boolean;
    hadNervousContext: boolean;
    assistantOfferedCalm: boolean;
    lastUserTurn: string;
    lastAssistantTurn: string;
  }
): SupportIntent {
  const text = raw.toLowerCase().trim();

  // Normalize repeated punctuation and letters (e.g. "hiiiii" -> "hii", "heyyy" -> "heyy")
  const normalized = text.replace(/([a-z])\1{2,}/g, '$1$1').replace(/[!?.]+$/, '');

  // 1. Crisis & Urgent Safety (Immediate Top Priority)
  if (
    /\b(suicid|kill myself|end my life|end it all|want to die|self harm|hurt myself|cut myself)\b/i.test(text) ||
    (/\b(urgent help|emergency|in danger|unsafe right now|threatened to kill)\b/i.test(text))
  ) {
    return 'CRISIS_URGENT';
  }

  // 2. Exact or colloquial conversational greetings & small talk
  // "how are you", "how are you doing", "how r u", "how's it going"
  if (/^how (are|r) (you|u)( doing)?\??$/i.test(normalized) || /^how's it going\??$/i.test(normalized)) {
    return 'SMALLTALK_HOW_ARE_YOU';
  }

  // "thank you", "thanks", "thx", "thank u"
  if (/^(thank you|thanks|thx|thank u|many thanks|appreciate it)\b/i.test(normalized)) {
    return 'GRATITUDE';
  }

  // "bye", "goodbye", "see you", "cya", "good night", "take care"
  if (/^(bye|goodbye|cya|see you( later)?|good night|talk to you later)\b/i.test(normalized)) {
    return 'FAREWELL';
  }

  // Timed greetings: "good morning", "good afternoon", "good evening"
  if (/^good (morning|afternoon|evening)\b/i.test(normalized)) {
    return 'GREETING_TIMED';
  }

  // Specific casual greetings:
  // "hii", "hi", "hi there", "hiiii"
  if (/^(hi|hii|hi there|hi assistant|hi companion)$/i.test(normalized)) {
    return 'GREETING_CASUAL';
  }

  // "hello", "hello there", "hello assistant"
  if (/^(hello|hello there|hello assistant|hello companion)$/i.test(normalized)) {
    return 'GREETING_HELLO';
  }

  // "hey", "heyy", "hey there", "what's up", "sup"
  if (/^(hey|heyy|hey there|whats up|what's up|sup)$/i.test(normalized)) {
    return 'GREETING_HEY';
  }

  // Capabilities: "what can you do?", "what can you help me with?", "who are you?"
  if (
    /\b(what can you (do|help)|how can you help|what are your (features|capabilities)|help me with what|who are you|what do you do)\b/i.test(
      text
    )
  ) {
    return 'CAPABILITIES';
  }

  // 3. Affirmations / Short context-driven follow-ups
  // If user says "yes", "sure", "breathing", "yes breathing", "let's do breathing"
  if (
    /\b(yes breathing|breathing|breathe|4-7-8)\b/i.test(text) ||
    (/^yes\b/i.test(text) && /breathing/i.test(ctx.lastAssistantTurn))
  ) {
    return 'BREATHING_EXERCISE';
  }

  if (
    /\b(grounding|sensory|5-4-3-2-1)\b/i.test(text) &&
    !/breathing/i.test(text)
  ) {
    return 'GROUNDING_EXERCISE';
  }

  if (
    /^yes\b|^sure\b|^okay\b|^ok\b|^please\b/i.test(text) &&
    ctx.assistantOfferedCalm
  ) {
    return 'AFFIRMATION_FOLLOWUP';
  }

  // 4. Specific Action Requests
  // 4-7-8 Breathing explicitly requested
  if (
    /\b(4-7-8|guide me through (a )?breathing|give me (a )?breathing|breathing exercise|breathwork|how to breathe)\b/i.test(
      text
    )
  ) {
    return 'BREATHING_EXERCISE';
  }

  // Grounding explicitly requested
  if (
    /\b(give me (a )?grounding|guide me through (a )?grounding|5-4-3-2-1|sensory grounding|ground me|sensory reset)\b/i.test(
      text
    )
  ) {
    return 'GROUNDING_EXERCISE';
  }

  // Victim Compensation explicitly requested
  if (
    /\b(victim compensation|what is victim compensation|357a|sec 357a|compensation scheme|financial relief|form i|interim compensation)\b/i.test(
      text
    )
  ) {
    return 'VICTIM_COMPENSATION';
  }

  // Free Legal Assistance explicitly requested
  if (
    /\b(free legal|legal assistance|legal aid|how can i get (free )?legal|nalsa|dlsa|panel advocate|15100|legal defense)\b/i.test(
      text
    )
  ) {
    return 'LEGAL_ASSISTANCE';
  }

  // Sleep / Insomnia explicitly requested
  if (
    /\b(can't sleep|cannot sleep|insomnia|trouble sleeping|nightmare|bedtime rest|nsdr|unable to sleep)\b/i.test(
      text
    )
  ) {
    return 'SLEEP_REST';
  }

  // Counselor connection explicitly requested
  if (
    /\b(talk to (my )?counselor|speak with (a )?counselor|reach (my )?counselor|connect with (my )?counselor|human counselor|therapist appointment)\b/i.test(
      text
    )
  ) {
    return 'COUNSELOR_SUPPORT';
  }

  // Safe Transit / Witness Protection
  if (
    /\b(safe transit|witness safe travel|witness protection|police escort|travel to court|intimidat)\b/i.test(
      text
    )
  ) {
    return 'SAFE_TRANSIT';
  }

  // 5. Emotional & Contextual Requests
  // Calm request: "can you help me calm down?", "how do I calm down?", "help me relax"
  if (/\b(calm down|help me calm|help me relax|relax me|steady myself)\b/i.test(text)) {
    return 'CALM_REQUEST';
  }

  // Court Hearing Anxiety: "nervous about court", "hearing tomorrow", "scared about hearing", "court tomorrow"
  if (
    (/\b(court|hearing|trial|deposition|testify)\b/i.test(text) &&
      /\b(nervous|anxious|scared|panic|worried|dread|fear|shaking|stress|tomorrow)\b/i.test(text)) ||
    (/\bcourt tomorrow\b/i.test(text))
  ) {
    return 'COURT_ANXIETY';
  }

  // Emotional disclosure: "actually I'm feeling nervous", "I'm feeling nervous", "I feel overwhelmed", "I don't know what to do"
  if (
    /\b(feeling nervous|feel nervous|im nervous|i'm nervous|feeling anxious|feel anxious|overwhelmed|stressed out|scared|worried)\b/i.test(
      text
    ) ||
    /\b(i don't know what to do|i dont know what to do|feeling lost)\b/i.test(text)
  ) {
    return 'EMOTIONAL_DISCLOSURE';
  }

  // Context fallback: if user says "because I have court tomorrow" or "have court"
  if (/\bcourt\b|\bhearing\b/i.test(text) && ctx.hadNervousContext) {
    return 'COURT_ANXIETY';
  }

  return 'GENERAL_INFO';
}

/**
 * Generates natural, ChatGPT-style responses based on the analyzed intent and conversation state.
 */
function generateResponse(
  intent: SupportIntent,
  raw: string,
  context: {
    counselorName: string;
    hadCourtContext: boolean;
    hadNervousContext: boolean;
    assistantOfferedCalm: boolean;
    userProfile?: any;
    recentHistory: ChatMessageContext[];
  }
): SupportChatResponse {
  const { counselorName, hadCourtContext } = context;
  const counselorCapitalized = counselorName.charAt(0).toUpperCase() + counselorName.slice(1);

  switch (intent) {
    // ------------------------------------------------------------------------
    // CONVERSATIONAL GREETINGS & SMALL TALK
    // ------------------------------------------------------------------------
    case 'GREETING_CASUAL':
      return {
        reply: "Hii! 👋 How can I help you today?",
        intent: 'GREETING_CASUAL',
        isSafetyIntervention: false,
        resourcesSuggested: ['Grounding Exercises', '4-7-8 Breathing'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What is victim compensation?',
          'How can I get free legal assistance?',
        ],
      };

    case 'GREETING_HELLO':
      return {
        reply: "Hello! 👋 What would you like to talk about?",
        intent: 'GREETING_HELLO',
        isSafetyIntervention: false,
        resourcesSuggested: ['Grounding Exercises', '4-7-8 Breathing'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'Give me a grounding exercise.',
          'What is victim compensation?',
        ],
      };

    case 'GREETING_HEY':
      return {
        reply: "Hey! 👋 I'm here to help. What would you like to discuss?",
        intent: 'GREETING_HEY',
        isSafetyIntervention: false,
        resourcesSuggested: ['Grounding Exercises', 'Legal Aid Directory'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What can you do?',
          'How can I get free legal assistance?',
        ],
      };

    case 'GREETING_TIMED': {
      const lower = raw.toLowerCase();
      const timeWord = lower.includes('morning') ? 'Good morning! ☀️' : lower.includes('afternoon') ? 'Good afternoon! ☀️' : 'Good evening! 🌙';
      return {
        reply: `${timeWord} How are you feeling today?`,
        intent: 'GREETING_TIMED',
        isSafetyIntervention: false,
        resourcesSuggested: ['Check-in Sanctuary', '4-7-8 Breathing'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'I am feeling nervous.',
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What can you help me with?',
        ],
      };
    }

    case 'SMALLTALK_HOW_ARE_YOU':
      return {
        reply: "I'm doing well, thank you for asking! 😊 How are you feeling today?",
        intent: 'SMALLTALK_HOW_ARE_YOU',
        isSafetyIntervention: false,
        resourcesSuggested: ['Wellbeing Check-in', 'Grounding Exercises'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'I have an upcoming court hearing and I\'m feeling nervous.',
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What can you do?',
        ],
      };

    case 'GRATITUDE': {
      const isShort = raw.toLowerCase().trim() === 'thanks';
      return {
        reply: isShort ? "You're welcome! 😊" : "You're welcome! 😊 I'm here if you need anything else.",
        intent: 'GRATITUDE',
        isSafetyIntervention: false,
        resourcesSuggested: ['Wellbeing Check-in', 'Grounding Directory'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What is victim compensation?',
          'How can I get free legal assistance?',
        ],
      };
    }

    case 'FAREWELL':
      return {
        reply: "Take care! 👋 You can come back whenever you need support.",
        intent: 'FAREWELL',
        isSafetyIntervention: false,
        resourcesSuggested: ['Emergency 112', 'Tele-MANAS 14416'],
        disclaimer: 'MindPulse Support Companion is always available here.',
      };

    case 'CAPABILITIES':
      return {
        reply: "I can help with grounding exercises, breathing exercises, general wellbeing support, and information about available legal and support resources.\n\nHere are some things you can ask me:\n• Guide you through a **4-7-8 breathing exercise**\n• Guide you through a **5-4-3-2-1 sensory grounding exercise**\n• Explain statutory **victim compensation under Section 357A CrPC**\n• Information on **free NALSA/DLSA legal defense (15100)**\n• Tips for **bedtime relaxation (NSDR)** when sleep is difficult\n• How to connect with **your assigned counselor**\n\nWhat would you like to explore?",
        intent: 'CAPABILITIES',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', 'Legal Aid Directory', 'Compensation Guide'],
        disclaimer: 'MindPulse Support Companion is a non-clinical conversational guide.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'Give me a grounding exercise.',
          'What is victim compensation?',
          'How can I get free legal assistance?',
        ],
      };

    // ------------------------------------------------------------------------
    // EMOTIONAL CONVERSATIONAL FLOW
    // ------------------------------------------------------------------------
    case 'EMOTIONAL_DISCLOSURE':
      return {
        reply: "I'm sorry you're feeling nervous. Would you like to try a short breathing or grounding exercise, or talk about what is causing you stress?",
        intent: 'EMOTIONAL_DISCLOSURE',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', 'Grounding Directory'],
        disclaimer: 'MindPulse Support Companion is a non-clinical supportive companion.',
        followUpSuggestions: [
          'breathing',
          'grounding',
          'because I have court tomorrow',
        ],
      };

    case 'CALM_REQUEST':
      return {
        reply: "Absolutely, let's take a moment together to settle your nervous system.\n\nWe can do:\n1. **4-7-8 Paced Breathing** to slow your heart rate and ease physical tension.\n2. **5-4-3-2-1 Sensory Grounding** to reconnect with your physical surroundings.\n\nWhich of these would you like to try right now?",
        intent: 'CALM_REQUEST',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', '5-4-3-2-1 Grounding Guide'],
        disclaimer: 'MindPulse Support Companion is a non-clinical supportive companion.',
        followUpSuggestions: [
          'breathing',
          'grounding',
        ],
      };

    case 'AFFIRMATION_FOLLOWUP':
      return {
        reply: "Let's do a simple 4-7-8 breathing cycle together:\n\n• **Inhale** gently through your nose for 4 seconds (1... 2... 3... 4...)\n• **Hold** your breath softly for 7 seconds (1... 2... 3... 4... 5... 6... 7...)\n• **Exhale** slowly and completely through your mouth for 8 seconds (1... 2... 3... 4... 5... 6... 7... 8...)\n\nTake one natural breath. How does your body feel right now?",
        intent: 'AFFIRMATION_FOLLOWUP',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide'],
        disclaimer: 'MindPulse Support Companion is a non-clinical supportive companion.',
        followUpSuggestions: ['Repeat once more', 'Give me a grounding exercise'],
      };

    // ------------------------------------------------------------------------
    // SPECIFIC TOPIC EXPERIENCES
    // ------------------------------------------------------------------------
    case 'COURT_ANXIETY':
      return {
        reply: `Facing an upcoming court hearing is understandable to feel nervous about. The pressure of legal proceedings and depositions can bring up significant stress.

Here are a few grounding steps and rights that can support you:

• **Your Witness Protection Rights**: You can request a separate, secure waiting area at the court and safe transit assistance through the District Witness Protection Committee.
• **Counsel Accompaniment**: Your designated DLSA panel advocate or ${counselorName} can accompany you during proceedings.
• **In the Moment**: Slowing your breathing helps steady physical shaking or heart rate before taking the stand.

Would you like to try a 4-7-8 breathing exercise right now, or learn about safe transit options?`,
        intent: 'COURT_ANXIETY',
        isSafetyIntervention: false,
        resourcesSuggested: ['DLSA Witness Protection', '4-7-8 Breathing Guide', 'Courtroom Accompaniment'],
        disclaimer: 'MindPulse Support Companion provides non-clinical guidance and procedural orientation.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What are witness protection rights?',
          'How can I get free legal assistance?',
        ],
      };

    case 'BREATHING_EXERCISE': {
      const hearingPrefix = hadCourtContext
        ? "Since you're feeling nervous about court, paced somatic breathing is one of the most reliable ways to steady your nervous system.\n\n"
        : "Let's practice the **4-7-8 Somatic Calming Technique** together right now.\n\n";

      return {
        reply: `${hearingPrefix}Find a comfortable posture, soften your shoulders, and rest your hands gently in your lap.

**Here is the 4-7-8 rhythm:**
1. **Inhale quietly through your nose** for 4 seconds:
   *1... 2... 3... 4...*
2. **Hold your breath gently** for 7 seconds without straining:
   *1... 2... 3... 4... 5... 6... 7...*
3. **Exhale slowly and fully through your mouth** for 8 seconds:
   *1... 2... 3... 4... 5... 6... 7... 8...*

Take one natural, easy breath.

Would you like to repeat this cycle 2 more times, or try a sensory grounding exercise?`,
        intent: 'BREATHING_EXERCISE',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', 'Interactive Breathing Visualizer'],
        disclaimer: 'MindPulse Support Companion is a non-clinical guide for somatic relaxation.',
        followUpSuggestions: [
          'Repeat once more',
          'Give me a grounding exercise.',
          'I\'m nervous about my court hearing.',
        ],
      };
    }

    case 'GROUNDING_EXERCISE':
      return {
        reply: `Let's do the **5-4-3-2-1 Sensory Grounding Exercise** together step-by-step:

• **5 things you can see**: Look around and notice 5 distinct objects or details (e.g., a window, desk edge, light on the wall, a pen, your shoes).
• **4 things you can feel**: Notice 4 physical touch points (e.g., feet flat on the floor, fabric of your shirt, the back of your chair, cool air on your hands).
• **3 things you can hear**: Listen for 3 ambient sounds (e.g., distant traffic, a room hum, the sound of your breathing).
• **2 things you can smell**: Gently notice 2 scents (e.g., fresh room air, tea or coffee, soap).
• **1 thing you can taste**: Notice any lingering taste or take a sip of cool water.

Take one slow, deep breath in and out. Your attention is back in the present room.`,
        intent: 'GROUNDING_EXERCISE',
        isSafetyIntervention: false,
        resourcesSuggested: ['5-4-3-2-1 Sensory Reset', 'Grounding Directory'],
        disclaimer: 'MindPulse Support Companion is a non-clinical supportive companion.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What is victim compensation?',
          'How can I get free legal assistance?',
        ],
      };

    case 'VICTIM_COMPENSATION':
      return {
        reply: `Under **Section 357A of the Code of Criminal Procedure (CrPC)** and State Victim Compensation Schemes, victims and protected witnesses are entitled to statutory financial relief and rehabilitation:

• **Interim Relief Grants**: Emergency funds sanctioned by the District Legal Services Authority (DLSA) within 14–30 days of case registration, while trial proceedings are ongoing.
• **Medical Care Grants**: Direct reimbursement for hospitalization, surgical treatment, and mental health trauma care.
• **Subsistence & Rehabilitation**: Financial support for livelihood stabilization, housing aid, or dependent family welfare.
• **Safe Transit Grants**: Expenses covering protected witness travel to court hearings.

**How to Apply**:
An application in **Form I** is submitted to the Member Secretary of the District Legal Services Authority (DLSA). ${counselorCapitalized} or your legal aid advocate can assist you in preparing documentation (FIR copy, medical records, identity proof).`,
        intent: 'VICTIM_COMPENSATION',
        isSafetyIntervention: false,
        resourcesSuggested: ['Victim Compensation (Sec 357A CrPC)', 'DLSA Form I Guidelines', 'Interim Relief Grants'],
        disclaimer: 'Information shown is for guidance on statutory schemes. Orders are determined by the competent DLSA / Court.',
        followUpSuggestions: [
          'How can I get free legal assistance?',
          'I want to talk to my counselor.',
          'Can you guide me through a 4-7-8 breathing exercise?',
        ],
      };

    case 'LEGAL_ASSISTANCE':
      return {
        reply: `Under the **Legal Services Authorities Act, 1987**, you are entitled to **free, government-assigned legal defense and witness representation**:

• **What Is Provided**:
  A designated panel advocate from the District Legal Services Authority (DLSA) will represent you, draft court pleadings, attend depositions, and protect your rights at **zero financial cost** to you.

• **How to Access Support**:
  1. **National Legal Aid Helpline**: Call **15100** (24/7 Toll-Free across India).
  2. **DLSA Front Office**: Visit the legal aid front desk at your District Court complex.
  3. **Counselor Referral**: ${counselorCapitalized} can submit an expedited referral to the district legal aid cell.

*Notice: This information is provided for educational guidance and does not constitute formal legal advice.*`,
        intent: 'LEGAL_ASSISTANCE',
        isSafetyIntervention: false,
        resourcesSuggested: ['NALSA / DLSA Free Legal Defense', 'Toll-Free 15100', 'Panel Advocate Support'],
        disclaimer: 'MindPulse Support Companion provides procedural guidance, not formal legal advice.',
        followUpSuggestions: [
          'What is victim compensation?',
          'I want to talk to my counselor.',
          'I have an upcoming court hearing and I\'m feeling nervous.',
        ],
      };

    case 'SLEEP_REST':
      return {
        reply: `Nighttime hypervigilance, racing thoughts, and sleep difficulty are very common responses when navigating case stress.

Here is a calming, non-clinical routine you can try right now:

1. **Bedtime Non-Sleep Deep Rest (NSDR)**:
   • Lie down comfortably and close your eyes.
   • Consciously release tension from your forehead, unclench your jaw, and let your shoulders drop.
   • Breathe in gently through your nose for 4 seconds, and exhale slowly for 8 seconds.

2. **Clear Lingering Thoughts**:
   • If worries about tomorrow or your case are running through your mind, write them down in your **private MindPulse reflection journal** to set them aside for the night.

3. **Gentle Boundary**:
   • Dim screen lights and remind yourself: *"Right now, in this bed, I am safe to rest. There is nothing I need to solve tonight."*

Would you like to try a 3-minute guided relaxation cycle?`,
        intent: 'SLEEP_REST',
        isSafetyIntervention: false,
        resourcesSuggested: ['Bedtime NSDR Relaxation', 'Private Reflection Journal', 'Progressive Relaxation'],
        disclaimer: 'NSDR is a progressive relaxation tool to support natural rest. It is not presented as medical treatment.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'Give me a grounding exercise.',
          'Good morning',
        ],
      };

    case 'COUNSELOR_SUPPORT':
      return {
        reply: `You can connect directly with **${counselorName}** through the District Legal Aid & Victim Support Cell:

• **Role**: Your assigned counselor provides non-clinical emotional support, case journey debriefs, hearing accompaniment coordination, and statutory compensation assistance.
• **How to Reach**:
  - Request a touchpoint through your District Welfare Cell desk.
  - Leave an accompaniment request flag in your daily check-in.
  - During court hearings, request in-person accompaniment through the DLSA front office.

All consultations are confidential and protected under victim support protocols.`,
        intent: 'COUNSELOR_SUPPORT',
        isSafetyIntervention: false,
        resourcesSuggested: ['District Welfare Cell Touchpoint', 'Confidential Support Protocol'],
        disclaimer: 'MindPulse Support Companion facilitates coordination with your assigned human care team.',
        followUpSuggestions: [
          'How can I get free legal assistance?',
          'What is victim compensation?',
          'Can you guide me through a 4-7-8 breathing exercise?',
        ],
      };

    case 'SAFE_TRANSIT':
      return {
        reply: `Witness safety and secure transportation are statutory rights protected under the **Witness Protection Scheme**:

• **What You Can Request**:
  - Escorted police transit to and from court hearings.
  - Separate, confidential ingress/egress to prevent intimidation.
  - Testifying via video-conference link or behind protective visual screens.

• **Next Steps**:
  - Inform ${counselorName} or your DLSA panel advocate before your deposition date.
  - Applications for protection orders are reviewed by the District Witness Protection Committee headed by the District Judge.

If you feel in immediate danger outside the court, call **112** right away.`,
        intent: 'SAFE_TRANSIT',
        isSafetyIntervention: false,
        resourcesSuggested: ['Witness Protection Scheme', 'District Protection Committee', 'Emergency 112'],
        disclaimer: 'Protection protocols are administered by the competent District Committee and law enforcement.',
        followUpSuggestions: [
          'How can I get free legal assistance?',
          'I have an upcoming court hearing and I\'m feeling nervous.',
          'I need urgent help.',
        ],
      };

    case 'CRISIS_URGENT':
      return {
        reply: `I hear that you need urgent support right now. Please know that you are not alone and direct, compassionate human help is available immediately.

Please connect with one of these verified 24/7 helplines right now:

• **Tele-MANAS**: Call **14416** or **1800-891-4416** (24/7 Toll-Free, Multilingual National Tele-Mental Health Programme)
• **KIRAN Mental Health Helpline**: Call **1800-599-0019** (24/7 Toll-Free, Ministry of Social Justice & Empowerment)
• **National Emergency Services**: Dial **112** (Police, Ambulance & Immediate Safety)
• **NALSA Legal Aid & Protection**: Dial **15100** (24/7 Legal Assistance)

If you are in immediate danger, please dial 112 or contact trusted emergency support immediately.`,
        intent: 'CRISIS_URGENT',
        isSafetyIntervention: true,
        resourcesSuggested: ['Tele-MANAS 14416', 'KIRAN 1800-599-0019', 'Emergency 112', 'NALSA 15100'],
        disclaimer: 'MindPulse Support Companion provides non-clinical guidance. For immediate safety, contact emergency services.',
        followUpSuggestions: ['Call 14416 (Tele-MANAS)', 'Call 1800-599-0019 (KIRAN)', 'Dial 112'],
      };

    case 'GENERAL_INFO':
    default:
      return {
        reply: `I understand your message. As your MindPulse Support Companion, I am here to help you navigate:

• **Grounding & Breathing**: Guided 4-7-8 breathing and 5-4-3-2-1 sensory exercises.
• **Court Hearing Preparation**: Managing deposition stress, witness rights, and safe transit.
• **Statutory Relief**: Section 357A CrPC victim compensation and DLSA free legal defense (15100).
• **Counselor Connection**: Coordinating with ${counselorName} and 24/7 national helplines.

Please let me know which of these you would like to explore, or tell me more about what you need right now.`,
        intent: 'GENERAL_INFO',
        isSafetyIntervention: false,
        resourcesSuggested: ['4-7-8 Breathing Guide', 'Legal Aid Directory', 'Compensation Guide'],
        disclaimer: 'MindPulse Support Companion is a non-clinical decision support companion.',
        followUpSuggestions: [
          'Can you guide me through a 4-7-8 breathing exercise?',
          'What is victim compensation?',
          'How can I get free legal assistance?',
        ],
      };
  }
}
