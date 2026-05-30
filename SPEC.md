# 征途 2040 — 產品規格書

**版本：** v1.0  
**日期：** 2026-05-30  
**作者：** 征途者  

---

## 一、產品概述

### 1.1 產品名稱
**征途 2040**（Self-Growth System 2040）

### 1.2 一句話定義
一套個人成長追蹤系統，幫助 20 歲出頭的科技學生，透過每日習慣記錄、人脈管理與長期路線圖，走向 40 歲年薪 2,500 萬的目標。

### 1.3 核心問題
| 問題 | 現況 |
|------|------|
| 方向不清晰 | 知道要往科技走，但不知道每天該做什麼 |
| 人脈資本不足 | 缺少業界連結，不知道從哪裡突破 |
| 心理健康脆弱 | 壓力大時容易幼化退縮，中斷進度 |
| 缺乏長期視角 | 只看眼前，不知道現在的努力對應哪個未來 |

### 1.4 解決方案
- **每日四支柱打卡**：把「成長」拆解成可執行的每日行動
- **征途地圖**：把 40 歲的目標拆解成五個人生階段，讓今天的努力有座標
- **穩定器模式**：當崩潰時有一個緊急出口，不是更多壓力，而是重新穩定的儀式
- **人脈本**：系統化管理每一個有價值的連結

---

## 二、目標用戶

### 2.1 主要用戶畫像

| 維度 | 描述 |
|------|------|
| 年齡 | 20–25 歲 |
| 身份 | 在讀大學生 / 剛畢業社會新鮮人 |
| 領域 | 科技相關（軟體、AI、產品、創業） |
| 目標 | 40 歲達到財務自由，年薪 2,500 萬以上 |
| 核心障礙 | 缺乏人脈與資源、方向不夠清晰 |
| 心理特徵 | 高壓時容易退縮（幼化），需要有溫度的系統而非冷冰冰的 KPI |

### 2.2 使用情境
- **早晨**：打開今日頁面，確認今天最重要的一件事
- **執行中**：完成一個支柱後打勾，記錄數據
- **晚上**：完成每日反思，結算今日
- **週日**：做週覆盤，回顧成長
- **崩潰時**：點穩定器，重新找回狀態
- **認識新人後**：立刻加進人脈本，設定追蹤提醒

---

## 三、功能規格

### 3.1 今日頁面（Today）

**目的：** 每日行動的起點與終點

| 元素 | 規格 |
|------|------|
| 問候語 | 依早/午/晚顯示不同文案 |
| 連線天數 | 顯示當前連線 streak，有完整支柱才算有效天 |
| 今日完成度 | 4 支柱完成比例，進度條動態顯示 |
| 能量值 | 滑桿 1–10，記錄當天精神狀態 |
| 今日焦點 | 只填一件事，降低認知負擔 |
| 四大支柱卡片 | 每張可展開填數量與備註 |
| 心情選擇 | 5 種狀態，含崩潰選項（連動穩定器提示） |
| 今日反思 | 自由文字，選填 |
| 結算按鈕 | 至少完成一個支柱才可點擊 |
| 穩定器入口 | 低調按鈕，隨時可進入 |

**四大支柱定義：**

| 支柱 | 說明 | 記錄單位 |
|------|------|----------|
| 📚 學習成長 | 課程、技能練習、刷題、閱讀 | 分鐘 |
| 🤝 人脈經營 | 認識新人、維繫關係、參加活動 | 次互動 |
| 🎯 深度工作 | 無干擾、高專注的實質產出 | 分鐘 |
| 💡 知識輸入 | Podcast、技術文章、影片、書 | 則 |

**狀態流程：**
```
未開始 → 進行中（任一支柱打勾）→ 已結算（點結算按鈕）
```

---

### 3.2 儀表板（Dashboard）

**目的：** 數據化呈現成長趨勢，提供客觀回饋

