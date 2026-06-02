# Self-growth

個人成長管理系統，基於 Node.js + TypeScript + SQLite，部署於本地伺服器（中立環境）。

---

## 架構快覽

```
src/
├── index.ts                  # Express 入口，掛載所有路由
├── db/
│   └── database.ts           # SQLite (better-sqlite3) schema & 初始化
├── modules/
│   ├── gamification.ts       # 等級/XP/成就定義與計算邏輯
│   ├── emailService.ts       # 發送郵件（週報等）
│   ├── scheduler.ts          # 排程任務
│   ├── weeklyEval.ts         # 週評分析邏輯
│   ├── geminiAgent.ts        # Gemini AI 整合
│   └── claudeUsageScraper.ts # Claude 用量抓取
├── routes/
│   ├── daily.ts              # 每日挑戰（完成 → 發 XP + 觸發成就）
│   ├── achievements.ts       # 成就列表與進度
│   ├── habits.ts             # 習慣追蹤
│   ├── journal.ts            # 日誌
│   ├── goals.ts              # 目標管理（支援 horizon / parent_id / mit_date）
│   ├── projects.ts           # 專案 + 里程碑 + 日誌
│   ├── stats.ts              # 統計總覽
│   ├── weeklyReport.ts       # 週報生成與查詢
│   ├── extra.ts              # 額外自主活動記錄
│   ├── ai.ts                 # AI 對話路由
│   ├── usage.ts              # API 用量查詢
│   └── debugLogs.ts          # 開發除錯日誌
└── data/
    ├── challenges.ts         # 挑戰題庫（Category: mind/body/skills/social/creativity/reflection）
    └── quotes.ts             # 每日佳句
```

---

## 資料庫表

| 表名 | 用途 |
|---|---|
| `user_profile` | 單一使用者（streak、total_xp、longest_streak、achievements JSON） |
| `challenge_logs` | 每日挑戰完成紀錄（challenge_id、mood、reflection、xp_earned） |
| `goals` | 目標（status: active/completed、horizon、priority、parent_id） |
| `habits` / `habit_logs` | 習慣定義與打卡紀錄 |
| `journal_entries` | 日誌（title、content、mood、tags） |
| `extra_logs` | 自主額外活動（category、difficulty、xp_earned） |
| `weekly_reports` | AI 生成週報（persona、highlights、blind_spots、score） |
| `projects` / `project_milestones` / `project_logs` | 專案管理 |
| `api_usage_logs` / `claude_usage_manual` | API 用量追蹤 |
| `debug_logs` | 開發除錯紀錄（severity、tags、project_id） |

---

## 遊戲化系統（gamification.ts）

### XP & 等級
- 每級所需 XP：`100 + (level - 1) × 50`
- 等級名稱：種子(1) → 幼苗(3) → 嫩芽(5) → 小樹(8) → 茁壯(12) → 精進(17) → 強壯(23) → 精通(30) → 大師(40) → 傳說(50)

### 成就（共 48 個）

| 分類 | ID 範例 | 說明 |
|---|---|---|
| 入門 | `first-step` | 完成第一個挑戰 |
| 連勝 | `streak-3/7/14/30/100/200/365` | 連續天數 |
| 等級 | `level-5/10/20/30/40/50` | 達到等級 |
| 挑戰量 | `challenges-10/50/100/500` | 累計完成數 |
| 類別初階 | `{cat}-x3` | 各類別完成3個 |
| 類別精通 | `{cat}-x10` | 各類別完成10個 |
| 全才 | `all-categories` / `all-x10` | 全類別覆蓋 |
| 日誌 | `journal-first/30/100` | 累計篇數 |
| 目標 | `goal-first` / `goal-10` | 已完成目標數 |
| 習慣 | `habit-100` | 累計打卡100次 |
| 最長連勝 | `longest-30` | 歷史最長連勝達30天 |

成就在每次完成挑戰時由 `daily.ts` 呼叫 `checkAchievements()` 觸發。

---

## 啟動方式

```bash
npm install
npm run dev      # 開發模式（nodemon）
npm run build    # 編譯 TypeScript
npm start        # 生產啟動
```

PM2 持久化：
```bash
pm2 start npm --name "self-growth" -- run start
```

`.env` 參考 `.env.example` 設定（DB_PATH、郵件、API Key 等）。

---

## API 路由總覽

| Method | Path | 說明 |
|---|---|---|
| GET | `/api/daily` | 取得今日挑戰 |
| POST | `/api/daily/complete` | 完成挑戰（body: challenge_id, mood, reflection） |
| GET | `/api/achievements` | 成就列表與進度 |
| GET/POST | `/api/habits` | 習慣列表 / 新增 |
| POST | `/api/habits/:id/log` | 習慣打卡 |
| GET/POST | `/api/journal` | 日誌列表 / 新增 |
| GET/POST | `/api/goals` | 目標列表 / 新增 |
| PATCH | `/api/goals/:id` | 更新目標（含 status 設為 completed） |
| GET/POST | `/api/projects` | 專案列表 / 新增 |
| GET | `/api/stats` | 統計總覽 |
| GET/POST | `/api/weekly-report` | 週報查詢 / 生成 |
| POST | `/api/extra` | 新增額外活動 |
| GET | `/api/usage` | API 用量查詢 |
