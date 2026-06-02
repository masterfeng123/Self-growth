import { Router, Request, Response } from 'express';
import db from '../db/database';
import { fetchClaudeUsage } from '../modules/claudeUsageScraper';

const router = Router();

function weekStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay() + 1); // Monday
  return d.toLocaleDateString('sv');
}

function todayStr(): string {
  return new Date().toLocaleDateString('sv');
}

// GET /api/usage
router.get('/', (_req: Request, res: Response) => {
  try {
    const ws = weekStart();
    const today = todayStr();

    const geminiWeek = db.prepare(`
      SELECT COUNT(*) as calls,
             SUM(tokens_in) as tin,
             SUM(tokens_out) as tout
      FROM api_usage_logs
      WHERE service = 'gemini' AND created_at >= ?
    `).get(ws) as any;

    const geminiToday = db.prepare(`
      SELECT COUNT(*) as calls
      FROM api_usage_logs
      WHERE service = 'gemini' AND created_at >= ?
    `).get(today) as any;

    const claudeRow = db.prepare(`
      SELECT * FROM claude_usage_manual WHERE week_start = ?
    `).get(ws) as any;

    res.json({
      success: true,
      data: {
        weekStart: ws,
        gemini: {
          weekCalls: geminiWeek?.calls ?? 0,
          todayCalls: geminiToday?.calls ?? 0,
          weekTokensIn: geminiWeek?.tin ?? 0,
          weekTokensOut: geminiWeek?.tout ?? 0,
        },
        claude: {
          weekConversations: claudeRow?.conversations ?? 0,
          note: claudeRow?.note ?? '',
        },
      },
    });
  } catch {
    res.status(500).json({ success: false, message: '無法取得使用量' });
  }
});

// GET /api/usage/claude/live — 即時從 claude.ai 抓取用量
router.get('/claude/live', async (_req: Request, res: Response) => {
  try {
    const data = await fetchClaudeUsage();
    res.json({ success: true, data });
  } catch (err: any) {
    const isExpired = err.message === 'SESSION_EXPIRED';
    res.status(isExpired ? 401 : 500).json({
      success: false,
      message: isExpired ? 'Session 已過期，請重新設定 CLAUDE_SESSION_KEY' : err.message,
    });
  }
});

// PATCH /api/usage/claude — 手動更新 Claude 使用量
router.patch('/claude', (req: Request, res: Response) => {
  try {
    const ws = weekStart();
    const { conversations, note } = req.body;
    db.prepare(`
      INSERT INTO claude_usage_manual (week_start, conversations, note)
      VALUES (?, ?, ?)
      ON CONFLICT(week_start) DO UPDATE SET
        conversations = excluded.conversations,
        note = excluded.note
    `).run(ws, conversations ?? 0, note ?? '');
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: '無法更新' });
  }
});

export default router;
