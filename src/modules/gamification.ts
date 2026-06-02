export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  currentXp: number;
  neededXp: number;
  totalXp: number;
  progress: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

const LEVEL_NAMES: Array<[number, string, string]> = [
  [1,  '種子', '🌱'],
  [3,  '幼苗', '🌿'],
  [5,  '嫩芽', '🍀'],
  [8,  '小樹', '🌴'],
  [12, '茁壯', '🌳'],
  [17, '精進', '⚡'],
  [23, '強壯', '🔥'],
  [30, '精通', '💎'],
  [40, '大師', '👑'],
  [50, '傳說', '🌟'],
];

export function xpForLevel(n: number): number {
  return 100 + (n - 1) * 50;
}

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let xpUsed = 0;
  while (true) {
    const needed = xpForLevel(level);
    if (xpUsed + needed > totalXp) {
      const entry = [...LEVEL_NAMES].reverse().find(([l]) => l <= level) || LEVEL_NAMES[0];
      const [, name, emoji] = entry;
      const currentXp = totalXp - xpUsed;
      return {
        level,
        name,
        emoji,
        currentXp,
        neededXp: needed,
        totalXp,
        progress: Math.floor((currentXp / needed) * 100),
      };
    }
    xpUsed += needed;
    level++;
  }
}

export const ACHIEVEMENTS: Achievement[] = [
  // ── 入門 ──
  { id: 'first-step',      name: '啟程',      description: '完成第一個每日挑戰',            emoji: '🚀' },

  // ── 連勝 ──
  { id: 'streak-3',        name: '三日精進',   description: '連續完成3天挑戰',               emoji: '🌿' },
  { id: 'streak-7',        name: '七日不倦',   description: '連續完成7天挑戰',               emoji: '🔥' },
  { id: 'streak-14',       name: '兩週如一',   description: '連續完成14天挑戰',              emoji: '💪' },
  { id: 'streak-30',       name: '月月精進',   description: '連續完成30天挑戰',              emoji: '💎' },
  { id: 'streak-100',      name: '百日修煉',   description: '連續完成100天挑戰',             emoji: '👑' },
  { id: 'streak-200',      name: '兩百日長征', description: '連續完成200天挑戰',             emoji: '⚡' },
  { id: 'streak-365',      name: '年輪歷練',   description: '連續完成365天挑戰',             emoji: '🌍' },

  // ── 等級 ──
  { id: 'level-5',         name: '初具規模',   description: '達到等級5',                     emoji: '⭐' },
  { id: 'level-10',        name: '小有成就',   description: '達到等級10',                    emoji: '🌟' },
  { id: 'level-20',        name: '功力深厚',   description: '達到等級20',                    emoji: '✨' },
  { id: 'level-30',        name: '精通之境',   description: '達到等級30',                    emoji: '💫' },
  { id: 'level-40',        name: '登峰造極',   description: '達到等級40',                    emoji: '🚀' },
  { id: 'level-50',        name: '傳說宗師',   description: '達到等級50',                    emoji: '🌟' },

  // ── 挑戰總量 ──
  { id: 'challenges-10',   name: '十步起跑',   description: '累計完成10個挑戰',              emoji: '🎯' },
  { id: 'challenges-50',   name: '半百精進',   description: '累計完成50個挑戰',              emoji: '⚙️' },
  { id: 'challenges-100',  name: '百煉成鋼',   description: '累計完成100個挑戰',             emoji: '🔩' },
  { id: 'challenges-500',  name: '五百強者',   description: '累計完成500個挑戰',             emoji: '🏆' },

  // ── 類別 x3（入門）──
  { id: 'mind-x3',         name: '思維突破',   description: '完成3個心智挑戰',               emoji: '🧠' },
  { id: 'body-x3',         name: '體魄強健',   description: '完成3個身體挑戰',               emoji: '💪' },
  { id: 'skills-x3',       name: '技藝精進',   description: '完成3個技能挑戰',               emoji: '🎯' },
  { id: 'social-x3',       name: '人際達人',   description: '完成3個社交挑戰',               emoji: '❤️' },
  { id: 'creativity-x3',   name: '創意無限',   description: '完成3個創意挑戰',               emoji: '🎨' },
  { id: 'reflection-x3',   name: '內觀自省',   description: '完成3個內省挑戰',               emoji: '🔮' },
  { id: 'all-categories',  name: '全面發展',   description: '每個類別各完成至少一個挑戰',    emoji: '🌈' },

  // ── 類別 x10（精通）──
  { id: 'mind-x10',        name: '智慧導師',   description: '完成10個心智挑戰',              emoji: '🧠' },
  { id: 'body-x10',        name: '體魄巔峰',   description: '完成10個身體挑戰',              emoji: '🏋️' },
  { id: 'skills-x10',      name: '技藝宗師',   description: '完成10個技能挑戰',              emoji: '🎯' },
  { id: 'social-x10',      name: '人脈大師',   description: '完成10個社交挑戰',              emoji: '🤝' },
  { id: 'creativity-x10',  name: '創意大師',   description: '完成10個創意挑戰',              emoji: '🎨' },
  { id: 'reflection-x10',  name: '內省賢者',   description: '完成10個內省挑戰',              emoji: '🔮' },
  { id: 'all-x10',         name: '全才大師',   description: '每個類別各完成10個挑戰',        emoji: '🌈' },

  // ── 日誌 ──
  { id: 'journal-first',   name: '初筆成文',   description: '撰寫第一篇日誌',                emoji: '📝' },
  { id: 'journal-30',      name: '墨香三十',   description: '累計撰寫30篇日誌',              emoji: '📖' },
  { id: 'journal-100',     name: '百頁自傳',   description: '累計撰寫100篇日誌',             emoji: '📚' },

  // ── 目標 ──
  { id: 'goal-first',      name: '首戰告捷',   description: '完成第一個目標',                emoji: '✅' },
  { id: 'goal-10',         name: '目標獵人',   description: '累計完成10個目標',              emoji: '🎯' },

  // ── 習慣 ──
  { id: 'habit-100',       name: '習慣成自然', description: '累計完成100次習慣打卡',          emoji: '⚡' },

  // ── 最長連勝 ──
  { id: 'longest-30',      name: '鐵打意志',   description: '歷史最長連勝紀錄達30天',        emoji: '🛡️' },
];

