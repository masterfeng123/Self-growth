const DAY_START_HOUR = 6; // 早上 6:00 換日

/**
 * 取得「應用程式今天」的日期字串 (YYYY-MM-DD)
 * 早上 6:00 前仍算前一天
 */
export function appToday(): string {
  const d = new Date(Date.now() - DAY_START_HOUR * 60 * 60 * 1000);
  return d.toLocaleDateString('sv');
}

/**
 * 取得「應用程式昨天」的日期字串 (YYYY-MM-DD)
 */
export function appYesterday(): string {
  const d = new Date(Date.now() - DAY_START_HOUR * 60 * 60 * 1000 - 86400000);
  return d.toLocaleDateString('sv');
}

/**
 * SQLite 用的「今天」表達式（-6 hours offset）
 */
export const SQL_TODAY = `date('now', 'localtime', '-${DAY_START_HOUR} hours')`;
