import { Request, Response, NextFunction } from 'express';
import { counsellorChatService } from './counsellorChat.service.js';

export const counsellorChatController = {
  // Victim Endpoints
  getVictimConversation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await counsellorChatService.getOrCreateVictimConversation(req.user.userId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getVictimMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await counsellorChatService.getVictimMessages(req.user.userId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  sendVictimMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = req.body;
      const result = await counsellorChatService.sendVictimMessage(req.user, message);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  requestVictimSuggestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = req.body;
      const result = await counsellorChatService.requestCounsellorSuggestion(req.user, notes);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getVictimSuggestions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await counsellorChatService.getVictimSuggestions(req.user.userId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // Counsellor Endpoints
  getCounsellorInbox: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await counsellorChatService.getCounsellorInbox(req.user);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getCounsellorConversationMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const result = await counsellorChatService.getCounsellorConversationMessages(req.user, conversationId);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  sendCounsellorMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;
      const result = await counsellorChatService.sendCounsellorMessage(req.user, conversationId, message);
      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  getCounsellorSuggestionRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await counsellorChatService.getCounsellorSuggestionRequests(req.user);
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  respondCounsellorSuggestion: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const { suggestionMessage } = req.body;
      const result = await counsellorChatService.respondCounsellorSuggestion(
        req.user,
        requestId,
        suggestionMessage
      );
      res.json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
