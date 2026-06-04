import db from '../db/database';

const MODEL = 'gemini-3.1-flash-lite';

function getKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
  ].filter(Boolean) as string[];
}

let currentKeyIndex = 0;

function nextKey(): string {
  const keys = getKeys();
  const key = keys[currentKeyIndex % keys.length];
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return key;
}

async function callGemini(payload: object, retries = Math.max(getKeys().length * 3, 3)): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const key = nextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 429 || res.status === 503) {
      console.log(`[GeminiAgent] ${res.status} - retrying...`);
      continue;
    }
    if (res.status === 400) {
      const body = await res.text();
      if (body.includes('API_KEY_INVALID')) {
        console.log(`[GeminiAgent] key invalid, trying next...`);
        continue;
      }
      throw new Error(`Gemini error 400: ${body}`);
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini error ${res.status}: ${err}`);
    }
    const data: any = await res.json();
    try {
      const usage = data.usageMetadata;
      if (usage) {
        const { v4: uuidv4 } = await import('uuid');
        db.prepare(`INSERT INTO api_usage_logs (id, service, tokens_in, tokens_out) VALUES (?, 'gemini', ?, ?)`)
          .run(uuidv4(), usage.promptTokenCount ?? 0, usage.candidatesTokenCount ?? 0);
      }
    } catch {}
    return data;
  }
  throw new Error('AI 暫時繁忙，請稍後再試');
}

// ── Tool definitions ──
const TOOLS = [
  {
    name: 'add_journal',
    description: '新增一篇成長日記',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '日記標題' },
        content: { type: 'string', description: '日記內容' },
        mood: { type: 'number', description: '心情 1-5，5最好' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'add_habit',
    description: '建立一個新習慣',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '習慣名稱' },
        description: { type: 'string', description: '習慣描述' },
        frequency: { type: 'string', enum: ['daily', 'weekly'], description: '頻率' },
        category: { type: 'string', enum: ['general', 'health', 'learning', 'mindfulness'], description: '分類' },
      },
      required: ['title'],
    },
  },
  {
    name: 'log_habit',
    description: '打卡完成某個習慣（需要提供習慣名稱關鍵字）',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '習慣名稱關鍵字' },
        note: { type: 'string', description: '打卡備註（可選）' },
      },
      required: ['keyword'],
    },
  },
  {
    name: 'add_goal',
    description: '新增一個目標',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '目標標題' },
        description: { type: 'string', description: '目標描述' },
        horizon: { type: 'string', enum: ['10yr', '5yr', '1yr', '1mo', '1wk', 'mit'], description: '時間層級' },
        target_date: { type: 'string', description: '截止日期 YYYY-MM-DD（可選）' },
        category: { type: 'string', description: '分類（可選）' },
      },
      required: ['title', 'horizon'],
    },
  },
  {
    name: 'add_extra_achievement',
    description: '記錄一個額外成就並獲得 XP',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '完成了什麼事' },
        category: { type: 'string', enum: ['mind', 'body', 'skills', 'social', 'creativity', 'reflection', 'general'], description: '類別' },
        difficulty: { type: 'string', enum: ['1', '2', '3'], description: '難度：1=簡單20XP, 2=中等40XP, 3=困難70XP' },
        note: { type: 'string', description: '備註（可選）' },
      },
      required: ['title'],
    },
  },
  {
    name: 'add_project',
    description: '建立一個新專案並開始追蹤',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '專案名稱' },
        description: { type: 'string', description: '專案描述' },
        target_date: { type: 'string', description: '預計完成日 YYYY-MM-DD（可選）' },
      },
      required: ['name'],
    },
  },
  {
    name: 'add_project_log',
    description: '為某個專案新增進度日誌',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '專案名稱關鍵字' },
        note: { type: 'string', description: '今天做了什麼' },
        progress: { type: 'number', description: '目前進度 0-100（可選）' },
      },
      required: ['keyword', 'note'],
    },
  },
  {
    name: 'add_debug_log',
    description: '新增一筆 debug 記錄（技術筆記）',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: '問題標題' },
        content: { type: 'string', description: 'Markdown 格式的詳細記錄' },
        severity: { type: 'string', enum: ['info', 'warn', 'error'], description: '嚴重度' },
        tags: { type: 'string', description: '逗號分隔標籤（可選）' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'get_dashboard',
    description: '取得目前的成長數據摘要（XP、連勝、習慣、目標數量等）',
    parameters: { type: 'object', properties: {}, required: [] },
  },
];

// ── Tool executors ──
async function executeTool(name: string, args: any): Promise<string> {
  const { v4: uuidv4 } = await import('uuid');

  switch (name) {
    case 'add_journal': {
      const id = uuidv4();
      db.prepare(`INSERT INTO journal_entries (id, title, content, mood) VALUES (?, ?, ?, ?)`)
        .run(id, args.title, args.content, args.mood ?? 3);
      return `日記「${args.title}」已新增`;
    }
    case 'add_habit': {
      const id = uuidv4();
      db.prepare(`INSERT INTO habits (id, title, description, frequency, category) VALUES (?, ?, ?, ?, ?)`)
        .run(id, args.title, args.description ?? null, args.frequency ?? 'daily', args.category ?? 'general');
      return `習慣「${args.title}」已建立`;
    }
    case 'log_habit': {
      const habit = db.prepare(`SELECT * FROM habits WHERE title LIKE ? AND is_active = 1`)
        .get(`%${args.keyword}%`) as any;
      if (!habit) return `找不到包含「${args.keyword}」的習慣`;
      const id = uuidv4();
      db.prepare(`INSERT INTO habit_logs (id, habit_id, note) VALUES (?, ?, ?)`)
        .run(id, habit.id, args.note ?? null);
      db.prepare(`UPDATE habits SET streak = streak + 1, updated_at = datetime('now') WHERE id = ?`)
        .run(habit.id);
      return `習慣「${habit.title}」已打卡完成`;
    }
    case 'add_goal': {
      const id = uuidv4();
      const mitDate = args.horizon === 'mit' ? new Date().toLocaleDateString('sv') : null;
      db.prepare(`INSERT INTO goals (id, title, description, horizon, category, target_date, mit_date) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .run(id, args.title, args.description ?? null, args.horizon, args.category ?? 'general', args.target_date ?? null, mitDate);
      return `目標「${args.title}」（${args.horizon}）已新增`;
    }
    case 'add_extra_achievement': {
      const xpMap: Record<number, number> = { 1: 20, 2: 40, 3: 70 };
      const diff = parseInt(args.difficulty ?? '2', 10);
      const xp = xpMap[diff] ?? 40;
      const id = uuidv4();
      db.prepare(`INSERT INTO extra_logs (id, title, category, difficulty, xp_earned, note) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(id, args.title, args.category ?? 'general', diff, xp, args.note ?? null);
      db.prepare(`UPDATE user_profile SET total_xp = total_xp + ? WHERE id = 1`).run(xp);
      return `額外成就「${args.title}」已記錄，獲得 ${xp} XP`;
    }
    case 'add_project': {
      const id = uuidv4();
      db.prepare(`INSERT INTO projects (id, name, description, target_date) VALUES (?, ?, ?, ?)`)
        .run(id, args.name, args.description ?? null, args.target_date ?? null);
      return `專案「${args.name}」已建立`;
    }
    case 'add_project_log': {
      const project = db.prepare(`SELECT * FROM projects WHERE name LIKE ?`).get(`%${args.keyword}%`) as any;
      if (!project) return `找不到包含「${args.keyword}」的專案`;
      const id = uuidv4();
      const snap = args.progress !== undefined ? args.progress : project.progress;
      db.prepare(`INSERT INTO project_logs (id, project_id, note, progress_snapshot) VALUES (?, ?, ?, ?)`)
        .run(id, project.id, args.note, snap);
      if (args.progress !== undefined) {
        db.prepare(`UPDATE projects SET progress = ?, updated_at = datetime('now','localtime') WHERE id = ?`)
          .run(args.progress, project.id);
      }
      return `專案「${project.name}」進度日誌已新增${args.progress !== undefined ? `，進度更新至 ${args.progress}%` : ''}`;
    }
    case 'add_debug_log': {
      const id = uuidv4();
      db.prepare(`INSERT INTO debug_logs (id, title, content, severity, tags) VALUES (?, ?, ?, ?, ?)`)
        .run(id, args.title, args.content, args.severity ?? 'info', args.tags ?? '');
      return `Debug Log「${args.title}」已記錄`;
    }
    case 'get_dashboard': {
      const profile = db.prepare(`SELECT * FROM user_profile WHERE id = 1`).get() as any;
      const habitCount = (db.prepare(`SELECT COUNT(*) as c FROM habits WHERE is_active = 1`).get() as any).c;
      const goalCount = (db.prepare(`SELECT COUNT(*) as c FROM goals WHERE status = 'active'`).get() as any).c;
      const projectCount = (db.prepare(`SELECT COUNT(*) as c FROM projects WHERE status = 'active'`).get() as any).c;
      const today = new Date().toLocaleDateString('sv');
      const todayLogs = (db.prepare(`SELECT COUNT(*) as c FROM challenge_logs WHERE completed_at LIKE ?`).get(`${today}%`) as any).c;
      return JSON.stringify({
        totalXp: profile?.total_xp ?? 0,
        streak: profile?.current_streak ?? 0,
        activeHabits: habitCount,
        activeGoals: goalCount,
        activeProjects: projectCount,
        todayChallengeCompleted: todayLogs > 0,
      });
    }
    default:
      return `未知工具：${name}`;
  }
}

const SYSTEM_PROMPT = `你是 Self-growth 個人成長助理，負責幫使用者操控他的成長儀表板。
今天日期：${new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}

你可以透過工具完成以下操作：
- 新增日記、習慣、習慣打卡、目標、額外成就
- 建立專案、新增專案進度
- 記錄 Debug Log（技術筆記）
- 查詢目前成長數據

請用繁體中文回覆，語氣親切、簡潔。操作完成後告知使用者完成了什麼，如果需要更多資訊才能執行，直接詢問。`;

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function chat(userMessage: string, history: ChatMessage[] = []): Promise<{ reply: string; actions: string[] }> {
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  const payload = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    tools: [{ function_declarations: TOOLS }],
    tool_config: { function_calling_config: { mode: 'AUTO' } },
  };

  const actions: string[] = [];
  let response = await callGemini(payload);

  // 處理 function calling 循環
  while (true) {
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const funcCalls = parts.filter((p: any) => p.functionCall);

    if (funcCalls.length === 0) {
      const text = parts.map((p: any) => p.text || '').join('').trim();
      return { reply: text || '完成', actions };
    }

    // 執行所有 function calls
    const funcResults: any[] = [];
    for (const part of funcCalls) {
      const { name, args } = part.functionCall;
      const result = await executeTool(name, args);
      actions.push(result);
      funcResults.push({
        functionResponse: { name, response: { result } },
      });
    }

    // 把結果送回 Gemini 繼續對話
    contents.push(candidate.content);
    contents.push({ role: 'user', parts: funcResults });
    const payload2 = { ...payload, contents };
    response = await callGemini(payload2);
  }
}
