import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const habits = db.prepare('SELECT * FROM habits WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得習慣列表' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, frequency, category } = req.body;
    if (!title) return res.status(400).json({ success: false, message: '標題為必填欄位' });
    const id = uuidv4();
    db.prepare(
      'INSERT INTO habits (id, title, description, frequency, category) VALUES (?, ?, ?, ?, ?)'
    ).run(id, title, description || null, frequency || 'daily', category || 'general');
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法建立習慣' });
  }
});

router.post('/:id/log', (req: Request, res: Response) => {
  try {
    const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
    if (!habit) return res.status(404).json({ success: false, message: '習慣不存在' });

    const today = new Date().toISOString().slice(0, 10);
    const alreadyLogged = db.prepare(
      "SELECT * FROM habit_logs WHERE habit_id = ? AND date(completed_at) = ?"
    ).get(req.params.id, today);
    if (alreadyLogged) return res.status(409).json({ success: false, message: '今日已打卡' });

    const logId = uuidv4();
    db.prepare('INSERT INTO habit_logs (id, habit_id, note) VALUES (?, ?, ?)').run(
      logId, req.params.id, req.body.note || null
    );
    db.prepare("UPDATE habits SET streak = streak + 1, updated_at = datetime('now') WHERE id = ?").run(req.params.id);

    res.status(201).json({ success: true, message: '打卡成功！' });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法記錄習慣' });
  }
});

router.get('/:id/logs', (req: Request, res: Response) => {
  try {
    const logs = db.prepare(
      'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY completed_at DESC LIMIT 30'
    ).all(req.params.id);
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得打卡記錄' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare("UPDATE habits SET is_active = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '習慣不存在' });
    res.json({ success: true, message: '習慣已停用' });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法刪除習慣' });
  }
});

export default router;
