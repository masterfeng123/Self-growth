import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/database';
import { CHALLENGES, CATEGORY_META } from '../data/challenges';
import { getLevelInfo } from './gamification';

interface WeeklyData {
  weekStart: string;
  weekEnd: string;
  profile: any;
  challengeLogs: any[];
  habitLogs: any[];
  journalEntries: any[];
  goalsSummary: any[];
  extraLogs: any[];
  categoryBreakdown: Record<string, number>;
  avgMood: number | null;
  totalXp: number;
  daysActive: number;
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const fmt = (d: Date) => d.toLocaleDateString('sv');
  return { start: fmt(monday), end: fmt(sunday) };
}

function collectWeeklyData(): WeeklyData {
  const { start, end } = getWeekRange();
  const profile = db.prepare('SELECT * FROM user_profile WHERE id = 1').get() as any;

  const challengeLogs = db.prepare(`
    SELECT * FROM challenge_logs
    WHERE date(completed_at) BETWEEN ? AND ?
    ORDER BY completed_at ASC
  `).all(start, end) as any[];

  const enrichedLogs = challengeLogs.map(log => ({
    ...log,
    challenge: CHALLENGES.find(c => c.id === log.challenge_id) || null,
  }));

  const habitLogs = db.prepare(`
    SELECT hl.*, h.title as habit_title, h.category as habit_category
    FROM habit_logs hl
    JOIN habits h ON hl.habit_id = h.id
    WHERE date(hl.completed_at) BETWEEN ? AND ?
  `).all(start, end) as any[];

  const journalEntries = db.prepare(`
    SELECT * FROM journal_entries
    WHERE date(created_at) BETWEEN ? AND ?
    ORDER BY created_at ASC
  `).all(start, end) as any[];

  const goalsSummary = db.prepare(`
    SELECT category, status, COUNT(*) as count, AVG(progress) as avg_progress
    FROM goals
    GROUP BY category, status
  `).all() as any[];

  const extraLogs = db.prepare(`
    SELECT * FROM extra_logs
    WHERE date(completed_at) BETWEEN ? AND ?
    ORDER BY completed_at ASC
  `).all(start, end) as any[];

  const categoryBreakdown: Record<string, number> = {};
  enrichedLogs.forEach(log => {
    if (log.challenge) {
      const cat = log.challenge.category;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }
  });

  const moodTotal = enrichedLogs.reduce((sum, l) => sum + (l.mood || 3), 0);
  const journalMoodTotal = journalEntries.reduce((sum: number, j: any) => sum + (j.mood || 3), 0);
  const moodCount = enrichedLogs.length + journalEntries.length;
  const avgMood = moodCount > 0
    ? parseFloat(((moodTotal + journalMoodTotal) / moodCount).toFixed(1))
    : null;

  const challengeXp = enrichedLogs.reduce((sum, l) => sum + (l.xp_earned || 0), 0);
  const extraXp = extraLogs.reduce((sum, l) => sum + (l.xp_earned || 0), 0);
  const totalXp = challengeXp + extraXp;

  const activeDates = new Set([
    ...enrichedLogs.map(l => l.completed_at?.slice(0, 10)),
    ...extraLogs.map(l => l.completed_at?.slice(0, 10)),
  ]);
  const daysActive = activeDates.size;

  return {
    weekStart: start,
    weekEnd: end,
    profile,
    challengeLogs: enrichedLogs,
    habitLogs,
    journalEntries,
    goalsSummary,
    extraLogs,
    categoryBreakdown,
    avgMood,
    totalXp,
    daysActive,
  };
}

