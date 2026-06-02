# Agent 協作日誌

此檔案供多個 Claude agent 共同讀寫，協調工作進度。
格式：每條記錄包含時間戳、agent 名稱、動作類型與說明。

---

## 規則
- 每個 agent 在開始任務前先寫入 `[START]` 記錄
- 完成任務後寫入 `[DONE]` 記錄
- 遇到問題寫入 `[BLOCK]` 記錄，讓另一 agent 協助
- 讀取此檔案了解目前狀態，避免衝突

---

## 記錄

### [2026-05-31 14:08] Agent-A (主建置) [DONE]
**任務**：建置 Self-growth 專案並部署至 localhost  
**結果**：
- 伺服器已通過 PM2 在 `http://localhost:3000` 運行
- 使用 `dist/index.js`（TypeScript 已編譯）
- 資料庫：`./data/selfgrowth.db`（SQLite）

**目前 API 端點**：
- `GET  /api/health` — 健康檢查
- `GET  /api/daily` — 今日挑戰 + 使用者資料
- `POST /api/daily/checkin` — 打卡（body: mood, reflection）
- `GET  /api/daily/history` — 打卡歷史
- `GET  /api/goals` — 目標列表
- `POST /api/goals` — 新增目標
- `PUT  /api/goals/:id` — 更新目標
- `DELETE /api/goals/:id` — 刪除目標
- `GET  /api/habits` — 習慣列表
- `POST /api/habits` — 新增習慣
- `POST /api/habits/:id/log` — 習慣打卡
- `GET  /api/habits/:id/logs` — 打卡記錄
- `DELETE /api/habits/:id` — 停用習慣
- `GET  /api/journal` — 日記列表
- `POST /api/journal` — 新增日記
- `PUT  /api/journal/:id` — 更新日記
- `DELETE /api/journal/:id` — 刪除日記
- `GET  /api/stats` — 統計數據

**重要檔案**：
```
src/
  index.ts           — Express 主程式
  db/database.ts     — SQLite 初始化（所有資料表）
  routes/daily.ts    — 每日挑戰路由
  routes/goals.ts    — 目標管理路由
  routes/habits.ts   — 習慣管理路由
  routes/journal.ts  — 日記路由
  routes/stats.ts    — 統計路由
  modules/
    gamification.ts  — 等級/XP/成就系統
    emailService.ts  — Gmail 通知
    scheduler.ts     — Cron 排程
  data/
    challenges.ts    — 60 個挑戰題庫
    quotes.ts        — 激勵名言庫
public/
  index.html         — 前端 SPA
  css/style.css      — 深色主題樣式
  js/app.js          — 前端邏輯
```

**PM2 管理指令**：
```bash
pm2 status               # 查看狀態
pm2 logs self-growth     # 查看日誌
pm2 restart self-growth  # 重啟
pm2 stop self-growth     # 停止
```

**更新程式碼後重新部署**：
```bash
npx tsc && pm2 restart self-growth
```

---

---

### [2026-06-01 00:30] Agent-A (主建置) [DONE]
**任務**：新增 AI 週報功能 + ngrok 對外公開

**新增端點**：
- `GET  /api/weekly-report` — 取得所有週報
- `GET  /api/weekly-report/latest` — 取得最新週報
- `POST /api/weekly-report/generate` — 手動觸發生成

**新增模組**：
- `src/modules/weeklyEval.ts` — Gemini API 呼叫、資料蒐集、週報生成
- `src/routes/weeklyReport.ts` — 週報 API 路由

**資料庫新表**：
- `weekly_reports`（id, week_start, week_end, persona_title, persona_description, highlights, blind_spots, patterns, next_week_focus, score, raw_data, full_report, created_at）

**排程**：每週日 20:00 自動觸發 `generateWeeklyReport()`

**環境變數**：需在 `.env` 填入 `GEMINI_API_KEY`
取得：https://aistudio.google.com/app/apikey

**ngrok 對外公開**：
```bash
# 啟動 ngrok（需先登入：ngrok config add-authtoken <token>）
ngrok http 3000
```

---

### [2026-06-01 10:20] Agent-A (主建置) [DONE]
**任務**：加入「額外成就記錄」功能

**新增端點**：
- `GET  /api/extra/today` — 取得今日額外成就
- `GET  /api/extra/recent` — 取得近 30 天
- `POST /api/extra` — 新增（body: title, category, difficulty, note）
- `DELETE /api/extra/:id` — 刪除並退回 XP

**資料庫新表**：`extra_logs`（id, title, category, difficulty, xp_earned, note, completed_at）

**XP 規則**：難度 1=+20 / 2=+40 / 3=+70，直接加入 user_profile.total_xp

**AI 週報更新**：`weeklyEval.ts` 已加入 extra_logs 資料段，Gemini 分析時可看到本週所有額外成就

**前端**：今日頁面新增「⚡ 今日額外成就」區塊，含新增 Modal 與刪除功能

<!-- Agent-B 請在此下方加入記錄 -->
