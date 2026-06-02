import { Router, Request, Response } from 'express';
import db from '../db/database';
import { ACHIEVEMENTS } from '../modules/gamification';
import { CHALLENGES } from '../data/challenges';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;
    const unlocked: string[] = JSON.parse(profile.achievements || '[]');

    const streak        = profile.current_streak as number;
    const longestStreak = profile.longest_streak as number;
    const totalXp       = profile.total_xp as number;

    const logs = db.prepare('SELECT challenge_id FROM challenge_logs').all() as any[];
    const categoryCounts: Record<string, number> = {};
    logs.forEach(row => {
      const ch = CHALLENGES.find(c => c.id === row.challenge_id);
      if (ch) categoryCounts[ch.category] = (categoryCounts[ch.category] || 0) + 1;
    });
    const totalCompleted = logs.length;

    const journalCount   = (db.prepare('SELECT COUNT(*) as c FROM journal_entries').get() as any).c as number;
    const completedGoals = (db.prepare("SELECT COUNT(*) as c FROM goals WHERE status='completed'").get() as any).c as number;
    const habitLogCount  = (db.prepare('SELECT COUNT(*) as c FROM habit_logs').get() as any).c as number;

    // 為每個成就計算進度
    const achievementsWithStatus = ACHIEVEMENTS.map(a => {
      const isUnlocked = unlocked.includes(a.id);
      let progress = 0;
      let target = 1;
      let hint = '';

      switch (a.id) {
        case 'first-step':
          progress = Math.min(totalCompleted, 1); target = 1;
          hint = `已完成 ${totalCompleted} / 1 個挑戰`; break;
        case 'streak-3':
          progress = Math.min(streak, 3); target = 3;
          hint = `當前連勝 ${streak} / 3 天`; break;
        case 'streak-7':
          progress = Math.min(streak, 7); target = 7;
          hint = `當前連勝 ${streak} / 7 天`; break;
        case 'streak-14':
          progress = Math.min(streak, 14); target = 14;
          hint = `當前連勝 ${streak} / 14 天`; break;
        case 'streak-30':
          progress = Math.min(streak, 30); target = 30;
          hint = `當前連勝 ${streak} / 30 天`; break;
        case 'streak-100':
          progress = Math.min(streak, 100); target = 100;
          hint = `當前連勝 ${streak} / 100 天`; break;
        case 'streak-200':
          progress = Math.min(streak, 200); target = 200;
          hint = `當前連勝 ${streak} / 200 天`; break;
        case 'streak-365':
          progress = Math.min(streak, 365); target = 365;
          hint = `當前連勝 ${streak} / 365 天`; break;
        case 'level-5': case 'level-10': case 'level-20':
        case 'level-30': case 'level-40': case 'level-50': {
          const lvl = getLevelFromXp(totalXp);
          target = parseInt(a.id.split('-')[1]);
          progress = Math.min(lvl, target);
          hint = `當前等級 ${lvl} / ${target}`; break;
        }
        case 'challenges-10':  progress = Math.min(totalCompleted, 10);  target = 10;  hint = `累計挑戰 ${totalCompleted} / 10`; break;
        case 'challenges-50':  progress = Math.min(totalCompleted, 50);  target = 50;  hint = `累計挑戰 ${totalCompleted} / 50`; break;
        case 'challenges-100': progress = Math.min(totalCompleted, 100); target = 100; hint = `累計挑戰 ${totalCompleted} / 100`; break;
        case 'challenges-500': progress = Math.min(totalCompleted, 500); target = 500; hint = `累計挑戰 ${totalCompleted} / 500`; break;
        case 'mind-x3':
          progress = Math.min(categoryCounts['mind'] || 0, 3); target = 3;
          hint = `心智挑戰 ${categoryCounts['mind'] || 0} / 3`; break;
        case 'body-x3':
          progress = Math.min(categoryCounts['body'] || 0, 3); target = 3;
          hint = `身體挑戰 ${categoryCounts['body'] || 0} / 3`; break;
        case 'skills-x3':
          progress = Math.min(categoryCounts['skills'] || 0, 3); target = 3;
          hint = `技能挑戰 ${categoryCounts['skills'] || 0} / 3`; break;
        case 'social-x3':
          progress = Math.min(categoryCounts['social'] || 0, 3); target = 3;
          hint = `社交挑戰 ${categoryCounts['social'] || 0} / 3`; break;
        case 'creativity-x3':
          progress = Math.min(categoryCounts['creativity'] || 0, 3); target = 3;
          hint = `創意挑戰 ${categoryCounts['creativity'] || 0} / 3`; break;
        case 'reflection-x3':
          progress = Math.min(categoryCounts['reflection'] || 0, 3); target = 3;
          hint = `內省挑戰 ${categoryCounts['reflection'] || 0} / 3`; break;
        case 'all-categories': {
          const cats = ['mind','body','skills','social','creativity','reflection'];
          const done = cats.filter(c => (categoryCounts[c] || 0) >= 1).length;
          progress = done; target = 6;
          hint = `已覆蓋 ${done} / 6 個類別`; break;
        }
        case 'mind-x10':        progress = Math.min(categoryCounts['mind'] || 0, 10);        target = 10; hint = `心智挑戰 ${categoryCounts['mind'] || 0} / 10`; break;
        case 'body-x10':        progress = Math.min(categoryCounts['body'] || 0, 10);        target = 10; hint = `身體挑戰 ${categoryCounts['body'] || 0} / 10`; break;
        case 'skills-x10':      progress = Math.min(categoryCounts['skills'] || 0, 10);      target = 10; hint = `技能挑戰 ${categoryCounts['skills'] || 0} / 10`; break;
        case 'social-x10':      progress = Math.min(categoryCounts['social'] || 0, 10);      target = 10; hint = `社交挑戰 ${categoryCounts['social'] || 0} / 10`; break;
        case 'creativity-x10':  progress = Math.min(categoryCounts['creativity'] || 0, 10);  target = 10; hint = `創意挑戰 ${categoryCounts['creativity'] || 0} / 10`; break;
        case 'reflection-x10':  progress = Math.min(categoryCounts['reflection'] || 0, 10);  target = 10; hint = `內省挑戰 ${categoryCounts['reflection'] || 0} / 10`; break;
        case 'all-x10': {
          const cats = ['mind','body','skills','social','creativity','reflection'];
          const done = cats.filter(c => (categoryCounts[c] || 0) >= 10).length;
          progress = done; target = 6;
          hint = `各類別達10個：${done} / 6`; break;
        }
        case 'journal-first': progress = Math.min(journalCount, 1);   target = 1;   hint = `日誌篇數 ${journalCount} / 1`; break;
        case 'journal-30':    progress = Math.min(journalCount, 30);  target = 30;  hint = `日誌篇數 ${journalCount} / 30`; break;
        case 'journal-100':   progress = Math.min(journalCount, 100); target = 100; hint = `日誌篇數 ${journalCount} / 100`; break;
        case 'goal-first':    progress = Math.min(completedGoals, 1);  target = 1;  hint = `已完成目標 ${completedGoals} / 1`; break;
        case 'goal-10':       progress = Math.min(completedGoals, 10); target = 10; hint = `已完成目標 ${completedGoals} / 10`; break;
        case 'habit-100':     progress = Math.min(habitLogCount, 100); target = 100; hint = `習慣打卡 ${habitLogCount} / 100`; break;
        case 'longest-30':    progress = Math.min(longestStreak, 30);  target = 30;  hint = `最長連勝 ${longestStreak} / 30 天`; break;
      }

      return {
        ...a,
        unlocked: isUnlocked,
        progress: isUnlocked ? target : progress,
        target,
        percent: isUnlocked ? 100 : Math.floor((progress / target) * 100),
        hint: isUnlocked ? '已解鎖' : hint,
      };
    });

    const unlockedCount = achievementsWithStatus.filter(a => a.unlocked).length;

    res.json({
      success: true,
      data: {
        achievements: achievementsWithStatus,
        totalCount: ACHIEVEMENTS.length,
        unlockedCount,
        profile: {
          streak: profile.current_streak,
          longestStreak: profile.longest_streak,
          totalXp: profile.total_xp,
          totalCompleted,
          journalCount,
          completedGoals,
          habitLogCount,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: '無法取得成就資料' });
  }
});

function getLevelFromXp(xp: number): number {
  let level = 1;
  let used = 0;
  while (true) {
    const needed = 100 + (level - 1) * 50;
    if (used + needed > xp) return level;
    used += needed;
    level++;
  }
}

export default router;