function buildPrompt(data: WeeklyData): string {
  const { profile, challengeLogs, habitLogs, journalEntries, goalsSummary,
          extraLogs, categoryBreakdown, avgMood, totalXp, daysActive, weekStart, weekEnd } = data;

  const levelInfo = getLevelInfo(profile.total_xp);
  const catNames: Record<string, string> = {
    mind: '心智', body: '身體', skills: '技能',
    social: '社交', creativity: '創意', reflection: '內省',
  };
  const ALL_CATS = ['mind', 'body', 'skills', 'social', 'creativity', 'reflection'];
  const diffLabel = ['', '簡單', '中等', '困難'];

  // ── 逐日活動時間軸 ──────────────────────────────────────────────
  const activityByDate: Record<string, string[]> = {};
  challengeLogs.forEach(l => {
    const d = l.completed_at?.slice(0, 10) || '';
    if (d) {
      const ch = l.challenge;
      activityByDate[d] = activityByDate[d] || [];
      activityByDate[d].push(`挑戰「${ch?.title || l.challenge_id}」（${catNames[ch?.category||'']||'未知'}・心情${l.mood}/5${l.reflection ? `・心得：${l.reflection}` : ''}）`);
    }
  });
  extraLogs.forEach(l => {
    const d = l.completed_at?.slice(0, 10) || '';
    if (d) {
      activityByDate[d] = activityByDate[d] || [];
      activityByDate[d].push(`額外成就「${l.title}」（${catNames[l.category]||l.category}・${diffLabel[l.difficulty]||'中等'}）`);
    }
  });
  journalEntries.forEach((j: any) => {
    const d = j.created_at?.slice(0, 10) || '';
    if (d) {
      activityByDate[d] = activityByDate[d] || [];
      activityByDate[d].push(`日記《${j.title}》（心情${j.mood}/5）`);
    }
  });

  // 生成 7 天時間軸
  const start = new Date(weekStart);
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const timeline = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toLocaleDateString('sv');
    const acts = activityByDate[key];
    const label = `${key}（週${dayNames[d.getDay()]}）`;
    return acts?.length
      ? `  ${label}：${acts.join('；')}`
      : `  ${key}（週${dayNames[d.getDay()]}）：❌ 未活躍`;
  }).join('\n');

  // ── 類別覆蓋 vs 缺席 ────────────────────────────────────────────
  const doneCats = Object.keys(categoryBreakdown);
  const missingCats = ALL_CATS.filter(c => !doneCats.includes(c));
  const catCoverage = ALL_CATS.map(c => {
    const n = categoryBreakdown[c] || 0;
    return `${catNames[c]}：${n > 0 ? `${n} 次` : '0 次（本週空白）'}`;
  }).join('、');

  // ── 挑戰詳情（含難度與心情）──────────────────────────────────────
  const challengeDetails = challengeLogs.map(l => {
    const ch = l.challenge;
    const diffStr = ch?.difficulty ? `難度${diffLabel[ch.difficulty]}・+${ch.xpReward}XP` : '';
    return `  ・「${ch?.title || l.challenge_id}」[${catNames[ch?.category||'']||'未知'}] ${diffStr} 心情${l.mood}/5${l.reflection ? `\n    心得原文：「${l.reflection}」` : ''}`;
  }).join('\n') || '  （本週無挑戰記錄）';

  // ── 日記（完整摘錄）──────────────────────────────────────────────
  const journalDetails = journalEntries.length > 0
    ? journalEntries.map((j: any) =>
        `  ・《${j.title}》心情${j.mood}/5\n    內容：「${j.content.slice(0, 300)}${j.content.length > 300 ? '…（已截斷）' : ''}」`
      ).join('\n\n')
    : '  （本週無日記）';

  // ── 習慣 ────────────────────────────────────────────────────────
  const habitDetails = habitLogs.length > 0
    ? habitLogs.map((h: any) => `  ・${h.habit_title}（${catNames[h.habit_category]||h.habit_category}）`).join('\n')
    : '  （本週無習慣打卡）';

  // ── 額外成就 ─────────────────────────────────────────────────────
  const extraDetails = extraLogs.length > 0
    ? extraLogs.map(l =>
        `  ・「${l.title}」[${catNames[l.category]||l.category}・${diffLabel[l.difficulty]||'中等'}] +${l.xp_earned}XP${l.note ? `，備註：「${l.note}」` : ''}`
      ).join('\n')
    : '  （本週無額外成就）';

  // ── 進行中目標 ───────────────────────────────────────────────────
  const activeGoals = goalsSummary.filter((g: any) => g.status === 'active');
  const goalDetails = activeGoals.length > 0
    ? activeGoals.map((g: any) => `  ・${g.category}分類：${g.count} 個目標，平均進度 ${Math.round(g.avg_progress || 0)}%`).join('\n')
    : '  （目前無進行中目標）';

  // ── 心情摘要 ────────────────────────────────────────────────────
  const allMoods = [
    ...challengeLogs.map(l => l.mood).filter(Boolean),
    ...journalEntries.map((j: any) => j.mood).filter(Boolean),
  ];
  const moodDist = allMoods.reduce((acc: Record<number, number>, m: number) => {
    acc[m] = (acc[m] || 0) + 1; return acc;
  }, {});
  const moodSummary = Object.entries(moodDist)
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([score, count]) => `${score}/5 出現 ${count} 次`)
    .join('、') || '無心情記錄';

  return `你是一位基於行為數據的個人成長顧問。你的分析必須讓當事人看完後說：「對，這確實是我，我願意改變。」

## ⚠️ 寫作硬性規則（違反即分析失效）

**規則 1 — 每個觀察必須綁定數據**
禁止使用以下詞彙，除非後面緊接具體數據作為佐證：
「你似乎」「可能」「傾向於」「有時候」「往往」「也許」
✗ 錯誤範例：「你似乎對反思類活動有偏好。」
✓ 正確範例：「本週 6 次有記錄的活動中，內省類佔 2 次、心智類佔 2 次，合計佔 67%，而社交、身體、創意類各為 0 次——這不是偏好，是事實。」

**規則 2 — 引用格式**
・挑戰名稱用「」括起（如「冷水澡挑戰」）
・日記標題用《》括起（如《今天又錯過了》）
・心情評分必須為 X/5 格式（如 4/5），不用「心情不錯」這類描述
・直接引用日記原文時，用「原文」兩字標注

**規則 3 — 盲點必須有反面對比**
若要說「你缺乏X」，必須同時提供：
  A) 缺失的具體數字（X 類完成 0 次）
  B) 存在的對比數字（Y 類完成 N 次）
  C) 這個差距在客觀上意味著什麼

**規則 4 — 下週建議必須是可執行的最小行動**
不是方向（「多關注社交」），而是一個可以在明天執行的具體動作：
  - 包含時間（早上/晚上/工作空檔）
  - 包含場景（在辦公室/下班路上/睡前）
  - 包含可測量的完成標準

**規則 5 — 評分必須透明**
評分依據必須明確列出三個計算維度：活躍度、類別廣度、深度指標（日記+心得）

---

## 本週原始數據（${weekStart} — ${weekEnd}）

### 基本指標
・活躍天數：${daysActive} / 7 天
・本週 XP：${totalXp}（挑戰 ${challengeLogs.reduce((s,l)=>s+(l.xp_earned||0),0)} + 額外 ${extraLogs.reduce((s,l)=>s+(l.xp_earned||0),0)}）
・挑戰完成：${challengeLogs.length} 個 ／ 日記：${journalEntries.length} 篇 ／ 習慣打卡：${habitLogs.length} 次
・心情分佈：${moodSummary}（平均 ${avgMood !== null ? `${avgMood}/5` : '無記錄'}）
・累積連勝：${profile.current_streak} 天

### 類別覆蓋（6 大類完整對比）
${catCoverage}
本週空白類別：${missingCats.length > 0 ? missingCats.map(c => catNames[c]).join('、') : '無（全部類別均有完成）'}

### 逐日活動時間軸
${timeline}

### 挑戰詳情
${challengeDetails}

### 日記完整摘錄
${journalDetails}

### 習慣打卡
${habitDetails}

### 額外自主成就
${extraDetails}

### 進行中目標
${goalDetails}

---

## 輸出格式（純 JSON，不加 markdown code block）

{
  "persona_title": "4-8 字，必須能被上面的數據直接支撐，不能是通用人格標籤",

  "persona_description": "三段，每段必須以引用的數據開頭，再推導出結論。
    第一段：從類別分佈和挑戰選擇模式出發，引用至少 2 個具體數字。
    第二段：從日記原文或心情數據出發，引用至少 1 段日記原文或 2 個心情數據點。
    第三段：從活躍時間軸（哪幾天活躍/缺席）出發，分析行為一致性。
    每段 60 字以上，全文 200 字以上。",

  "highlights": [
    "格式：[引用的具體數據或行為] + [這個數據說明了什麼] + [為什麼值得認可]。每條 35-60 字，共 3 條。"
  ],

  "blind_spots": [
    "格式：[缺失的具體數字] vs [存在的對比數字] + [這個落差客觀上意味著什麼] + [一個不評判的觀察]。每條 35-60 字，共 2-3 條。"
  ],

  "patterns": "交叉分析三組數據：(1)挑戰類別選擇模式，(2)日記情緒主題，(3)活躍日 vs 非活躍日的差異。必須引用至少 4 個具體數據點，並說明這三組數據之間的關聯。150 字以上。",

  "next_week_focus": "格式：[基於什麼具體觀察（引用數據）] → [因此建議聚焦的領域] → [明天可以執行的一個最小行動，含時間、場景、完成標準]。80 字以上。",

  "score": 整數1-10,

  "score_reason": "三個計算維度各幾分：(1)活躍度 ${daysActive}/7 天，(2)類別廣度 ${doneCats.length}/6 類，(3)深度指標（日記${journalEntries.length}篇+有心得的挑戰${challengeLogs.filter(l=>l.reflection).length}個）。明確說明如何加權得出總分。40-60 字。"
}`;
}