| 圖表 | 說明 |
|------|------|
| 四格統計卡 | 連線天數、累積完成天數、本週平均分、人脈總計 |
| 近7日得分長條圖 | 每日四支柱完成度加總（滿分100） |
| 近7日能量趨勢折線圖 | 每日能量值波動，找規律 |
| 四支柱雷達圖 | 本週各支柱完成率，視覺化強弱 |
| 支柱達成次數 | 橫向進度條，7天中完成幾天 |

**每日分數計算：**
```
每支柱完成 = 25 分
滿分 = 100 分（4支柱全完成）
```

---

### 3.3 征途地圖（Growth Map）

**目的：** 讓今天的努力在 40 年的棋盤上有位置

**五個人生階段：**

| 階段 | 年齡 | 主題 | 年收目標 |
|------|------|------|----------|
| 探索期 | 21–25歲 | 找到方向，打好基礎 | — |
| 起步期 | 25–28歲 | 進入頂尖公司或創業 | 100 萬 |
| 深化期 | 28–32歲 | 成為領域專家 | 300 萬 |
| 躍升期 | 32–36歲 | 管理或創業，規模化 | 1,000 萬 |
| 衝刺期 | 36–40歲 | 財務自由門口 | 2,500 萬 |

**每個階段包含：**
- 5 個里程碑（milestone）
- 一句核心洞見
- 當前階段有 90 天聚焦建議

**視覺設計：**
- 整體進度條：從21歲到40歲，標記當前年齡位置
- 已完成階段：降低透明度
- 未解鎖階段：加鎖圖示

---

### 3.4 人脈本（Network）

**目的：** 系統化管理每一個有價值的人際連結

**聯絡人欄位：**

| 欄位 | 類型 | 說明 |
|------|------|------|
| 姓名 | 文字（必填） | — |
| 關係類型 | 選擇 | 導師/同儕/技術圈/商業圈/投資人/其他 |
| 認識情境 | 文字 | 在哪裡認識、對方做什麼 |
| 平台 | 文字 | LinkedIn、IG、Email 等 |
| 追蹤日期 | 日期 | 下次應該聯繫的日期 |
| 備註 | 文字 | 對方強項、共同話題 |

**追蹤提醒：**
- 追蹤日期到期或過期 → 頁面頂部顯示紅色警告
- 展開聯絡人卡片可看到完整資訊

**篩選功能：**
- 全文搜尋（姓名 / 情境）
- 按關係類型篩選

---

### 3.5 週覆盤（Weekly Review）

**目的：** 每週一次結構化的成長反思，加速學習迴圈

**本週數據快覽：**
- 有效天數（有完成任一支柱）
- 平均日分數
- 總支柱達成次數
- 四支柱每日完成格（類日曆熱圖）

**評分滑桿：** 1–10分，附上對應的教練文字回饋

**五個結構化問題：**

| # | 問題 | 目的 |
|---|------|------|
| 1 | 本週最大的贏 | 強化正向行為 |
| 2 | 本週最大的學習 | 固化教訓 |
| 3 | 四支柱回顧 | 找出薄弱環節 |
| 4 | 下週最重要的一件事 | 設定焦點 |
| 5 | 能量管理反思 | 找出最佳工作節奏 |

**儲存機制：** 每週一份記錄，以週次（YYYY-W##）為 key 儲存

---

### 3.6 穩定器模式（Stabilizer）

**目的：** 心理健康緊急出口——不是鞭策更多，而是重新穩定

**設計原則：**
- 進入後立刻脫離主 app 氛圍（獨立背景色）
- 不顯示任何 KPI、進度、待辦事項
- 語氣溫暖，不帶評判

**四個模組：**

| 模組 | 說明 |
|------|------|
| 你現在安全了 | 主標語，降低警戒心 |
| 你已經做到的事 | 自動抓取歷史數據（累積天數、連線天數、人脈數），提醒已有的成就 |
| 4-4-6 呼吸練習 | 吸氣4秒 → 屏住4秒 → 呼氣6秒，動態計時，激活副交感神經 |
| 一個微小的行動 | 隨機抽取8條低門檻行動，只要做一件就夠了 |

**結語：** 引言 + 「我準備好繼續了」按鈕，回到今日頁面

---

## 四、數據模型

