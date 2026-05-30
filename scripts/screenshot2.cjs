const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:5174';
const OUT_DIR = '/home/user/Self-growth/demo';

const SEED_DATA = {
  'self-growth-2040': JSON.stringify({
    state: {
      profile: { name: '征途者', birthYear: 2003, targetAge: 40, targetIncome: 25000000, field: '科技', currentPhase: 1 },
      dailyLogs: {
        '2026-05-24': { date: '2026-05-24', energy: 8, focus: '完成作品集首頁', pillars: { learning: { done: true, minutes: 90, notes: '讀完React官方文件' }, networking: { done: true, count: 2, notes: '加了兩位工程師LinkedIn' }, deepWork: { done: true, minutes: 120, notes: '專注寫portfolio' }, knowledge: { done: true, items: 3, notes: '聽了3集Lex Fridman' } }, mood: 'great', reflection: '今天狀態很好', completed: true },
        '2026-05-25': { date: '2026-05-25', energy: 6, focus: '準備面試', pillars: { learning: { done: true, minutes: 60, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 90, notes: '' }, knowledge: { done: false, items: 0, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-26': { date: '2026-05-26', energy: 4, focus: '', pillars: { learning: { done: false, minutes: 0, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: false, minutes: 0, notes: '' }, knowledge: { done: true, items: 2, notes: '' } }, mood: 'rough', reflection: '', completed: true },
        '2026-05-27': { date: '2026-05-27', energy: 7, focus: '建立個人品牌', pillars: { learning: { done: true, minutes: 45, notes: '' }, networking: { done: true, count: 1, notes: '參加meetup' }, deepWork: { done: false, minutes: 0, notes: '' }, knowledge: { done: true, items: 4, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-28': { date: '2026-05-28', energy: 9, focus: '寫技術文章', pillars: { learning: { done: true, minutes: 120, notes: '' }, networking: { done: true, count: 3, notes: '' }, deepWork: { done: true, minutes: 150, notes: '' }, knowledge: { done: true, items: 5, notes: '' } }, mood: 'great', reflection: '', completed: true },
        '2026-05-29': { date: '2026-05-29', energy: 7, focus: '開源貢獻', pillars: { learning: { done: true, minutes: 60, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 100, notes: '' }, knowledge: { done: true, items: 2, notes: '' } }, mood: 'good', reflection: '', completed: true },
        '2026-05-30': { date: '2026-05-30', energy: 7, focus: '完成自我成長系統', pillars: { learning: { done: true, minutes: 45, notes: '' }, networking: { done: false, count: 0, notes: '' }, deepWork: { done: true, minutes: 90, notes: '' }, knowledge: { done: false, items: 0, notes: '' } }, mood: 'focused', reflection: '', completed: false },
      },
      contacts: [
        { id: '1', name: '王志明', category: 'mentor', context: 'YC校友，做AI創業', platform: 'LinkedIn', followUpDate: '2026-06-05', notes: '', createdAt: '2026-05-10' },
        { id: '2', name: 'Sarah Chen', category: 'tech', context: '前Google工程師', platform: 'Twitter', followUpDate: '2026-06-15', notes: '', createdAt: '2026-05-15' },
        { id: '3', name: '林俊宇', category: 'peer', context: '台大資工', platform: 'IG', followUpDate: '', notes: '', createdAt: '2026-05-20' },
        { id: '4', name: '陳美玲', category: 'biz', context: 'VC分析師', platform: 'LinkedIn', followUpDate: '2026-05-28', notes: '', createdAt: '2026-05-22' },
      ],
      weeklyReviews: { '2026-W22': { weekKey: '2026-W22', rating: 7, win: '完成第一篇技術文章', lesson: '深度工作時間不穩定', pillarReview: '', nextFocus: '完成portfolio並部署', energyManagement: '' } },
    },
    version: 1,
  }),
};

async function go() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  async function shot(ctx, navText, filename) {
    const page = await ctx.newPage();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.evaluate((d) => Object.entries(d).forEach(([k,v]) => localStorage.setItem(k,v)), SEED_DATA);
    await page.reload();
    await page.waitForTimeout(1200);
    if (navText) {
      const btn = page.locator(`button:has-text("${navText}")`).first();
      if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(700); }
    }
    await page.screenshot({ path: path.join(OUT_DIR, filename) });
    console.log('✅', filename);
    await page.close();
  }

  // Mobile (390×844 @2x)
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await shot(mob, null,    '01-today.png');
  await shot(mob, '儀表板', '02-dashboard.png');
  await shot(mob, '征途',   '03-growth-map.png');
  await shot(mob, '人脈',   '04-network.png');
  await shot(mob, '覆盤',   '05-weekly-review.png');

  // Stabilizer
  const stabPage = await mob.newPage();
  await stabPage.goto(BASE_URL);
  await stabPage.waitForLoadState('networkidle');
  await stabPage.evaluate((d) => Object.entries(d).forEach(([k,v]) => localStorage.setItem(k,v)), SEED_DATA);
  await stabPage.reload();
  await stabPage.waitForTimeout(1200);
  const stabBtn = stabPage.locator('button:has-text("需要穩一下")').first();
  if (await stabBtn.isVisible()) { await stabBtn.click(); await stabPage.waitForTimeout(800); }
  await stabPage.screenshot({ path: path.join(OUT_DIR, '06-stabilizer.png') });
  console.log('✅ 06-stabilizer.png');
  await stabPage.close();

  // Desktop (1280×800)
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  await shot(desk, null,    '07-desktop-today.png');
  await shot(desk, '儀表板', '08-desktop-dashboard.png');
  await shot(desk, '征途',   '09-desktop-growth.png');

  await browser.close();
  console.log('\n🎉 All done');
}
go().catch(console.error);
