# CLAUDE.md - Project Context & Rules

## Project Overview
- **Name**: Self-growth
- **Repository**: https://github.com/masterfeng123/Self-growth.git
- **Primary Objective**: Personal growth management system with a focus on local server deployment and automated workflows.

## Environment & Tech Stack
- **Languages**: TypeScript / JavaScript
- **Runtime**: Node.js v22
- **Frontend**: Vanilla JS + HTML + CSS（無框架）
- **Database**: SQLite（better-sqlite3），資料檔位於 `data/selfgrowth.db`
- **AI**: Google Gemini API（`gemini-3.1-flash-lite`）
- **Process Manager**: PM2
- **Deployment**: Local Server, port 3000

## Development Guidelines
- **Communication**: Always respond in **Traditional Chinese (繁體中文)**.
- **Code Style**: Maintain consistency with the existing codebase. Use clear, descriptive variable names.
- **Robustness**: Implement proper error handling (`try/catch`) for all asynchronous operations.
- **Architecture**: Follow First Principles. Keep logic modular and avoid unnecessary dependencies.

## Key Commands
- **Install Dependencies**: `npm install`
- **Build Project**: `npx tsc`
- **Restart Server**: `pm2 restart self-growth --update-env`
- **View Logs**: `pm2 logs self-growth --lines 30 --nostream`
- **Git Push**: `git add .; git commit -m '...'; git push origin main`

## PM2 啟動指令
```bash
pm2 start dist/index.js --name "self-growth"
```

## Project Structure
```
src/
  index.ts              — Express 主程式（port 3000）
  db/database.ts        — SQLite 初始化（所有資料表）
  utils/date.ts         — 換日工具（DAY_START_HOUR=6，早上 6:00 換日）
  routes/
    daily.ts            — 每日挑戰
    goals.ts            — 目標瀑布（horizon: life/10yr/5yr/1yr/1mo/1wk/mit）
    habits.ts           — 習慣追蹤
    journal.ts          — 成長日記
    stats.ts            — 統計
    extra.ts            — 額外成就
    projects.ts         — 專案監控（含 Debug Log 整合）
    debugLogs.ts        — Debug Log
    calendar.ts         — 行事曆
    weeklyReport.ts     — AI 週報
    ai.ts               — AI 助理
    usage.ts            — API 使用量（Gemini + Claude OAuth）
    achievements.ts     — 成就系統
  modules/
    gamification.ts     — XP / 等級 / 成就
    geminiAgent.ts      — Gemini AI 助理（gemini-3.1-flash-lite，5 組 key 輪替）
    weeklyEval.ts       — AI 週報生成（gemini-3.1-flash-lite）
    claudeOAuthUsage.ts — Claude Pro/Max 用量（OAuth token，api.anthropic.com）
    scheduler.ts        — Cron 排程（06:00 換日）
    emailService.ts     — Gmail 通知
public/
  index.html            — 前端 SPA
  css/style.css
  js/app.js
```

## 重要架構決策

### 換日邏輯
- 換日時間：**早上 6:00**（非午夜）
- 統一由 `src/utils/date.ts` 管理：
  - `appToday()` → JS 用
  - `SQL_TODAY` → SQLite 查詢用（`date('now','localtime','-6 hours')`）
- 修改換日時間只需改 `DAY_START_HOUR` 常數

### Gemini API
- 模型：`gemini-3.1-flash-lite`（AI 助理和週報都用這個）
- Key 輪替：讀取 `GEMINI_API_KEY`, `GEMINI_KEY_1~4`（共 5 組）
- 用量記錄在 `api_usage_logs` 資料表

### Claude OAuth 用量
- 端點：`https://api.anthropic.com/api/oauth/usage`（非 claude.ai）
- Auth：`Authorization: Bearer <accessToken>`（需加 `anthropic-version: 2023-06-01`）
- Token 來源：`~/.claude/.credentials.json` → `claudeAiOauth.accessToken`
- Token 每 ~5 小時過期，過期後需 `claude login` 更新
- 60 秒 in-memory cache 避免頻繁呼叫
- **已知限制**：OAuth refresh（`client_id`）尚未實作，需靠 Claude Code 更新 credentials

### 資料庫遷移
- 使用 `safeAlter()` 安全新增欄位（已存在時靜默跳過）
- 所有 `CREATE TABLE` 使用 `IF NOT EXISTS`

### 前端效能
- **禁用** `backdrop-filter`（CPU 無 GPU 時極耗效能）
- **禁用** 無限 CSS animation（同樣原因）
- CDN 腳本（marked.js, highlight.js）用 `defer` 移至 body 底部
- Debug Log 預覽預設**關閉**，手動切換才渲染（避免打字卡頓）

## .env 必填項目
```
PORT=3000
DB_PATH=./data/selfgrowth.db
GEMINI_API_KEY=...
GEMINI_KEY_1=...   # 選填，AI 輪替用
GEMINI_KEY_2=...
GEMINI_KEY_3=...
GEMINI_KEY_4=...
EMAIL_USER=...     # Gmail，選填
EMAIL_PASS=...
EMAIL_TO=...
```

## .gitignore 重要排除項
```
node_modules/
dist/
data/          ← 使用者資料（SQLite）不上傳
.env           ← API 金鑰不上傳
.claude/       ← Claude Code 設定（含 OAuth token）不上傳
```

## 已實作功能清單
| 功能 | 路由 | 說明 |
|------|------|------|
| 每日挑戰 | `/api/daily` | 60 個挑戰輪播，打卡得 XP |
| 目標瀑布 | `/api/goals` | life→10yr→5yr→1yr→1mo→1wk→MIT 層級 |
| 習慣追蹤 | `/api/habits` | 連勝、打卡記錄 |
| 成長日記 | `/api/journal` | 心情 1-5 分 |
| 額外成就 | `/api/extra` | 難度 1/2/3 對應 +20/40/70 XP |
| 專案監控 | `/api/projects` | 里程碑、進度日誌 + Debug Log 整合 |
| Debug Log | `/api/debug-logs` | Markdown、嚴重度、連結專案 |
| 行事曆 | `/api/calendar` | 月曆 + 時間線，支援多天行程 |
| AI 週報 | `/api/weekly-report` | 每週日 20:00 自動生成 |
| AI 助理 | `/api/ai/chat` | Gemini function calling，8 個工具 |
| Claude 用量 | `/api/usage/claude/oauth` | 5h/7d 用量視窗 |
| 今日面板 | `/api/calendar/upcoming` | 近 7 天行程 + 目標截止提醒 |

## GitHub
- Branch：`main`
- 推送前確認 `.env`、`data/`、`.claude/` 不在 staged 檔案內