function getAvailableKey(): string | null {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
  ].filter(Boolean) as string[];
  return candidates[0] ?? null;
}

export async function generateWeeklyReport(): Promise<{ success: boolean; reportId?: string; error?: string }> {
  const apiKey = getAvailableKey();
  if (!apiKey) {
    return { success: false, error: '未設定任何 GEMINI API Key，請在 .env 填入 GEMINI_KEY_1' };
  }

  try {
    const data = collectWeeklyData();
    const prompt = buildPrompt(data);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 4096,
      },
    });

    console.log('[weeklyEval] 正在呼叫 Gemini API 生成週報...');
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let parsed: any;
    try {
      // 找第一個 { 和最後一個 } 直接提取 JSON 物件
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('no JSON object found');
      parsed = JSON.parse(text.slice(start, end + 1));
    } catch {
      return { success: false, error: `Gemini 回傳格式錯誤：${text.slice(0, 200)}` };
    }

    const reportId = uuidv4();
    db.prepare(`
      INSERT INTO weekly_reports
        (id, week_start, week_end, persona_title, persona_description,
         highlights, blind_spots, patterns, next_week_focus, score, raw_data, full_report)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      data.weekStart,
      data.weekEnd,
      parsed.persona_title,
      parsed.persona_description,
      JSON.stringify(parsed.highlights),
      JSON.stringify(parsed.blind_spots),
      parsed.patterns,
      parsed.next_week_focus,
      parsed.score,
      JSON.stringify({
        daysActive: data.daysActive,
        totalXp: data.totalXp,
        avgMood: data.avgMood,
        categoryBreakdown: data.categoryBreakdown,
        challengeCount: data.challengeLogs.length,
        journalCount: data.journalEntries.length,
        habitCount: data.habitLogs.length,
        extraCount: data.extraLogs.length,
      }),
      JSON.stringify({ ...parsed, scoreReason: parsed.score_reason })
    );

    console.log(`[weeklyEval] 週報已生成：${reportId}`);
    return { success: true, reportId };
  } catch (err: any) {
    console.error('[weeklyEval] 生成失敗:', err);
    return { success: false, error: err.message || '未知錯誤' };
  }
}

export function getLatestReport() {
  return db.prepare('SELECT * FROM weekly_reports ORDER BY created_at DESC LIMIT 1').get();
}

export function getAllReports() {
  return db.prepare('SELECT * FROM weekly_reports ORDER BY created_at DESC').all();
}
