import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';

const router = Router();

// GET /api/calendar?year=2026&month=6
router.get('/', (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;
    let events;
    if (year && month) {
      const y = String(year);
      const m = String(parseInt(month as string)).padStart(2, '0');
      events = db.prepare(
        "SELECT * FROM calendar_events WHERE substr(date,1,7) = ? ORDER BY date, time"
      ).all(`${y}-${m}`);
    } else {
      events = db.prepare('SELECT * FROM calendar_events ORDER BY date, time').all();
    }
    res.json({ success: true, data: events });
  } catch {
    res.status(500).json({ success: false, message: '無法取得行事曆' });
  }
});

// GET /api/calendar/upcoming?days=7
router.get('/upcoming', (req: Request, res: Response) => {
  try {
    const days = Math.min(parseInt(req.query.days as string) || 7, 30);
    const events = db.prepare(
      `SELECT * FROM calendar_events
       WHERE date >= date('now','localtime')
         AND date <= date('now','localtime','+${days} days')
       ORDER BY date, time`
    ).all();

    const goals = db.prepare(
      `SELECT id, title, target_date, horizon FROM goals
       WHERE status != 'completed' AND target_date IS NOT NULL
         AND target_date >= date('now','localtime')
         AND target_date <= date('now','localtime','+${days} days')
       ORDER BY target_date`
    ).all();

    const milestones = db.prepare(
      `SELECT pm.id, pm.title, pm.due_date, p.name as project_name
       FROM project_milestones pm
       JOIN projects p ON p.id = pm.project_id
       WHERE pm.done = 0 AND pm.due_date IS NOT NULL
         AND pm.due_date >= date('now','localtime')
         AND pm.due_date <= date('now','localtime','+${days} days')
       ORDER BY pm.due_date`
    ).all();

    res.json({ success: true, data: { events, goals, milestones } });
  } catch {
    res.status(500).json({ success: false, message: '無法取得即將到來事項' });
  }
});

// POST /api/calendar
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, date, time, end_date, end_time, all_day, category, color } = req.body;
    if (!title || !date) return res.status(400).json({ success: false, message: '標題和日期為必填' });
    const id = uuidv4();
    db.prepare(
      `INSERT INTO calendar_events (id,title,description,date,time,end_date,end_time,all_day,category,color)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    ).run(id, title, description || null, date, time || null, end_date || null, end_time || null,
      all_day === false || all_day === 0 ? 0 : 1, category || 'general', color || '#2270c9');
    const event = db.prepare('SELECT * FROM calendar_events WHERE id=?').get(id);
    res.json({ success: true, data: event });
  } catch {
    res.status(500).json({ success: false, message: '新增失敗' });
  }
});

// PUT /api/calendar/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, description, date, time, end_date, end_time, all_day, category, color } = req.body;
    db.prepare(
      `UPDATE calendar_events SET title=?,description=?,date=?,time=?,end_date=?,end_time=?,all_day=?,category=?,color=? WHERE id=?`
    ).run(title, description || null, date, time || null, end_date || null, end_time || null,
      all_day === false || all_day === 0 ? 0 : 1, category || 'general', color || '#2270c9', req.params.id);
    const event = db.prepare('SELECT * FROM calendar_events WHERE id=?').get(req.params.id);
    res.json({ success: true, data: event });
  } catch {
    res.status(500).json({ success: false, message: '更新失敗' });
  }
});

// DELETE /api/calendar/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    db.prepare('DELETE FROM calendar_events WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: '刪除失敗' });
  }
});

export default router;
