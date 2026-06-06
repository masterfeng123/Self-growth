import nodemailer from 'nodemailer';
import { getTodayChallenge, getUserProfile } from '../routes/daily';
import { getLevelInfo } from './gamification';
import { CATEGORY_META } from '../data/challenges';
import { QUOTES } from '../data/quotes';

function getTodayQuote() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[day % QUOTES.length];
}

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendMorningEmail(): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[email] EMAIL_USER / EMAIL_PASS 未設定，跳過發送');
    return;
  }

  try {
    const challenge = getTodayChallenge();
    const profile = getUserProfile() as any;
    const levelInfo = getLevelInfo(profile.total_xp);
    const quote = getTodayQuote();
    const meta = CATEGORY_META[challenge.category];
    const streak = profile.current_streak as number;
    const today = new Date().toLocaleDateString('zh-TW', {
      month: 'long', day: 'numeric', weekday: 'long',
    });

    const diffStars = '⭐'.repeat(challenge.difficulty) + '☆'.repeat(3 - challenge.difficulty);
    const streakLine = streak === 0
      ? '今天開始你的連勝旅程！'
      : `連續 ${streak} 天！繼續保持 🔥`;
    const port = process.env.PORT || 3000;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:24px 0;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0"
  style="background:#1e293b;border-radius:16px;overflow:hidden;max-width:580px;width:100%;">

  <!-- 頂部橫幅 -->
  <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;text-align:center;">
    <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:6px;">${today}</div>
    <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">🌱 今日成長挑戰</h1>
    <div style="margin-top:10px;color:rgba(255,255,255,0.85);font-size:14px;">${streakLine}</div>
  </td></tr>

  <!-- 等級進度條 -->
  <tr><td style="padding:20px 32px 8px;">
    <div style="display:flex;justify-content:space-between;font-size:12px;color:#64748b;margin-bottom:6px;">
      <span>${levelInfo.emoji} ${levelInfo.name}・Lv.${levelInfo.level}</span>
      <span>${levelInfo.currentXp} / ${levelInfo.neededXp} XP</span>
    </div>
    <div style="background:#0f172a;border-radius:99px;height:7px;overflow:hidden;">
      <div style="width:${levelInfo.progress}%;background:linear-gradient(90deg,#4f46e5,#7c3aed);height:100%;border-radius:99px;"></div>
    </div>
  </td></tr>

  <!-- 挑戰卡片 -->
  <tr><td style="padding:16px 32px 24px;">
    <div style="background:${meta.bg};border:1px solid ${meta.color}44;border-radius:12px;padding:20px;">
      <div style="margin-bottom:10px;">
        <span style="background:${meta.color}22;color:${meta.color};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">
          ${meta.emoji} ${meta.name}
        </span>
        <span style="float:right;color:#64748b;font-size:12px;">${diffStars}・⏱ ${challenge.duration}</span>
      </div>
      <h2 style="margin:0 0 10px;color:#f1f5f9;font-size:19px;font-weight:700;">${challenge.title}</h2>
      <p style="margin:0 0 14px;color:#94a3b8;line-height:1.7;font-size:14px;">${challenge.description}</p>
      ${challenge.tip ? `
      <div style="background:#0f172a;border-left:3px solid ${meta.color};padding:10px 14px;border-radius:0 8px 8px 0;font-size:13px;color:#94a3b8;">
        💡 ${challenge.tip}
      </div>` : ''}
    </div>
  </td></tr>

  <!-- 行動按鈕 -->
  <tr><td style="padding:0 32px 28px;text-align:center;">
    <a href="http://localhost:${port}"
       style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;text-decoration:none;padding:13px 36px;border-radius:9px;font-weight:600;font-size:15px;">
      ✓ 前往打卡
    </a>
    <div style="margin-top:8px;color:#475569;font-size:12px;">完成挑戰後記得回來記錄心得</div>
  </td></tr>

  <!-- 今日名言 -->
  <tr><td style="border-top:1px solid #334155;padding:22px 32px;text-align:center;">
    <div style="font-style:italic;color:#94a3b8;font-size:14px;line-height:1.9;margin-bottom:6px;">"${quote.text}"</div>
    <div style="color:#475569;font-size:13px;">— ${quote.author}</div>
  </td></tr>

  <!-- 頁尾 -->
  <tr><td style="background:#0f172a;padding:14px 32px;text-align:center;">
    <div style="color:#334155;font-size:11px;">Self-growth・每天一個步驟，成為更好的自己</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    await createTransporter().sendMail({
      from: `"🌱 Self-growth" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `今日挑戰：${challenge.title}${streak > 0 ? ` 🔥×${streak}` : ''}`,
      html,
    });
    console.log('[email] 早晨挑戰郵件已發送');
  } catch (err) {
    console.error('[email] 發送失敗:', err);
  }
}

export async function sendClaudeUsageAlert(fiveHourPct: number, sevenDayPct: number): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    const port = process.env.PORT || 3000;
    const critical = fiveHourPct >= 95 ? fiveHourPct : sevenDayPct;
    const label = fiveHourPct >= 95 ? '5 小時視窗' : '7 天視窗';

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#0f172a;font-family:sans-serif;padding:24px;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:2px solid #f59e0b;">
    <div style="font-size:40px;margin-bottom:16px;">⚠️</div>
    <h2 style="color:#fbbf24;margin:0 0 12px;font-size:20px;">Claude 用量警示</h2>
    <p style="color:#94a3b8;margin:0 0 6px;font-size:15px;">${label} 使用量已達</p>
    <p style="color:#f87171;font-size:36px;font-weight:800;margin:8px 0 20px;">${critical}%</p>
    <div style="background:#0f172a;border-radius:8px;padding:14px 20px;margin-bottom:24px;text-align:left;">
      <div style="color:#64748b;font-size:12px;margin-bottom:6px;">使用詳情</div>
      <div style="color:#e2e8f0;font-size:14px;">5 小時視窗：<b style="color:${fiveHourPct>=95?'#f87171':'#4ade80'}">${fiveHourPct}%</b></div>
      <div style="color:#e2e8f0;font-size:14px;margin-top:4px;">7 天視窗：<b style="color:${sevenDayPct>=95?'#f87171':'#4ade80'}">${sevenDayPct}%</b></div>
    </div>
    <a href="http://localhost:${port}"
       style="display:inline-block;background:#f59e0b;color:#0f172a;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:700;font-size:15px;">
      前往查看用量
    </a>
  </div>
</body>
</html>`;

    await createTransporter().sendMail({
      from: `"🌱 Self-growth" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `⚠️ Claude 用量警示：${label} 已達 ${critical}%`,
      html,
    });
    console.log(`[email] Claude 用量警示已發送（5h:${fiveHourPct}% / 7d:${sevenDayPct}%）`);
  } catch (err) {
    console.error('[email] Claude 用量警示發送失敗:', err);
  }
}

export async function sendEveningReminder(): Promise<void> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
  try {
    const challenge = getTodayChallenge();
    const profile = getUserProfile() as any;
    const streak = profile.current_streak as number;
    const port = process.env.PORT || 3000;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#0f172a;font-family:sans-serif;padding:24px;text-align:center;">
  <div style="max-width:480px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #ef4444;">
    <div style="font-size:40px;margin-bottom:16px;">⚠️</div>
    <h2 style="color:#f87171;margin:0 0 12px;font-size:20px;">今天的挑戰還沒完成！</h2>
    <p style="color:#94a3b8;margin:0 0 6px;font-size:15px;">「${challenge.title}」</p>
    ${streak > 0
      ? `<p style="color:#fbbf24;font-weight:700;font-size:16px;margin:0 0 24px;">你的 🔥${streak} 天連勝即將中斷！</p>`
      : `<p style="color:#94a3b8;margin:0 0 24px;">今天還來得及開始你的連勝！</p>`}
    <a href="http://localhost:${port}"
       style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;">
      立刻完成打卡
    </a>
  </div>
</body>
</html>`;

    await createTransporter().sendMail({
      from: `"🌱 Self-growth" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `⚠️ 今日挑戰未完成！${streak > 0 ? `連勝 🔥×${streak} 岌岌可危...` : ''}`,
      html,
    });
    console.log('[email] 晚間提醒已發送');
  } catch (err) {
    console.error('[email] 晚間提醒發送失敗:', err);
  }
}
