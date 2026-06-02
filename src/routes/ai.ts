import { Router, Request, Response } from 'express';
import { chat, ChatMessage } from '../modules/geminiAgent';

const router = Router();

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as { message: string; history?: ChatMessage[] };
    if (!message?.trim()) return res.status(400).json({ success: false, message: '訊息不可為空' });
    const result = await chat(message.trim(), history ?? []);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message ?? 'AI 回應失敗' });
  }
});

export default router;
