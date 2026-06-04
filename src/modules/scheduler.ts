import cron from 'node-cron';
import db from '../db/database';
import { sendMorningEmail, sendEveningReminder } from './emailService';
import { generateWeeklyReport } from './weeklyEval';
import { SQL_TODAY } from '../utils/date';

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

  console.log('⏰ 排程器已啟動 (07:00 早晨挑戰 / 22:00 連勝危機警報 / 週日 20:00 AI 週報)');
}
