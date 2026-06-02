import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { CHALLENGES, Challenge } from '../data/challenges';
import { getLevelInfo, checkAchievements, ACHIEVEMENTS } from '../modules/gamification';
import { QUOTES } from '../data/quotes';

const router = Router();

export function getTodayChallenge(): Challenge {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return CHALLENGES[daysSinceEpoch % CHALLENGES.length];
}

export function getUserProfile(): Record<string, unknown> {
  return db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as Record<string, unknown>;
}

// GET /api/daily
router.get('/', (_req: Request, res: Response) => {
  try {
    const challenge = getTodayChallenge();
    const todayLog = db.prepare(
      "SELECT * FROM challenge_logs WHERE date(completed_at) = date('now', 'localtime')"
    ).get();

    const profile = getUserProfile() as any;
    const levelInfo = getLevelInfo(profile.total_xp);
    const achievements: string[] = JSON.parse(profile.achievements);
    const achievementDetails = ACHIEVEMENTS.filter(a => achievements.includes(a.id));

    const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const quote = QUOTES[day % QUOTES.length];

    res.json({
      success: true,
      data: {
        challenge,
        todayCompleted: !!todayLog,
        todayLog: todayLog || null,
        profile: { ...profile, achievements: achievementDetails, levelInfo },
        quote,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得每日挑戰' });
  }
});

// POST /api/daily/checkin
router.post('/checkin', (req: Request, res: Response) => {
  try {
    const { mood, reflection } = req.body;
    const challenge = getTodayChallenge();

    const existing = db.prepare(
      "SELECT * FROM challenge_logs WHERE date(completed_at) = date('now', 'localtime')"
    ).get();
    if (existing) {
      return res.status(409).json({ success: false, message: '今日已打卡！' });
    }

    const profile = getUserProfile() as any;

    // 計算連勝天數
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('sv'); // YYYY-MM-DD
    const newStreak = profile.last_checkin === yesterdayStr ? profile.current_streak + 1 : 1;

    // 計算 XP
    let xpEarned: number = challenge.xpReward;
    if (newStreak > 0 && newStreak % 7 === 0)  xpEarned += 50;
    if (newStreak > 0 && newStreak % 30 === 0) xpEarned += 100;
    if (mood === 5) xpEarned += 10;

    // 寫入打卡記錄
    db.prepare(
      'INSERT INTO challenge_logs (id, challenge_id, mood, reflection, xp_earned) VALUES (?, ?, ?, ?, ?)'
    ).run(uuidv4(), challenge.id, mood || 3, reflection || null, xpEarned);

    const newXp = profile.total_xp + xpEarned;
    const newLongest = Math.max(newStreak, profile.longest_streak);
    const today = new Date().toLocaleDateString('sv');

    // 統計各類別完成數（含本次）
    const rows = db.prepare('SELECT challenge_id FROM challenge_logs').all() as any[];
    const categoryCounts: Record<string, number> = {};
    rows.forEach(row => {
      const ch = CHALLENGES.find(c => c.id === row.challenge_id);
      if (ch) categoryCounts[ch.category] = (categoryCounts[ch.category] || 0) + 1;
    });

    const journalCount   = (db.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any).c as number;
    const completedGoals = (db.prepare("SELECT COUNT(*) as c FROM goals WHERE status='completed'").get() as any).c as number;
    const habitLogCount  = (db.prepare('SELECT COUNT(*) as c FROM habit_logs').get() as any).c as number;

    const currentAchievements: string[] = JSON.parse(profile.achievements);
    const newAchievements = checkAchievements(
      currentAchievements, newStreak, newXp, categoryCounts,
      { totalCompleted: rows.length, journalCount, completedGoals, habitLogCount, longestStreak: newLongest }
    );
    const updatedAchievements = [...new Set([...currentAchievements, ...newAchievements])];

    const oldLevel = getLevelInfo(profile.total_xp).level;

    db.prepare(
      'UPDATE user_profile SET total_xp=?, current_streak=?, longest_streak=?, last_checkin=?, achievements=? WHERE id=1'
    ).run(newXp, newStreak, newLongest, today, JSON.stringify(updatedAchievements));

    const newLevelInfo = getLevelInfo(newXp);

    res.json({
      success: true,
      data: {
        xpEarned,
        newStreak,
        newTotalXp: newXp,
        levelInfo: newLevelInfo,
        leveledUp: newLevelInfo.level > oldLevel,
        newAchievements: newAchievements
          .map(id => ACHIEVEMENTS.find(a => a.id === id))
          .filter(Boolean),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '打卡失敗' });
  }
});

// GET /api/daily/history
router.get('/history', (_req: Request, res: Response) => {
  try {
    const logs = db.prepare(
      'SELECT * FROM challenge_logs ORDER BY completed_at DESC LIMIT 30'
    ).all() as any[];

    const enriched = logs.map(log => ({
      ...log,
      challenge: CHALLENGES.find(c => c.id === log.challenge_id) || null,
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得打卡歷史' });
  }
});

export default router;
