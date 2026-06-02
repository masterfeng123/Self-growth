import { Router, Request, Response } from 'express';
import db from '../db/database';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const totalGoals = (db.prepare('SELECT COUNT(*) as c FROM goals').get() as any).c;
    const completedGoals = (db.prepare("SELECT COUNT(*) as c FROM goals WHERE status='completed'").get() as any).c;
    const activeHabits = (db.prepare('SELECT COUNT(*) as c FROM habits WHERE is_active=1').get() as any).c;
    const todayLogs = (db.prepare("SELECT COUNT(*) as c FROM habit_logs WHERE date(completed_at)=date('now')").get() as any).c;
    const totalJournals = (db.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any).c;
    const avgMood = (db.prepare('SELECT AVG(mood) as m FROM journal_entries').get() as any).m;
    const topStreakHabit = db.prepare('SELECT title, streak FROM habits WHERE is_active=1 ORDER BY streak DESC LIMIT 1').get();

    res.json({
      success: true,
      data: {
        goals: { total: totalGoals, completed: completedGoals },
        habits: { active: activeHabits, todayCompleted: todayLogs },
        journal: { total: totalJournals, avgMood: avgMood ? parseFloat(avgMood.toFixed(1)) : null },
        topStreak: topStreakHabit || null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得統計資料' });
  }
});

export default router;