### 4.1 儲存方式
所有資料儲存在瀏覽器 `localStorage`，key 為 `self-growth-2040`。

### 4.2 資料結構

```typescript
// 使用者設定
Profile {
  name: string           // 預設「征途者」
  birthYear: number      // 計算當前年齡
  targetAge: number      // 預設 40
  targetIncome: number   // 預設 25,000,000
  field: string          // 領域
  currentPhase: 1 | 2 | 3 | 4 | 5
}

// 每日記錄（key = YYYY-MM-DD）
DayLog {
  date: string
  energy: number         // 1–10
  focus: string          // 今日焦點
  pillars: {
    learning:   { done: boolean, minutes: number, notes: string }
    networking: { done: boolean, count: number,   notes: string }
    deepWork:   { done: boolean, minutes: number, notes: string }
    knowledge:  { done: boolean, items: number,   notes: string }
  }
  mood: 'great' | 'good' | 'neutral' | 'rough' | 'crashed'
  reflection: string
  completed: boolean     // 是否已結算
}

// 週覆盤（key = YYYY-W##）
WeeklyReview {
  weekKey: string
  rating: number         // 1–10
  win: string
  lesson: string
  pillarReview: string
  nextFocus: string
  energyManagement: string
}

// 聯絡人
Contact {
  id: string             // timestamp
  name: string
  category: 'mentor' | 'peer' | 'tech' | 'biz' | 'investor' | 'other'
  context: string
  platform: string
  followUpDate: string   // YYYY-MM-DD
  notes: string
  createdAt: string      // YYYY-MM-DD
}
```

### 4.3 計算邏輯

**連線天數（Streak）：**
```
從今天往回數，連續有 completed=true 的天數
今天未結算但有任一支柱完成，則今天算進去
```

**每日分數：**
```
每支柱 done=true → +25 分
滿分 = 100 分
```

**跟進提醒：**
```
contact.followUpDate <= today → 顯示紅色提醒
```

---

## 五、設計系統

### 5.1 設計哲學
參考 Linear、Raycast 的暗色極簡風格，核心原則：
- 背景不用純黑，用帶藍調近黑降低視覺疲勞
- 4–5 層表面顏色（微差），只用邊框，不用陰影
- 金色（#f59e0b）作為唯一強調色，呼應財富主題
- 動畫只操作 transform / opacity，不觸發 layout

### 5.2 色彩系統

| Token | 值 | 用途 |
|-------|----|------|
| bg-base | `#0c0c0e` | 頁面背景 |
| bg-surface | `#111113` | 側邊欄、面板 |
| bg-elevated | `#161618` | 卡片、輸入框 |
| bg-overlay | `#1c1c1f` | 下拉選單、彈窗 |
| bg-hover | `#212124` | Hover 狀態 |
| text-primary | `#f0f0f4` | 標題、重要文字 |
| text-body | `#c4c4cc` | 一般內文 |
| text-muted | `#909098` | 次要說明 |
| text-faint | `#5e5e68` | Label、中繼資料 |
| border | `#242729` | 卡片邊框 |
| gold-500 | `#f59e0b` | 主要強調色 |

### 5.3 字體
- 主體：**Inter** + Noto Sans TC（中文回退）
- 標題：`font-size: 20px, font-weight: 600, letter-spacing: -0.02em`
- 標籤：`font-size: 11px, font-weight: 500, text-transform: uppercase, letter-spacing: 0.07em`
- 內文：`font-size: 13–14px, font-weight: 400, line-height: 1.6`

### 5.4 動畫緩動曲線

| 變數 | 值 | 用途 |
|------|----|------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 彈性微互動 |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | 面板展開 |
| `--ease-snappy` | `cubic-bezier(0.4, 0, 0.2, 1)` | 快速狀態切換 |

### 5.5 響應式布局
- **桌面（≥768px）**：固定左側邊欄（208px）+ 內容區
- **手機（<768px）**：全螢幕內容 + 底部導航列（backdrop-blur）

---

## 六、技術架構

### 6.1 技術棧

