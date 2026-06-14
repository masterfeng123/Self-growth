import { Router, Request, Response } from 'express';
import db from '../db/database';
import { SQL_TODAY } from '../utils/date';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const totalGoals = (db.prepare('SELECT COUNT(*) as c FROM goals').get() as any).c;
    const completedGoals = (db.prepare("SELECT COUNT(*) as c FROM goals WHERE status='completed'").get() as any).c;
    const activeHabits = (db.prepare('SELECT COUNT(*) as c FROM habits WHERE is_active=1').get() as any).c;
    const todayLogs = (db.prepare(`SELECT COUNT(*) as c FROM habit_logs WHERE date(completed_at)=${SQL_TODAY}`).get() as any).c;
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

// ── 週摘要（過去 7 天）──
let _summaryCache: { text: string; stats: any; generatedAt: number } | null = null;
const SUMMARY_TTL = 60 * 60 * 1000; // 1 小時

function getGeminiKey(): string | null {
  return ([
    process.env.GEMINI_API_KEY, process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2, process.env.GEMINI_KEY_3, process.env.GEMINI_KEY_4,
  ].filter(Boolean) as string[])[0] ?? null;
}

function buildFallbackSummary(habitLogs: any[], journals: any[], extras: any[], challenges: any, totalXP: number): string {
  const parts: string[] = [];
  if (habitLogs.length > 0) parts.push(`完成了 ${habitLogs.length} 種習慣打卡`);
  if (journals.length > 0) parts.push(`寫了 ${journals.length} 篇日記`);
  if (extras.length > 0) parts.push(`達成 ${extras.length} 個額外成就`);
  if (challenges?.cnt > 0) parts.push(`完成了 ${challenges.cnt} 次每日挑戰`);
  return parts.length > 0
    ? `本週你${parts.join('、')}，共獲得 ${totalXP} XP。繼續保持！`
    : '本週尚無活動記錄，來開始你的第一步吧！';
}

router.get('/weekly-summary', async (_req: Request, res: Response) => {
  try {
    const force = _req.query.force === '1';
    if (!force && _summaryCache && Date.now() - _summaryCache.generatedAt < SUMMARY_TTL) {
      return res.json({ success: true, ..._summaryCache, cached: true });
    }

    // 過去 7 天（含今日）
    const since = new Date();
    since.setDate(since.getDate() - 6);
    since.setHours(0, 0, 0, 0);
    const sinceStr = since.toLocaleDateString('sv'); // 'YYYY-MM-DD'

    const habitLogs = db.prepare(`
      SELECT h.title, COUNT(*) as cnt
      FROM habit_logs hl JOIN habits h ON hl.habit_id = h.id
      WHERE date(hl.completed_at, 'localtime') >= ?
      GROUP BY h.id, h.title ORDER BY cnt DESC
    `).all(sinceStr) as any[];

    const journals = db.prepare(`
      SELECT title, mood, date(created_at, 'localtime') as day
      FROM journal_entries
      WHERE date(created_at, 'localtime') >= ?
      ORDER BY created_at DESC LIMIT 10
    `).all(sinceStr) as any[];

    const extras = db.prepare(`
      SELECT title, difficulty, xp_earned
      FROM extra_logs
      WHERE date(completed_at, 'localtime') >= ?
      ORDER BY completed_at DESC
    `).all(sinceStr) as any[];

    const challenges = db.prepare(`
      SELECT COUNT(*) as cnt, COALESCE(SUM(xp_earned), 0) as xp
      FROM challenge_logs
      WHERE date(completed_at, 'localtime') >= ?
    `).get(sinceStr) as any;

    const totalXP = (challenges?.xp || 0) + extras.reduce((s: number, e: any) => s + (e.xp_earned || 0), 0);
    const avgMood = journals.length > 0
      ? (journals.reduce((s: number, j: any) => s + (j.mood || 3), 0) / journals.length).toFixed(1)
      : null;

    const stats = { habitLogs, journals: journals.length, extras: extras.length, challenges: challenges?.cnt || 0, totalXP, avgMood };

    const key = getGeminiKey();
    if (!key) {
      const text = buildFallbackSummary(habitLogs, journals, extras, challenges, totalXP);
      _summaryCache = { text, stats, generatedAt: Date.now() };
      return res.json({ success: true, ..._summaryCache });
    }

    const prompt = `根據以下過去 7 天的個人成長數據，用繁體中文寫一段 150~200 字的週摘要。
語氣：溫暖、積極、像一位關心你的生產力教練，直接用第二人稱（你）說話。
格式：純文字段落，不要用 Markdown、不要用列表、不要用標題。
內容結構：先肯定做到的事→點出亮眼之處→給一句有力的結語。

數據：
- 習慣打卡：${habitLogs.length > 0 ? habitLogs.map((h: any) => `「${h.title}」× ${h.cnt}次`).join('、') : '本週暫無記錄'}
- 日記：${journals.length} 篇${avgMood ? `，心情均分 ${avgMood}/5` : ''}
${journals.length > 0 ? `- 日記主題：${journals.slice(0, 3).map((j: any) => `「${j.title}」`).join('、')}` : ''}
- 額外成就：${extras.length > 0 ? extras.map((e: any) => `「${e.title}」`).join('、') : '無'}
- 每日挑戰：${challenges?.cnt || 0} 次
- 本週累積 XP：${totalXP}`;

    const gemRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(20000),
      }
    );
    if (!gemRes.ok) throw new Error(`Gemini ${gemRes.status}`);
    const gemData: any = await gemRes.json();
    const text = gemData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      || buildFallbackSummary(habitLogs, journals, extras, challenges, totalXP);

    _summaryCache = { text, stats, generatedAt: Date.now() };
    res.json({ success: true, ..._summaryCache });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
