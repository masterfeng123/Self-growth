import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const entries = db.prepare('SELECT * FROM journal_entries ORDER BY created_at DESC').all();
    res.json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得日記列表' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: '日記不存在' });
    res.json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得日記' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { title, content, mood, tags } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: '標題與內容為必填欄位' });
    const id = uuidv4();
    db.prepare(
      'INSERT INTO journal_entries (id, title, content, mood, tags) VALUES (?, ?, ?, ?, ?)'
    ).run(id, title, content, mood || 3, tags ? JSON.stringify(tags) : null);
    const entry = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法建立日記' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, content, mood, tags } = req.body;
    const existing = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, message: '日記不存在' });
    db.prepare(
      `UPDATE journal_entries SET title=?, content=?, mood=?, tags=?, updated_at=datetime('now') WHERE id=?`
    ).run(
      title ?? existing.title,
      content ?? existing.content,
      mood ?? existing.mood,
      tags ? JSON.stringify(tags) : existing.tags,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM journal_entries WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法更新日記' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM journal_entries WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '日記不存在' });
    res.json({ success: true, message: '日記已刪除' });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法刪除日記' });
  }
});

export default router;