export interface AchievementExtras {
  totalCompleted?: number;
  journalCount?: number;
  completedGoals?: number;
  habitLogCount?: number;
  longestStreak?: number;
}

export function checkAchievements(
  current: string[],
  streak: number,
  totalXp: number,
  categoryCounts: Record<string, number>,
  extras?: AchievementExtras
): string[] {
  const newOnes: string[] = [];
  const add = (id: string) => {
    if (!current.includes(id) && !newOnes.includes(id)) newOnes.push(id);
  };

  const totalCompleted = extras?.totalCompleted
    ?? Object.values(categoryCounts).reduce((a, b) => a + b, 0);

  if (totalCompleted >= 1)   add('first-step');
  if (streak >= 3)   add('streak-3');
  if (streak >= 7)   add('streak-7');
  if (streak >= 14)  add('streak-14');
  if (streak >= 30)  add('streak-30');
  if (streak >= 100) add('streak-100');
  if (streak >= 200) add('streak-200');
  if (streak >= 365) add('streak-365');

  const level = getLevelInfo(totalXp).level;
  if (level >= 5)  add('level-5');
  if (level >= 10) add('level-10');
  if (level >= 20) add('level-20');
  if (level >= 30) add('level-30');
  if (level >= 40) add('level-40');
  if (level >= 50) add('level-50');

  if (totalCompleted >= 10)  add('challenges-10');
  if (totalCompleted >= 50)  add('challenges-50');
  if (totalCompleted >= 100) add('challenges-100');
  if (totalCompleted >= 500) add('challenges-500');

  const cats = ['mind', 'body', 'skills', 'social', 'creativity', 'reflection'];
  cats.forEach(cat => {
    if ((categoryCounts[cat] || 0) >= 3)  add(`${cat}-x3`);
    if ((categoryCounts[cat] || 0) >= 10) add(`${cat}-x10`);
  });
  if (cats.every(cat => (categoryCounts[cat] || 0) >= 1))  add('all-categories');
  if (cats.every(cat => (categoryCounts[cat] || 0) >= 10)) add('all-x10');

  const journalCount   = extras?.journalCount   ?? 0;
  const completedGoals = extras?.completedGoals ?? 0;
  const habitLogCount  = extras?.habitLogCount  ?? 0;
  const longestStreak  = extras?.longestStreak  ?? streak;

  if (journalCount >= 1)   add('journal-first');
  if (journalCount >= 30)  add('journal-30');
  if (journalCount >= 100) add('journal-100');

  if (completedGoals >= 1)  add('goal-first');
  if (completedGoals >= 10) add('goal-10');

  if (habitLogCount >= 100) add('habit-100');

  if (longestStreak >= 30) add('longest-30');

  return newOnes;
}
