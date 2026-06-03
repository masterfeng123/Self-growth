import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { getLevelInfo } from '../modules/gamification';

const router = Router();

function calcProgressFromMilestones(projectId: string): number {
  const rows = db.prepare('SELECT done FROM project_milestones WHERE project_id = ?').all(projectId) as any[];
  if (rows.length === 0) return -1;
  const done = rows.filter(r => r.done).length;
  return Math.round((done / rows.length) * 100);
}

// GET /api/projects
router.get('/', (_req: Request, res: Response) => {
  try {
    const projects = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id) AS milestone_total,
        (SELECT COUNT(*) FROM project_milestones WHERE project_id = p.id AND done = 1) AS milestone_done
      FROM projects p
      ORDER BY p.created_at DESC
    `).all();
    res.json({ success: true, data: projects });
  } catch {
    res.status(500).json({ success: false, message: '無法取得專案列表' });
  }
});

// POST /api/projects
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, description, target_date, start_date } = req.body;
    if (!name) return res.status(400).json({ success: false, message: '專案名稱為必填' });
    const id = uuidv4();
    db.prepare(`
      INSERT INTO projects (id, name, description, target_date, start_date)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, description || null, target_date || null, start_date || new Date().toLocaleDateString('sv'));
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: project });
  } catch {
    res.status(500).json({ success: false, message: '無法建立專案' });
  }
});

// GET /api/projects/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: '專案不存在' });
    const milestones = db.prepare(
      'SELECT * FROM project_milestones WHERE project_id = ? ORDER BY created_at ASC'
    ).all(req.params.id);
    const logs = db.prepare(
      'SELECT * FROM project_logs WHERE project_id = ? ORDER BY logged_at DESC'
    ).all(req.params.id);
    const debugLogs = db.prepare(
      "SELECT id, title, severity, created_at FROM debug_logs WHERE project_id = ? ORDER BY created_at DESC"
    ).all(req.params.id);
    res.json({ success: true, data: { ...project as object, milestones, logs, debugLogs } });
  } catch {
    res.status(500).json({ success: false, message: '無法取得專案' });
  }
});

// PATCH /api/projects/:id
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!existing) return res.status(404).json({ success: false, message: '專案不存在' });
    const { name, description, status, target_date, progress } = req.body;
    db.prepare(`
      UPDATE projects SET
        name = ?, description = ?, status = ?, target_date = ?, progress = ?,
        updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      name ?? existing.name,
      description !== undefined ? description : existing.description,
      status ?? existing.status,
      target_date !== undefined ? target_date : existing.target_date,
      progress !== undefined ? progress : existing.progress,
      req.params.id
    );
    const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: '無法更新專案' });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '專案不存在' });
    res.json({ success: true, message: '專案已刪除' });
  } catch {
    res.status(500).json({ success: false, message: '無法刪除專案' });
  }
});

// POST /api/projects/:id/milestones
router.post('/:id/milestones', (req: Request, res: Response) => {
  try {
    const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: '專案不存在' });
    const { title, due_date } = req.body;
    if (!title) return res.status(400).json({ success: false, message: '里程碑標題為必填' });
    const id = uuidv4();
    db.prepare('INSERT INTO project_milestones (id, project_id, title, due_date) VALUES (?, ?, ?, ?)')
      .run(id, req.params.id, title, due_date || null);
    const milestone = db.prepare('SELECT * FROM project_milestones WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: milestone });
  } catch {
    res.status(500).json({ success: false, message: '無法新增里程碑' });
  }
});

// PATCH /api/projects/milestones/:mid — toggle done, auto-update project progress
router.patch('/milestones/:mid', (req: Request, res: Response) => {
  try {
    const milestone = db.prepare('SELECT * FROM project_milestones WHERE id = ?').get(req.params.mid) as any;
    if (!milestone) return res.status(404).json({ success: false, message: '里程碑不存在' });
    const newDone = req.body.done !== undefined ? (req.body.done ? 1 : 0) : (milestone.done ? 0 : 1);
    db.prepare('UPDATE project_milestones SET done = ? WHERE id = ?').run(newDone, req.params.mid);

    const autoProgress = calcProgressFromMilestones(milestone.project_id);
    if (autoProgress >= 0) {
      const finalStatus = autoProgress === 100 ? 'done' : 'active';
      db.prepare(`UPDATE projects SET progress = ?, status = ?, updated_at = datetime('now','localtime') WHERE id = ?`)
        .run(autoProgress, finalStatus, milestone.project_id);

      if (autoProgress === 100) {
        const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;
        const xp = 100;
        db.prepare('UPDATE user_profile SET total_xp = total_xp + ? WHERE id = 1').run(xp);
        const newXp = profile.total_xp + xp;
        const newLevel = getLevelInfo(newXp);
        return res.json({ success: true, data: { projectCompleted: true, xpEarned: xp, levelInfo: newLevel } });
      }
    }

    res.json({ success: true, data: { projectCompleted: false, autoProgress } });
  } catch {
    res.status(500).json({ success: false, message: '無法更新里程碑' });
  }
});

// DELETE /api/projects/milestones/:mid
router.delete('/milestones/:mid', (req: Request, res: Response) => {
  try {
    const result = db.prepare('DELETE FROM project_milestones WHERE id = ?').run(req.params.mid);
    if (result.changes === 0) return res.status(404).json({ success: false, message: '里程碑不存在' });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: '無法刪除里程碑' });
  }
});

// POST /api/projects/:id/logs
router.post('/:id/logs', (req: Request, res: Response) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id) as any;
    if (!project) return res.status(404).json({ success: false, message: '專案不存在' });
    const { note, progress_snapshot } = req.body;
    if (!note) return res.status(400).json({ success: false, message: '記錄內容為必填' });
    const id = uuidv4();
    const snap = progress_snapshot !== undefined ? progress_snapshot : project.progress;
    db.prepare('INSERT INTO project_logs (id, project_id, note, progress_snapshot) VALUES (?, ?, ?, ?)')
      .run(id, req.params.id, note, snap);

    if (progress_snapshot !== undefined) {
      db.prepare(`UPDATE projects SET progress = ?, updated_at = datetime('now','localtime') WHERE id = ?`)
        .run(progress_snapshot, req.params.id);
    }

    const log = db.prepare('SELECT * FROM project_logs WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: log });
  } catch {
    res.status(500).json({ success: false, message: '無法新增記錄' });
  }
});

export default router;
