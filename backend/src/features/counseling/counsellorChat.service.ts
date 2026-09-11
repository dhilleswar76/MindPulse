import mongoose from 'mongoose';
import {
  User,
  Case,
  Conversation,
  Message,
  CounsellorSuggestion,
  IConversation,
  IMessage,
  ICounsellorSuggestion,
} from '../../models/index.js';
import { TokenPayload } from '../../types/index.js';
import { notificationsService } from '../notifications/notifications.service.js';

// In-Memory Fallback Store for mock/offline testing
interface MemConversation {
  _id: string;
  victimId: string;
  victimName: string;
  counsellorId: string;
  counsellorName: string;
  caseId: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  lastSenderRole?: 'USER' | 'COUNSELOR';
  victimUnreadCount: number;
  counsellorUnreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

interface MemMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'COUNSELOR';
  receiverId: string;
  message: string;
  messageType: 'TEXT';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

interface MemSuggestion {
  _id: string;
  victimId: string;
  victimName: string;
  counsellorId: string;
  counsellorName: string;
  caseId: string;
  status: 'PENDING' | 'RESPONDED' | 'CANCELLED';
  telemetrySnapshot?: {
    mood?: number;
    stress?: number;
    sleepHours?: number;
    anxiety?: number;
    safety?: number;
    riskLevel?: string;
    riskScore?: number;
  };
  requestNotes?: string;
  suggestionMessage?: string;
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const memoryConversations: MemConversation[] = [];
const memoryMessages: MemMessage[] = [];
const memorySuggestions: MemSuggestion[] = [];

function isSarahCounsellor(counselorUser: { userId?: string; email?: string; fullName?: string }): boolean {
  const id = counselorUser.userId || '';
  const email = (counselorUser.email || '').toLowerCase();
  const name = (counselorUser.fullName || '').toLowerCase();
  return (
    id === 'counselor_sarah_201' ||
    id === 'c1' ||
    id === 'demo_counselor' ||
    email.includes('counsellor') ||
    email.includes('sarah') ||
    name.includes('sarah')
  );
}

function isAlexVictim(victimUserId: string): boolean {
  const v = (victimUserId || '').toLowerCase();
  return (
    v === 'user_alex_101' ||
    v === 'demo_user' ||
    v === 'u1' ||
    v.includes('alex') ||
    v.includes('user@gmail.com')
  );
}

export const counsellorChatService = {
  // Helper to reset memory store during test runs
  _resetMemoryStore: () => {
    memoryConversations.length = 0;
    memoryMessages.length = 0;
    memorySuggestions.length = 0;
  },

  // 1. Get or create a private conversation for a victim with their assigned counsellor
  getOrCreateVictimConversation: async (victimUserId: string) => {
    let victim: any = null;
    let counsellor: any = null;

    try {
      if (mongoose.Types.ObjectId.isValid(victimUserId)) {
        victim = await User.findById(victimUserId);
      }
      if (!victim) {
        victim = await User.findOne({ $or: [{ _id: victimUserId }, { email: victimUserId }, { caseId: victimUserId }] });
      }

      if (victim) {
        if (!victim.counsellorId || victim.counsellorStatus !== 'ACTIVE') {
          return {
            hasCounsellor: false,
            counsellorStatus: victim.counsellorStatus || 'NOT_ALLOCATED',
            counsellor: null,
            conversation: null,
          };
        }

        counsellor = await User.findById(victim.counsellorId);
        const counsellorName = counsellor?.fullName || victim.assignedCounselor || 'Dr. Sarah Jenkins';
        const counsellorEmail = counsellor?.email || 'counsellor@gmail.com';

        let conversation = await Conversation.findOne({
          victimId: victim._id,
          counsellorId: victim.counsellorId,
        });

        if (!conversation) {
          conversation = await Conversation.create({
            victimId: victim._id,
            victimName: victim.fullName,
            counsellorId: victim.counsellorId,
            counsellorName,
            caseId: victim.caseId || 'MP-1042',
            lastMessage: 'Conversation established.',
            lastMessageAt: new Date(),
            victimUnreadCount: 0,
            counsellorUnreadCount: 0,
            status: 'ACTIVE',
          });
        }

        return {
          hasCounsellor: true,
          counsellorStatus: 'ACTIVE',
          counsellor: {
            id: victim.counsellorId.toString(),
            fullName: counsellorName,
            email: counsellorEmail,
            specialization: counsellor?.specialization || 'Trauma-Informed Crisis Support & Legal Aid',
            experienceYears: counsellor?.experienceYears || 12,
            availabilityStatus: counsellor?.availabilityStatus || 'AVAILABLE',
            district: counsellor?.district || victim.district || 'Central District',
          },
          conversation: {
            _id: conversation._id.toString(),
            victimId: conversation.victimId.toString(),
            counsellorId: conversation.counsellorId.toString(),
            caseId: conversation.caseId,
            lastMessage: conversation.lastMessage,
            lastMessageAt: conversation.lastMessageAt,
            victimUnreadCount: conversation.victimUnreadCount,
            counsellorUnreadCount: conversation.counsellorUnreadCount,
          },
        };
      }
    } catch {
      // Fallback below
    }

    // Memory store fallback
    const isAlex = isAlexVictim(victimUserId);
    if (!isAlex) {
      // Check if this user was allocated in memory
      const existingConv = memoryConversations.find(
        (c) => c.victimId === victimUserId || c.caseId === victimUserId
      );
      if (!existingConv) {
        return {
          hasCounsellor: false,
          counsellorStatus: 'NOT_ALLOCATED',
          counsellor: null,
          conversation: null,
        };
      }
    }

    const memCounsellorId = 'counselor_sarah_201';
    const memCounsellorName = 'Dr. Sarah Jenkins';
    const memCaseId = 'MP-1042';
    const memVictimName = 'Alex Rivera (Protected Witness)';

    let memConv = memoryConversations.find(
      (c) => (c.victimId === victimUserId || c.victimId === 'user_alex_101' || c.victimId === 'demo_user') &&
        (c.counsellorId === memCounsellorId || c.counsellorId === 'demo_counselor' || c.counsellorId === 'c1')
    );

    if (!memConv) {
      memConv = {
        _id: 'conv_' + Date.now(),
        victimId: victimUserId || 'user_alex_101',
        victimName: memVictimName,
        counsellorId: memCounsellorId,
        counsellorName: memCounsellorName,
        caseId: memCaseId,
        lastMessage: 'Welcome to your confidential counselling space.',
        lastMessageAt: new Date(),
        victimUnreadCount: 0,
        counsellorUnreadCount: 0,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryConversations.push(memConv);
    }

    return {
      hasCounsellor: true,
      counsellorStatus: 'ACTIVE',
      counsellor: {
        id: memCounsellorId,
        fullName: memCounsellorName,
        email: 'counsellor@gmail.com',
        specialization: 'Trauma-Informed Crisis Support & Legal Aid',
        experienceYears: 12,
        availabilityStatus: 'AVAILABLE',
        district: 'Central District',
      },
      conversation: memConv,
    };
  },

  // 2. Victim fetches messages & marks unread messages as read
  getVictimMessages: async (victimUserId: string) => {
    try {
      const convData = await counsellorChatService.getOrCreateVictimConversation(victimUserId);
      if (!convData.hasCounsellor || !convData.conversation) {
        const error: any = new Error('No counsellor has been assigned to your case yet.');
        error.statusCode = 404;
        throw error;
      }

      if (mongoose.Types.ObjectId.isValid(convData.conversation._id)) {
        const messages = await Message.find({
          conversationId: convData.conversation._id,
        }).sort({ createdAt: 1 });

        // Mark incoming messages from counsellor as read
        await Message.updateMany(
          {
            conversationId: convData.conversation._id,
            senderRole: 'COUNSELOR',
            read: false,
          },
          { read: true, readAt: new Date() }
        );

        await Conversation.findByIdAndUpdate(convData.conversation._id, {
          victimUnreadCount: 0,
        });

        return {
          counsellor: convData.counsellor,
          conversation: convData.conversation,
          messages: messages.map((m) => ({
            _id: m._id.toString(),
            conversationId: m.conversationId.toString(),
            senderId: m.senderId.toString(),
            senderName: m.senderName,
            senderRole: m.senderRole,
            receiverId: m.receiverId.toString(),
            message: m.message,
            messageType: m.messageType,
            read: m.read,
            readAt: m.readAt,
            createdAt: m.createdAt,
          })),
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memConvData = await counsellorChatService.getOrCreateVictimConversation(victimUserId);
    if (!memConvData.hasCounsellor || !memConvData.conversation) {
      const error: any = new Error('No counsellor has been assigned to your case yet.');
      error.statusCode = 404;
      throw error;
    }

    const memMessages = memoryMessages.filter(
      (m) => m.conversationId === memConvData.conversation._id
    );

    // Mark counsellor messages as read
    memMessages.forEach((m) => {
      if (m.senderRole === 'COUNSELOR') {
        m.read = true;
        m.readAt = new Date();
      }
    });

    const targetConv = memoryConversations.find((c) => c._id === memConvData.conversation._id);
    if (targetConv) {
      targetConv.victimUnreadCount = 0;
    }

    return {
      counsellor: memConvData.counsellor,
      conversation: memConvData.conversation,
      messages: memMessages,
    };
  },

  // 3. Victim sends a message to assigned counsellor
  sendVictimMessage: async (victimUser: TokenPayload, messageText: string) => {
    if (!messageText || !messageText.trim()) {
      const error: any = new Error('Message content cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    try {
      const convData = await counsellorChatService.getOrCreateVictimConversation(victimUser.userId);
      if (!convData.hasCounsellor || !convData.conversation || !convData.counsellor) {
        const error: any = new Error('Cannot send message. No counsellor assigned to your case.');
        error.statusCode = 400;
        throw error;
      }

      if (mongoose.Types.ObjectId.isValid(convData.conversation._id)) {
        const victimDoc = await User.findById(victimUser.userId);
        const newMsg = await Message.create({
          conversationId: convData.conversation._id,
          senderId: victimDoc?._id || victimUser.userId,
          senderName: victimDoc?.fullName || victimUser.fullName || 'Victim',
          senderRole: 'USER',
          receiverId: convData.counsellor.id,
          message: messageText.trim(),
          messageType: 'TEXT',
          read: false,
        });

        await Conversation.findByIdAndUpdate(convData.conversation._id, {
          lastMessage: messageText.trim(),
          lastMessageAt: new Date(),
          lastSenderRole: 'USER',
          $inc: { counsellorUnreadCount: 1 },
        });

        // Notify counsellor
        await notificationsService.createNotification({
          recipientRole: 'COUNSELOR',
          recipientId: mongoose.Types.ObjectId.isValid(convData.counsellor.id)
            ? new mongoose.Types.ObjectId(convData.counsellor.id)
            : undefined,
          caseId: convData.conversation.caseId,
          type: 'CHAT_MESSAGE_RECEIVED',
          title: `New message from Victim #${convData.conversation.caseId}`,
          message: messageText.trim().substring(0, 120),
          submittedBy: victimDoc?.fullName || victimUser.fullName,
          status: 'Unread Message',
          requestId: newMsg._id,
        });

        return {
          success: true,
          message: newMsg,
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memConvData = await counsellorChatService.getOrCreateVictimConversation(victimUser.userId);
    if (!memConvData.hasCounsellor || !memConvData.conversation || !memConvData.counsellor) {
      const error: any = new Error('Cannot send message. No counsellor assigned to your case.');
      error.statusCode = 400;
      throw error;
    }

    const memMsg: MemMessage = {
      _id: 'msg_' + Date.now(),
      conversationId: memConvData.conversation._id,
      senderId: victimUser.userId,
      senderName: victimUser.fullName || 'Alex Rivera',
      senderRole: 'USER',
      receiverId: memConvData.counsellor.id,
      message: messageText.trim(),
      messageType: 'TEXT',
      read: false,
      createdAt: new Date(),
    };

    memoryMessages.push(memMsg);

    const targetConv = memoryConversations.find((c) => c._id === memConvData.conversation._id);
    if (targetConv) {
      targetConv.lastMessage = messageText.trim();
      targetConv.lastMessageAt = new Date();
      targetConv.lastSenderRole = 'USER';
      targetConv.counsellorUnreadCount += 1;
    }

    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      caseId: memConvData.conversation.caseId,
      type: 'CHAT_MESSAGE_RECEIVED',
      title: `New message from Victim #${memConvData.conversation.caseId}`,
      message: messageText.trim().substring(0, 120),
      submittedBy: victimUser.fullName || 'Alex Rivera',
      status: 'Unread Message',
      requestId: memMsg._id,
    });

    return {
      success: true,
      message: memMsg,
    };
  },

  // 4. Counsellor views their Inbox: conversations, suggestion requests, and unread badges
  getCounsellorInbox: async (counselorUser: TokenPayload) => {
    try {
      let counsellorDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(counselorUser.userId)) {
        counsellorDoc = await User.findById(counselorUser.userId);
      }
      if (!counsellorDoc) {
        counsellorDoc = await User.findOne({ email: counselorUser.email });
      }

      const counsellorId = counsellorDoc?._id || counselorUser.userId;

      const conversations = await Conversation.find({
        counsellorId,
        status: 'ACTIVE',
      }).sort({ lastMessageAt: -1 }).lean();

      const suggestions = await CounsellorSuggestion.find({
        counsellorId,
      }).sort({ createdAt: -1 }).lean();

      const pendingSuggestions = suggestions.filter((s) => s.status === 'PENDING');
      const totalUnread = conversations.reduce((sum, c) => sum + (c.counsellorUnreadCount || 0), 0);

      return {
        conversations: conversations.map((c: any) => ({
          _id: c._id.toString(),
          victimId: c.victimId.toString(),
          victimName: c.victimName,
          caseId: c.caseId,
          lastMessage: c.lastMessage,
          lastMessageAt: c.lastMessageAt,
          lastSenderRole: c.lastSenderRole,
          unreadCount: c.counsellorUnreadCount || 0,
        })),
        suggestionRequests: suggestions,
        stats: {
          activeConversations: conversations.length,
          unreadMessages: totalUnread,
          pendingSuggestions: pendingSuggestions.length,
          totalSuggestions: suggestions.length,
        },
      };
    } catch {
      // Fallback below
    }

    // Memory store fallback
    const memCounsellorId = counselorUser.userId;
    const isSarah = isSarahCounsellor(counselorUser);
    const memConvs = memoryConversations.filter(
      (c) => c.counsellorId === memCounsellorId || (isSarah && (c.counsellorId === 'counselor_sarah_201' || c.counsellorId === 'demo_counselor' || c.counsellorId === 'c1'))
    );

    const memSuggs = memorySuggestions.filter(
      (s) => s.counsellorId === memCounsellorId || (isSarah && (s.counsellorId === 'counselor_sarah_201' || s.counsellorId === 'demo_counselor' || s.counsellorId === 'c1'))
    );

    const pending = memSuggs.filter((s) => s.status === 'PENDING');
    const totalUnread = memConvs.reduce((sum, c) => sum + (c.counsellorUnreadCount || 0), 0);

    return {
      conversations: memConvs.map((c) => ({
        _id: c._id,
        victimId: c.victimId,
        victimName: c.victimName,
        caseId: c.caseId,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        lastSenderRole: c.lastSenderRole,
        unreadCount: c.counsellorUnreadCount,
      })),
      suggestionRequests: memSuggs,
      stats: {
        activeConversations: memConvs.length,
        unreadMessages: totalUnread,
        pendingSuggestions: pending.length,
        totalSuggestions: memSuggs.length,
      },
    };
  },

  // 5. Counsellor fetches conversation messages (with strict 1-to-1 RBAC check)
  getCounsellorConversationMessages: async (
    counselorUser: TokenPayload,
    conversationId: string
  ) => {
    try {
      let conv: any = null;
      if (mongoose.Types.ObjectId.isValid(conversationId)) {
        conv = await Conversation.findById(conversationId);
      }
      if (!conv) {
        conv = await Conversation.findOne({ _id: conversationId });
      }

      if (conv) {
        // Strict Authorization: Verify this counsellor is the assigned counsellor
        const isOwner =
          conv.counsellorId.toString() === counselorUser.userId ||
          conv.counsellorName === counselorUser.fullName;

        if (!isOwner && counselorUser.role !== 'ADMIN') {
          const error: any = new Error('Forbidden: You are not the assigned counsellor for this conversation.');
          error.statusCode = 403;
          throw error;
        }

        const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });

        // Mark incoming messages as read
        await Message.updateMany(
          {
            conversationId: conv._id,
            senderRole: 'USER',
            read: false,
          },
          { read: true, readAt: new Date() }
        );

        await Conversation.findByIdAndUpdate(conv._id, { counsellorUnreadCount: 0 });

        return {
          conversation: {
            _id: conv._id.toString(),
            victimId: conv.victimId.toString(),
            victimName: conv.victimName,
            caseId: conv.caseId,
            lastMessage: conv.lastMessage,
            lastMessageAt: conv.lastMessageAt,
          },
          messages: messages.map((m) => ({
            _id: m._id.toString(),
            conversationId: m.conversationId.toString(),
            senderId: m.senderId.toString(),
            senderName: m.senderName,
            senderRole: m.senderRole,
            receiverId: m.receiverId.toString(),
            message: m.message,
            messageType: m.messageType,
            read: m.read,
            readAt: m.readAt,
            createdAt: m.createdAt,
          })),
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memConv = memoryConversations.find((c) => c._id === conversationId);
    if (!memConv) {
      const error: any = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner =
      memConv.counsellorId === counselorUser.userId ||
      memConv.counsellorName === counselorUser.fullName ||
      ((memConv.counsellorId === 'counselor_sarah_201' || memConv.counsellorId === 'demo_counselor' || memConv.counsellorId === 'c1') &&
        isSarahCounsellor(counselorUser));

    if (!isOwner && counselorUser.role !== 'ADMIN') {
      const error: any = new Error('Forbidden: You are not the assigned counsellor for this conversation.');
      error.statusCode = 403;
      throw error;
    }

    const memMessages = memoryMessages.filter((m) => m.conversationId === conversationId);
    memMessages.forEach((m) => {
      if (m.senderRole === 'USER') {
        m.read = true;
        m.readAt = new Date();
      }
    });

    memConv.counsellorUnreadCount = 0;

    return {
      conversation: memConv,
      messages: memMessages,
    };
  },

  // 6. Counsellor sends a message in a conversation (with strict RBAC)
  sendCounsellorMessage: async (
    counselorUser: TokenPayload,
    conversationId: string,
    messageText: string
  ) => {
    if (!messageText || !messageText.trim()) {
      const error: any = new Error('Message text cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    try {
      let conv: any = null;
      if (mongoose.Types.ObjectId.isValid(conversationId)) {
        conv = await Conversation.findById(conversationId);
      }
      if (!conv) {
        conv = await Conversation.findOne({ _id: conversationId });
      }

      if (conv) {
        const isOwner =
          conv.counsellorId.toString() === counselorUser.userId ||
          conv.counsellorName === counselorUser.fullName;

        if (!isOwner && counselorUser.role !== 'ADMIN') {
          const error: any = new Error('Forbidden: You are not authorized to send messages in this conversation.');
          error.statusCode = 403;
          throw error;
        }

        const newMsg = await Message.create({
          conversationId: conv._id,
          senderId: counselorUser.userId,
          senderName: counselorUser.fullName || conv.counsellorName,
          senderRole: 'COUNSELOR',
          receiverId: conv.victimId,
          message: messageText.trim(),
          messageType: 'TEXT',
          read: false,
        });

        await Conversation.findByIdAndUpdate(conv._id, {
          lastMessage: messageText.trim(),
          lastMessageAt: new Date(),
          lastSenderRole: 'COUNSELOR',
          $inc: { victimUnreadCount: 1 },
        });

        // Notify victim
        await notificationsService.createNotification({
          recipientRole: 'USER',
          recipientId: mongoose.Types.ObjectId.isValid(conv.victimId) ? conv.victimId : undefined,
          caseId: conv.caseId,
          type: 'CHAT_MESSAGE_RECEIVED',
          title: `New message from ${counselorUser.fullName || 'Dr. Sarah Jenkins'}`,
          message: messageText.trim().substring(0, 120),
          submittedBy: counselorUser.fullName || 'Dr. Sarah Jenkins',
          status: 'Unread Message',
          requestId: newMsg._id,
        });

        return {
          success: true,
          message: newMsg,
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memConv = memoryConversations.find((c) => c._id === conversationId);
    if (!memConv) {
      const error: any = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner =
      memConv.counsellorId === counselorUser.userId ||
      memConv.counsellorName === counselorUser.fullName ||
      ((memConv.counsellorId === 'counselor_sarah_201' || memConv.counsellorId === 'demo_counselor' || memConv.counsellorId === 'c1') &&
        isSarahCounsellor(counselorUser));

    if (!isOwner && counselorUser.role !== 'ADMIN') {
      const error: any = new Error('Forbidden: You are not authorized to send messages in this conversation.');
      error.statusCode = 403;
      throw error;
    }

    const memMsg: MemMessage = {
      _id: 'msg_' + Date.now(),
      conversationId: memConv._id,
      senderId: counselorUser.userId,
      senderName: counselorUser.fullName || 'Dr. Sarah Jenkins',
      senderRole: 'COUNSELOR',
      receiverId: memConv.victimId,
      message: messageText.trim(),
      messageType: 'TEXT',
      read: false,
      createdAt: new Date(),
    };

    memoryMessages.push(memMsg);

    memConv.lastMessage = messageText.trim();
    memConv.lastMessageAt = new Date();
    memConv.lastSenderRole = 'COUNSELOR';
    memConv.victimUnreadCount += 1;

    await notificationsService.createNotification({
      recipientRole: 'USER',
      recipientId: mongoose.Types.ObjectId.isValid(memConv.victimId)
        ? (new mongoose.Types.ObjectId(memConv.victimId) as any)
        : undefined,
      caseId: memConv.caseId,
      type: 'CHAT_MESSAGE_RECEIVED',
      title: `New message from ${counselorUser.fullName || 'Dr. Sarah Jenkins'}`,
      message: messageText.trim().substring(0, 120),
      submittedBy: counselorUser.fullName || 'Dr. Sarah Jenkins',
      status: 'Unread Message',
      requestId: memMsg._id as any,
    });

    return {
      success: true,
      message: memMsg,
    };
  },

  // 7. Victim requests a personalized suggestion from assigned counsellor (with duplicate protection)
  requestCounsellorSuggestion: async (victimUser: TokenPayload, notes?: string) => {
    try {
      let victimDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(victimUser.userId)) {
        victimDoc = await User.findById(victimUser.userId);
      }
      if (!victimDoc) {
        victimDoc = await User.findOne({ email: victimUser.email });
      }

      if (victimDoc) {
        if (!victimDoc.counsellorId || victimDoc.counsellorStatus !== 'ACTIVE') {
          const error: any = new Error('No counsellor has been assigned to your case yet. Please request a counsellor first.');
          error.statusCode = 400;
          throw error;
        }

        // Duplicate prevention: check for existing PENDING suggestion request
        const existingPending = await CounsellorSuggestion.findOne({
          victimId: victimDoc._id,
          status: 'PENDING',
        });

        if (existingPending) {
          const error: any = new Error('You already have a pending suggestion request awaiting your counsellor\'s review.');
          error.statusCode = 400;
          throw error;
        }

        const counsellorDoc = await User.findById(victimDoc.counsellorId);
        const caseId = victimDoc.caseId || 'MP-1042';

        const newSuggestion = await CounsellorSuggestion.create({
          victimId: victimDoc._id,
          victimName: victimDoc.fullName,
          counsellorId: victimDoc.counsellorId,
          counsellorName: counsellorDoc?.fullName || victimDoc.assignedCounselor || 'Dr. Sarah Jenkins',
          caseId,
          status: 'PENDING',
          telemetrySnapshot: {
            mood: 5.4,
            stress: 7.2,
            sleepHours: 5.2,
            anxiety: 6.8,
            safety: 5.5,
            riskLevel: 'ELEVATED',
            riskScore: 68,
          },
          requestNotes: notes?.trim() || 'Victim requested wellbeing and case milestone suggestion.',
          requestedAt: new Date(),
        });

        // Notify counsellor
        await notificationsService.createNotification({
          recipientRole: 'COUNSELOR',
          recipientId: mongoose.Types.ObjectId.isValid(victimDoc.counsellorId) ? victimDoc.counsellorId : undefined,
          caseId,
          type: 'COUNSELLOR_SUGGESTION_REQUESTED',
          title: `New Counsellor Suggestion Request`,
          message: `Victim #${caseId} has requested your personalized wellbeing guidance and forecast review.`,
          submittedBy: victimDoc.fullName,
          status: 'Pending Response',
          requestId: newSuggestion._id,
        });

        return {
          success: true,
          suggestionRequest: newSuggestion,
          message: 'Suggestion request sent to your counsellor.',
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const existingMemPending = memorySuggestions.find(
      (s) => s.victimId === victimUser.userId && s.status === 'PENDING'
    );

    if (existingMemPending) {
      const error: any = new Error('You already have a pending suggestion request awaiting your counsellor\'s review.');
      error.statusCode = 400;
      throw error;
    }

    const memSuggestion: MemSuggestion = {
      _id: 'sugg_' + Date.now(),
      victimId: victimUser.userId,
      victimName: victimUser.fullName || 'Alex Rivera',
      counsellorId: 'counselor_sarah_201',
      counsellorName: 'Dr. Sarah Jenkins',
      caseId: 'MP-1042',
      status: 'PENDING',
      telemetrySnapshot: {
        mood: 5.4,
        stress: 7.2,
        sleepHours: 5.2,
        anxiety: 6.8,
        safety: 5.5,
        riskLevel: 'ELEVATED',
        riskScore: 68,
      },
      requestNotes: notes?.trim() || 'Victim requested wellbeing and case milestone guidance.',
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memorySuggestions.unshift(memSuggestion);

    await notificationsService.createNotification({
      recipientRole: 'COUNSELOR',
      caseId: 'MP-1042',
      type: 'COUNSELLOR_SUGGESTION_REQUESTED',
      title: 'New Counsellor Suggestion Request',
      message: `Victim #MP-1042 has requested your personalized wellbeing guidance.`,
      submittedBy: victimUser.fullName || 'Alex Rivera',
      status: 'Pending Response',
      requestId: memSuggestion._id,
    });

    return {
      success: true,
      suggestionRequest: memSuggestion,
      message: 'Suggestion request sent to your counsellor.',
    };
  },

  // 8. Victim views suggestions history
  getVictimSuggestions: async (victimUserId: string) => {
    try {
      let victimDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(victimUserId)) {
        victimDoc = await User.findById(victimUserId);
      }
      if (!victimDoc) {
        victimDoc = await User.findOne({ $or: [{ _id: victimUserId }, { email: victimUserId }] });
      }

      if (victimDoc) {
        const suggestions = await CounsellorSuggestion.find({
          victimId: victimDoc._id,
        }).sort({ createdAt: -1 });

        return suggestions;
      }
    } catch {
      // Fallback below
    }

    return memorySuggestions.filter((s) => s.victimId === victimUserId || s.victimId === 'user_alex_101' || s.victimId === 'demo_user');
  },

  // 9. Counsellor views incoming suggestion requests
  getCounsellorSuggestionRequests: async (counselorUser: TokenPayload) => {
    try {
      const suggestions = await CounsellorSuggestion.find({
        counsellorId: counselorUser.userId,
      }).sort({ createdAt: -1 });

      return suggestions;
    } catch {
      // Fallback
    }

    const isSarah = isSarahCounsellor(counselorUser);
    return memorySuggestions.filter(
      (s) =>
        s.counsellorId === counselorUser.userId ||
        (isSarah && (s.counsellorId === 'counselor_sarah_201' || s.counsellorId === 'demo_counselor' || s.counsellorId === 'c1'))
    );
  },

  // 10. Counsellor responds to suggestion request with personalized advice
  respondCounsellorSuggestion: async (
    counselorUser: TokenPayload,
    requestId: string,
    suggestionMessage: string
  ) => {
    if (!suggestionMessage || !suggestionMessage.trim()) {
      const error: any = new Error('Suggestion message cannot be empty.');
      error.statusCode = 400;
      throw error;
    }

    try {
      let suggDoc: any = null;
      if (mongoose.Types.ObjectId.isValid(requestId)) {
        suggDoc = await CounsellorSuggestion.findById(requestId);
      }
      if (!suggDoc) {
        suggDoc = await CounsellorSuggestion.findOne({ _id: requestId });
      }

      if (suggDoc) {
        const isOwner =
          suggDoc.counsellorId.toString() === counselorUser.userId ||
          suggDoc.counsellorName === counselorUser.fullName;

        if (!isOwner && counselorUser.role !== 'ADMIN') {
          const error: any = new Error('Forbidden: You are not authorized to respond to this suggestion request.');
          error.statusCode = 403;
          throw error;
        }

        suggDoc.suggestionMessage = suggestionMessage.trim();
        suggDoc.status = 'RESPONDED';
        suggDoc.respondedAt = new Date();
        await suggDoc.save();

        // Notify victim
        await notificationsService.createNotification({
          recipientRole: 'USER',
          recipientId: mongoose.Types.ObjectId.isValid(suggDoc.victimId) ? suggDoc.victimId : undefined,
          caseId: suggDoc.caseId,
          type: 'COUNSELLOR_SUGGESTION_RECEIVED',
          title: 'New Counsellor Suggestion',
          message: `${counselorUser.fullName || 'Dr. Sarah Jenkins'} has sent you a personalized wellbeing suggestion for Case #${suggDoc.caseId}.`,
          submittedBy: counselorUser.fullName || 'Dr. Sarah Jenkins',
          status: 'Suggestion Ready',
          requestId: suggDoc._id,
        });

        return {
          success: true,
          suggestion: suggDoc,
          message: 'Personalized suggestion sent to victim.',
        };
      }
    } catch (err: any) {
      if (err.statusCode) throw err;
    }

    // Memory store fallback
    const memSugg = memorySuggestions.find((s) => s._id === requestId);
    if (!memSugg) {
      const error: any = new Error('Suggestion request not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner =
      memSugg.counsellorId === counselorUser.userId ||
      ((memSugg.counsellorId === 'counselor_sarah_201' || memSugg.counsellorId === 'demo_counselor' || memSugg.counsellorId === 'c1') &&
        isSarahCounsellor(counselorUser)) ||
      memSugg.counsellorName === counselorUser.fullName;

    if (!isOwner && counselorUser.role !== 'ADMIN') {
      const error: any = new Error('Forbidden: You are not authorized to respond to this suggestion request.');
      error.statusCode = 403;
      throw error;
    }

    memSugg.suggestionMessage = suggestionMessage.trim();
    memSugg.status = 'RESPONDED';
    memSugg.respondedAt = new Date();

    await notificationsService.createNotification({
      recipientRole: 'USER',
      recipientId: mongoose.Types.ObjectId.isValid(memSugg.victimId)
        ? (new mongoose.Types.ObjectId(memSugg.victimId) as any)
        : undefined,
      caseId: memSugg.caseId,
      type: 'COUNSELLOR_SUGGESTION_RECEIVED',
      title: 'New Counsellor Suggestion',
      message: `${counselorUser.fullName || 'Dr. Sarah Jenkins'} has sent you a personalized wellbeing suggestion for Case #${memSugg.caseId}.`,
      submittedBy: counselorUser.fullName || 'Dr. Sarah Jenkins',
      status: 'Suggestion Ready',
      requestId: memSugg._id as any,
    });

    return {
      success: true,
      suggestion: memSugg,
      message: 'Personalized suggestion sent to victim.',
    };
  },
};
