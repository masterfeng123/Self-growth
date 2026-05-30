const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = path.join(__dirname, 'demo');

// Pages to screenshot — we inject localStorage to simulate having data
const PAGES = [
  { name: '01-today', hash: '#today', label: '今日頁面' },
  { name: '02-dashboard', hash: '#dashboard', label: '儀表板' },
  { name: '03-growth-map', hash: '#growth', label: '征途地圖' },
  { name: '04-network', hash: '#network', label: '人脈本' },
  { name: '05-weekly-review', hash: '#review', label: '週覆盤' },
  { name: '06-stabilizer', hash: '#stabilizer', label: '穩定器模式' },
];

// Seed data to make screenshots look meaningful
const SEED_DATA = {
  'self-growth-2040': JSON.stringify({
    state: {
      profile: {
        name: '征途者',
        birthYear: 2003,
        targetAge: 40,
        targetIncome: 25000000,
        field: '科技',
        currentPhase: 1,
      },
      dailyLogs: {
        '2026-05-24': { date: '2026-05-24', energy: 8, focus: '完成作品集首頁', pillars: { learning: { done: true, minutes: 90, notes: '讀完 React 官方文件' }, networking: { done: true, count: 2, notes: '加了兩位工程師 LinkedIn' }, deepWork: { done: true, minutes: 120, notes: '專注寫 portfolio' }, knowledge: { done: true, items: 3, notes: '聽了3集 Lex Fridman' } }, mood: 'great', reflection: '今天狀態很好，深度工作成效高', completed: true },
        '2026-05-25': { date: '2026-05-25', energy: 6, focus: '準備面試', pillars: { learning: { done: true, minutes: 60, notes: 'LeetCode 2題' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 90, notes: '模擬面試' }, knowledge: { done: false, items: 0, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-26': { date: '2026-05-26', energy: 4, focus: '休息', pillars: { learning: { done: false, minutes: 0, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: false, minutes: 0, notes: '' }, knowledge: { done: true, items: 2, notes: '' } }, mood: 'rough', reflection: '', completed: true },
        '2026-05-27': { date: '2026-05-27', energy: 7, focus: '建立個人品牌', pillars: { learning: { done: true, minutes: 45, notes: '' }, networking: { done: true, count: 1, notes: '參加 meetup' }, deepWork: { done: false, minutes: 0, notes: '' }, knowledge: { done: true, items: 4, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-28': { date: '2026-05-28', energy: 9, focus: '寫技術文章', pillars: { learning: { done: true, minutes: 120, notes: '深讀演算法' }, networking: { done: true, count: 3, notes: '發文獲得互動' }, deepWork: { done: true, minutes: 150, notes: '寫完一篇完整文章' }, knowledge: { done: true, items: 5, notes: '' } }, mood: 'great', reflection: '有產出的一天最快樂', completed: true },
        '2026-05-29': { date: '2026-05-29', energy: 7, focus: '開源專案貢獻', pillars: { learning: { done: true, minutes: 60, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 100, notes: 'PR merged' }, knowledge: { done: true, items: 2, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-30': { date: '2026-05-30', energy: 7, focus: '完成自我成長系統', pillars: { learning: { done: true, minutes: 45, notes: '學 Tailwind 進階' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 90, notes: '建構 app' }, knowledge: { done: false, items: 0, notes: '' } }, mood: 'focused', reflection: '', completed: false },
      },
      contacts: [
        { id: '1', name: '王志明', category: 'mentor', context: 'YC 校友，做 AI 創業', platform: 'LinkedIn', followUpDate: '2026-06-05', notes: '介紹了很多矽谷生態', createdAt: '2026-05-10' },
        { id: '2', name: 'Sarah Chen', category: 'tech', context: '前 Google 工程師，現在 Stripe', platform: 'Twitter', followUpDate: '2026-06-15', notes: '分享了 system design 資源', createdAt: '2026-05-15' },
        { id: '3', name: '林俊宇', category: 'peer', context: '台大資工，一起準備找工作', platform: 'IG', followUpDate: '', notes: '', createdAt: '2026-05-20' },
        { id: '4', name: '陳美玲', category: 'biz', context: 'VC 分析師，關注 fintech', platform: 'LinkedIn', followUpDate: '2026-05-28', notes: '想了解我的側業', createdAt: '2026-05-22' },
      ],
      weeklyReviews: {
        '2026-W22': { weekKey: '2026-W22', rating: 7, win: '完成第一篇技術文章，獲得200個讚', lesson: '深度工作時間還不夠穩定，下午容易分心', pillarReview: '知識輸入最強，人脈最弱，要主動出擊', nextFocus: '完成 portfolio 網站並部署', energyManagement: '早上9-11最有效率，應該保護這段時間' },
      },
    },
    version: 1,
  }),
};

async function takeScreenshots() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // Load app first to initialize localStorage context
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Inject seed data
  await page.evaluate((data) => {
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
  }, SEED_DATA);

  for (const { name, hash, label } of PAGES) {
    console.log(`📸 Capturing: ${label}`);

    if (hash === '#stabilizer') {
      // Inject page state for stabilizer
      await page.evaluate(() => {
        window.__stabilizerMode = true;
      });
      // Navigate to today first, then click stabilizer button
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.evaluate((data) => {
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      }, SEED_DATA);
      await page.reload();
      await page.waitForTimeout(1500);
      // Click stabilizer button
      const stabBtn = page.locator('button:has-text("需要穩一下"), button:has-text("需要穩定一下")').first();
      if (await stabBtn.isVisible()) {
        await stabBtn.click();
        await page.waitForTimeout(1000);
      }
    } else {
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.evaluate((data) => {
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
      }, SEED_DATA);
      await page.reload();
      await page.waitForTimeout(1500);

      // Click the nav item
      const navLabel = { '#today': '今日', '#dashboard': '儀表板', '#growth': '征途', '#network': '人脈', '#review': '覆盤' }[hash];
      if (navLabel) {
        const navBtn = page.locator(`button:has-text("${navLabel}")`).first();
        if (await navBtn.isVisible()) {
          await navBtn.click();
          await page.waitForTimeout(800);
        }
      }
    }

    await page.screenshot({
      path: path.join(OUT_DIR, `${name}.png`),
      fullPage: false,
    });
    console.log(`  ✅ Saved ${name}.png`);
  }

  // Also take desktop-size screenshots for dashboard and growth map
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto(BASE_URL);
  await desktopPage.waitForLoadState('networkidle');
  await desktopPage.evaluate((data) => {
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
  }, SEED_DATA);
  await desktopPage.reload();
  await desktopPage.waitForTimeout(1500);

  for (const { navText, filename } of [
    { navText: '今日', filename: '07-desktop-today.png' },
    { navText: '儀表板', filename: '08-desktop-dashboard.png' },
    { navText: '征途', filename: '09-desktop-growth.png' },
  ]) {
    const btn = desktopPage.locator(`button:has-text("${navText}")`).first();
    if (await btn.isVisible()) {
      await btn.click();
      await desktopPage.waitForTimeout(800);
    }
    await desktopPage.screenshot({ path: path.join(OUT_DIR, filename) });
    console.log(`  ✅ Saved ${filename}`);
  }

  await browser.close();
  console.log('\n🎉 All screenshots saved to demo/');
}

takeScreenshots().catch(console.error);
