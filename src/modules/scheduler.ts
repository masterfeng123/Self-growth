import cron from 'node-cron';
import db from '../db/database';
import { sendMorningEmail, sendEveningReminder, sendClaudeUsageAlert } from './emailService';
import { generateWeeklyReport } from './weeklyEval';
import { fetchClaudeOAuthUsage } from './claudeOAuthUsage';
import { SQL_TODAY } from '../utils/date';

// 冷卻追蹤：避免在同一視窗內重複發警示（key: '5h' | '7d'，value: 上次發送時間 ms）
const ALERT_COOLDOWN_MS = 4 * 60 * 60 * 1000; // 4 小時
const lastAlertSent: Record<string, number> = {};

export function startScheduler(): void {
  // 每天早上 07:00 發送挑戰郵件
  cron.schedule('0 7 * * *', async () => {
    console.log('[scheduler] 觸發：早晨挑戰郵件');
    await sendMorningEmail();
  }, { timezone: 'Asia/Taipei' });

  // 每天晚上 22:00，若未打卡則發連勝危機提醒
  cron.schedule('0 22 * * *', async () => {
    const todayLog = db.prepare(
      `SELECT id FROM challenge_logs WHERE date(completed_at) = ${SQL_TODAY}`
    ).get();
    if (!todayLog) {
      console.log('[scheduler] 觸發：晚間未打卡提醒');
      await sendEveningReminder();
    }
  }, { timezone: 'Asia/Taipei' });

  // 每週日 20:00 自動生成 AI 成長週報
  cron.schedule('0 20 * * 0', async () => {
    console.log('[scheduler] 觸發：每週 AI 成長評價生成');
    const result = await generateWeeklyReport();
    if (result.success) {
      console.log(`[scheduler] 週報生成成功：${result.reportId}`);
    } else {
      console.error(`[scheduler] 週報生成失敗：${result.error}`);
    }
  }, { timezone: 'Asia/Taipei' });

  // 每 30 分鐘檢查 Claude 用量，超過 95% 發 email（4 小時冷卻）
  cron.schedule('*/30 * * * *', async () => {
    try {
      const usage = await fetchClaudeOAuthUsage();
      const u5 = usage.fiveHour.utilization;
      const u7 = usage.sevenDay.utilization;
      const now = Date.now();

      const need5h = u5 >= 95 && (!lastAlertSent['5h'] || now - lastAlertSent['5h'] > ALERT_COOLDOWN_MS);
      const need7d = u7 >= 95 && (!lastAlertSent['7d'] || now - lastAlertSent['7d'] > ALERT_COOLDOWN_MS);

      if (need5h || need7d) {
        console.log(`[scheduler] Claude 用量警示觸發：5h=${u5}% / 7d=${u7}%`);
        await sendClaudeUsageAlert(u5, u7);
        if (need5h) lastAlertSent['5h'] = now;
        if (need7d) lastAlertSent['7d'] = now;
      }
    } catch {
      // 憑證未設定或 token 過期時靜默忽略
    }
  });

  console.log('⏰ 排程器已啟動 (07:00 早晨挑戰 / 22:00 連勝危機警報 / 週日 20:00 AI 週報 / 每 30 分鐘 Claude 用量檢查)');
}
