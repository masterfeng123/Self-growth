import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

const XP_BY_DIFFICULTY: Record<number, number> = { 1: 20, 2: 40, 3: 70 };

// 今日額外成就
router.get('/today', (_req: Request, res: Response) => {
  try {
    const logs = db.prepare(
      "SELECT * FROM extra_logs WHERE date(completed_at) = date('now', 'localtime') ORDER BY completed_at DESC"
    ).all();
    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: '無法取得今日成就' });
  }
});

// 最近 30 天
router.get('/recent', (_req: Request, res: Response) => {
  try {
    const logs = db.prepare(
      "SELECT * FROM extra_logs WHERE date(completed_at) >= date('now', 'localtime', '-30 days') ORDER BY completed_at DESC"
    ).all();
    res.json({ success: true, data: logs });
  } catch {
    res.status(500).json({ success: false, message: '無法取得成就記錄' });
  }
});

// 新增額外成就
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, category, difficulty, note } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: '請填寫成就名稱' });
    }

    const diff = Math.min(3, Math.max(1, parseInt(difficulty) || 1));
    const xp = XP_BY_DIFFICULTY[diff];
    const id = uuidv4();

    db.prepare(
      'INSERT INTO extra_logs (id, title, category, difficulty, xp_earned, note) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(id, title.trim(), category || 'general', diff, xp, note?.trim() || null);

    // 將 XP 加入使用者總計
    db.prepare('UPDATE user_profile SET total_xp = total_xp + ? WHERE id = 1').run(xp);

    const log = db.prepare('SELECT * FROM extra_logs WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: log, xpEarned: xp });
  } catch {
    res.status(500).json({ success: false, message: '無法記錄成就' });
  }
});

// 刪除（退還 XP）
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const log = db.prepare('SELECT * FROM extra_logs WHERE id = ?').get(req.params.id) as any;
    if (!log) return res.status(404).json({ success: false, message: '記錄不存在' });

    db.prepare('DELETE FROM extra_logs WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE user_profile SET total_xp = MAX(0, total_xp - ?) WHERE id = 1').run(log.xp_earned);

    res.json({ success: true, message: '已刪除', xpRefunded: log.xp_earned });
  } catch {
    res.status(500).json({ success: false, message: '無法刪除記錄' });
  }
});

export default router;
