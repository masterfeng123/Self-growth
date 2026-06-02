import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// GET /api/debug-logs?q=keyword&tag=xxx&severity=error
router.get('/', (req: Request, res: Response) => {
  try {
    const { q, tag, severity } = req.query as Record<string, string>;
    let sql = 'SELECT * FROM debug_logs WHERE 1=1';
    const params: string[] = [];

    if (q) {
      sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like);
    }
    if (tag) {
      sql += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    if (severity) {
      sql += ' AND severity = ?';
      params.push(severity);
    }
    sql += ' ORDER BY created_at DESC';

    const rows = db.prepare(sql).all(...params);
    res.json({ success: true, data: rows });
  } catch {
    res.status(500).json({ success: false, message: '無法取得 debug log 列表' });
  }
});

// POST /api/debug-logs
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, content, tags, severity, project_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: '標題為必填' });
    const id = uuidv4();
    db.prepare(`
      INSERT INTO debug_logs (id, title, content, tags, severity, project_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title, content || '', tags || '', severity || 'info', project_id || null);
    const row = db.prepare('SELECT * FROM debug_logs WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: row });
  } catch {
    res.status(500).json({ success: false, message: '無法建立 debug log' });
  }
});

// GET /api/debug-logs/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM debug_logs WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ success: false, message: '找不到此 log' });
    res.json({ success: true, data: row });
  } catch {
    res.status(500).json({ success: false, message: '無法取得 debug log' });
  }
});

// PATCH /api/debug-logs/:id
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM debug_logs WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, message: '找不到此 log' });
    const { title, content, tags, severity, project_id } = req.body;
    db.prepare(`
      UPDATE debug_logs SET
        title = ?, content = ?, tags = ?, severity = ?, project_id = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      title ?? existing.title,
      content !== undefined ? content : existing.content,
      tags !== undefined ? tags : existing.tags,
      severity ?? existing.severity,
      project_id !== undefined ? (project_id || null) : existing.project_id,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM debug_logs WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: '無法更新 debug log' });
  }
});

// DELETE /api/debug-logs/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM debug_logs WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '找不到此 log' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: '無法刪除 debug log' });
  }
});

// GET /api/debug-logs/:id/export — 純文字 Markdown 匯出
router.get('/:id/export', (req: Request, res: Response) => {
  try {
    const row = db.prepare('SELECT * FROM debug_logs WHERE id = ?').get(req.params.id) as any;
    if (!row) return res.status(404).json({ success: false, message: '找不到此 log' });
    const text = [
      `# ${row.title}`,
      ``,
      `- **日期**：${row.created_at.slice(0, 16)}`,
      `- **嚴重度**：${row.severity}`,
      row.tags ? `- **標籤**：${row.tags}` : null,
      ``,
      `---`,
      ``,
      row.content,
    ].filter(l => l !== null).join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(text);
  } catch {
    res.status(500).json({ success: false, message: '匯出失敗' });
  }
});

export default router;