| 層次 | 選擇 | 理由 |
|------|------|------|
| 框架 | React 18 | 組件化，生態豐富 |
| 建構工具 | Vite 5 | 開發體驗快，HMR 即時 |
| 樣式 | Tailwind CSS 3 + 內嵌 style | utility-first，複雜元件用 inline |
| 狀態管理 | Zustand + persist | 輕量，自動 localStorage 持久化 |
| 圖表 | Recharts | React 原生，支援 ResponsiveContainer |
| 圖示 | Lucide React | 一致的 1.75px 線條寬度 |
| 測試 / 截圖 | Playwright | 自動化截圖生成 demo 資料夾 |

### 6.2 目錄結構

```
Self-growth/
├── src/
│   ├── App.jsx                    # 路由（state-based）
│   ├── main.jsx                   # React 入口
│   ├── index.css                  # 全域樣式 + 設計 token
│   ├── store/
│   │   └── useStore.js            # Zustand store + 計算邏輯
│   ├── components/
│   │   └── Layout.jsx             # 側邊欄 + 底部導航
│   └── pages/
│       ├── TodayPage.jsx          # 今日
│       ├── DashboardPage.jsx      # 儀表板
│       ├── GrowthMapPage.jsx      # 征途地圖
│       ├── NetworkPage.jsx        # 人脈本
│       ├── WeeklyReviewPage.jsx   # 週覆盤
│       └── StabilizerPage.jsx     # 穩定器（全螢幕獨立模式）
├── demo/                          # app 截圖（手機 + 桌面）
├── scripts/                       # 截圖腳本
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.js
```

### 6.3 導航架構
```
App（useState 控制 currentPage）
├── Layout（側邊欄 / 底部導航）
│   ├── TodayPage
│   ├── DashboardPage
│   ├── GrowthMapPage
│   ├── NetworkPage
│   └── WeeklyReviewPage
└── StabilizerPage（全螢幕，跳出 Layout）
```

### 6.4 啟動方式
```bash
npm install
npm run dev      # 開發模式 http://localhost:5173
npm run build    # 生產建構輸出至 dist/
npm run preview  # 預覽生產版本
```

---

## 七、非功能需求

| 需求 | 目標 |
|------|------|
| 資料隱私 | 所有資料僅存本地，不上傳伺服器 |
| 離線可用 | 純前端，無網路仍可使用 |
| 載入速度 | FCP < 1 秒（Vite 生產建構 ~175KB gzip） |
| 手機體驗 | Mobile-first，底部導航觸控友善 |
| 無障礙 | 支援 prefers-reduced-motion |

---

## 八、未來路線圖

### v1.1 — 數據強化
- [ ] 每日提醒通知（PWA Push Notification）
- [ ] 月度/年度統計報告
- [ ] 習慣完成熱力圖（類 GitHub contribution graph）
- [ ] 能量與生產力的相關性分析

### v1.2 — 社交功能
- [ ] 匿名成長排行榜（連線天數）
- [ ] 和同儕互相分享本週覆盤
- [ ] 導師媒合系統

### v1.3 — AI 教練
- [ ] 每日 AI 教練對話（Claude API）
- [ ] 根據歷史數據生成個人化建議
- [ ] 崩潰模式智能偵測（連續低能量天 / 心情惡化趨勢）

### v2.0 — 跨裝置同步
- [ ] 後端（Supabase 或 Firebase）
- [ ] 帳號登入 + 多裝置同步
- [ ] 資料匯出（JSON / CSV）

---

## 附錄：截圖對照

| 檔案 | 頁面 |
|------|------|
| `demo/01-today.png` | 今日頁面（手機） |
| `demo/02-dashboard.png` | 儀表板（手機） |
| `demo/03-growth-map.png` | 征途地圖（手機） |
| `demo/04-network.png` | 人脈本（手機） |
| `demo/05-weekly-review.png` | 週覆盤（手機） |
| `demo/06-stabilizer.png` | 穩定器模式（手機） |
| `demo/07-desktop-today.png` | 今日頁面（桌面） |
| `demo/08-desktop-dashboard.png` | 儀表板（桌面） |
| `demo/09-desktop-growth.png` | 征途地圖（桌面） |
