import { Router, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { AuthRequest } from '../../types/index.js';
import { mlClient } from '../../services/mlClient.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const router = Router();

router.use(authenticateToken);

router.post('/analyze-voice', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId || 'user_alex_101';
    const { duration_seconds, sample_rate } = req.body;
    
    const result = await mlClient.analyzeVoice(userId, {
      durationSec: duration_seconds || 5.0,
      sampleRate: sample_rate || 16000,
    });
    
    return sendSuccess(res, result);
  } catch (err: any) {
    return sendError(res, err.message || 'Voice analysis failed', 500);
  }
});

export default router;
