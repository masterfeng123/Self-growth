import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { getLevelInfo } from '../modules/gamification';
import { appToday } from '../utils/date';

const router = Router();

const HORIZON_ORDER: Record<string, number> = {
  '10yr': 0, '5yr': 1, '1yr': 2, '1mo': 3, '1wk': 4, 'mit': 5,
};

// GET /api/goals — 全部目標（含父層標題）
router.get('/', (_req: Request, res: Response) => {
  try {
    const goals = db.prepare(`
      SELECT g.*, p.title AS parent_title, p.horizon AS parent_horizon
      FROM goals g
      LEFT JOIN goals p ON g.parent_id = p.id
      ORDER BY g.created_at DESC
    `).all();

    const sorted = (goals as any[]).sort((a, b) => {
      const ha = HORIZON_ORDER[a.horizon] ?? 2;
      const hb = HORIZON_ORDER[b.horizon] ?? 2;
      if (ha !== hb) return ha - hb;
      return (a.priority ?? 2) - (b.priority ?? 2);
    });

    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得目標列表' });
  }
});

// GET /api/goals/mit — 今日 MIT
router.get('/mit', (_req: Request, res: Response) => {
  try {
    const today = appToday();
    const mits = db.prepare(`
      SELECT g.*, p.title AS parent_title, p.horizon AS parent_horizon
      FROM goals g
      LEFT JOIN goals p ON g.parent_id = p.id
      WHERE g.horizon = 'mit' AND g.mit_date = ?
      ORDER BY g.status ASC, g.created_at ASC
    `).all(today);
    res.json({ success: true, data: mits });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得今日 MIT' });
  }
});

// GET /api/goals/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: '目標不存在' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得目標' });
  }
});

// POST /api/goals — 建立目標
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, category, priority, target_date, horizon, parent_id } = req.body;
    if (!title) return res.status(400).json({ success: false, message: '標題為必填欄位' });

    const id = uuidv4();
    const h = horizon || '1yr';
    const mitDate = h === 'mit' ? appToday() : null;

    db.prepare(`
      INSERT INTO goals
        (id, title, description, category, priority, target_date, horizon, parent_id, mit_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, description || null, category || 'general',
      priority || 2, target_date || null,
      h, parent_id || null, mitDate
    );

    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法建立目標' });
  }
});

// PUT /api/goals/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, description, category, status, priority, target_date, progress, horizon, parent_id } = req.body;
    const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, message: '目標不存在' });

    db.prepare(`
      UPDATE goals SET
        title=?, description=?, category=?, status=?, priority=?,
        target_date=?, progress=?, horizon=?, parent_id=?,
        updated_at=datetime('now')
      WHERE id=?
    `).run(
      title ?? existing.title,
      description ?? existing.description,
      category ?? existing.category,
      status ?? existing.status,
      priority ?? existing.priority,
      target_date ?? existing.target_date,
      progress ?? existing.progress,
      horizon ?? existing.horizon,
      parent_id !== undefined ? (parent_id || null) : existing.parent_id,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法更新目標' });
  }
});

// POST /api/goals/:id/done — 完成 MIT，領取 XP
router.post('/:id/done', (req: Request, res: Response) => {
  try {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(req.params.id) as any;
    if (!goal) return res.status(404).json({ success: false, message: '目標不存在' });
    if (goal.status === 'completed') return res.status(409).json({ success: false, message: '已完成' });

    db.prepare(
      "UPDATE goals SET status='completed', progress=100, updated_at=datetime('now') WHERE id=?"
    ).run(req.params.id);

    const xpEarned = 50;
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;
    db.prepare('UPDATE user_profile SET total_xp = total_xp + ? WHERE id = 1').run(xpEarned);

    const newXp = profile.total_xp + xpEarned;
    const oldLevel = getLevelInfo(profile.total_xp).level;
    const newLevelInfo = getLevelInfo(newXp);

    res.json({
      success: true,
      data: {
        xpEarned,
        newTotalXp: newXp,
        levelInfo: newLevelInfo,
        leveledUp: newLevelInfo.level > oldLevel,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法完成 MIT' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM goals WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '目標不存在' });
    res.json({ success: true, message: '目標已刪除' });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法刪除目標' });
  }
});

export default router;
