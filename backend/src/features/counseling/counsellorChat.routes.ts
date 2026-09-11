import { Router } from 'express';
import { authenticateToken, requireRoles } from '../../middleware/auth.middleware.js';
import { counsellorChatController } from './counsellorChat.controller.js';

// Victim Chat & Suggestions Router: /api/victims
export const victimChatRouter = Router();
victimChatRouter.use(authenticateToken);
victimChatRouter.get('/me/counsellor-chat', counsellorChatController.getVictimConversation);
victimChatRouter.get('/me/counsellor-chat/messages', counsellorChatController.getVictimMessages);
victimChatRouter.post('/me/counsellor-chat/messages', counsellorChatController.sendVictimMessage);
victimChatRouter.post('/me/counsellor-suggestions', counsellorChatController.requestVictimSuggestion);
victimChatRouter.get('/me/counsellor-suggestions', counsellorChatController.getVictimSuggestions);

// Counsellor Inbox, Chat & Suggestions Router: /api/counselor
export const counsellorChatRouter = Router();
counsellorChatRouter.use(authenticateToken);
counsellorChatRouter.use(requireRoles('COUNSELOR', 'ADMIN'));
counsellorChatRouter.get('/inbox', counsellorChatController.getCounsellorInbox);
counsellorChatRouter.get('/conversations/:conversationId/messages', counsellorChatController.getCounsellorConversationMessages);
counsellorChatRouter.post('/conversations/:conversationId/messages', counsellorChatController.sendCounsellorMessage);
counsellorChatRouter.get('/suggestion-requests', counsellorChatController.getCounsellorSuggestionRequests);
counsellorChatRouter.post('/suggestion-requests/:requestId/respond', counsellorChatController.respondCounsellorSuggestion);
