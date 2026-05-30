const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:5176';
const OUT_DIR = path.join(__dirname, '..', 'demo');

const SEED_DATA = {
  'self-growth-2040': JSON.stringify({
    state: {
      profile: { name: '征途者', birthYear: 2003, targetAge: 40, targetIncome: 25000000, field: '科技', currentPhase: 1 },
      dailyLogs: {
        '2026-05-24': { date: '2026-05-24', energy: 8, focus: '完成作品集首頁', pillars: { learning: { done: true, minutes: 90, notes: '讀完React官方文件' }, networking: { done: true, count: 2, notes: '加了兩位工程師LinkedIn' }, deepWork: { done: true, minutes: 120, notes: '專注寫portfolio' }, knowledge: { done: true, items: 3, notes: '聽了3集Lex Fridman' } }, mood: 'great', reflection: '', completed: true },
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
      weeklyReviews: {
        '2026-W22': { weekKey: '2026-W22', rating: 7, win: '完成第一篇技術文章', lesson: '深度工作時間不穩定', pillarReview: '', nextFocus: '完成portfolio並部署', energyManagement: '' },
      },
      // Goal tree seed data
      goals: {
        'g1': { id: 'g1', parentId: null,  level: 0, title: '技術力突破',       pillar: null,       done: false, notes: '', createdAt: '2026-05-01' },
        'g2': { id: 'g2', parentId: 'g1',  level: 1, title: '學好系統設計',     pillar: null,       done: false, notes: '', createdAt: '2026-05-01' },
        'g3': { id: 'g3', parentId: 'g2',  level: 2, title: '讀完《DDIA》',     pillar: null,       done: false, notes: '', createdAt: '2026-05-02' },
        'g4': { id: 'g4', parentId: 'g3',  level: 3, title: '每週讀2章並寫筆記',  pillar: 'learning', done: false, notes: '', createdAt: '2026-05-02' },
        'g5': { id: 'g5', parentId: 'g4',  level: 4, title: '今天讀第3章，寫重點摘要', pillar: 'learning', done: false, notes: '', createdAt: '2026-05-30' },
        'g6': { id: 'g6', parentId: 'g3',  level: 3, title: 'LeetCode 每日一題',   pillar: 'deepWork', done: true,  notes: '', createdAt: '2026-05-03' },
        'g7': { id: 'g7', parentId: 'g1',  level: 1, title: '建立個人品牌',     pillar: null,       done: false, notes: '', createdAt: '2026-05-05' },
        'g8': { id: 'g8', parentId: 'g7',  level: 2, title: '技術部落格啟動',   pillar: null,       done: false, notes: '', createdAt: '2026-05-05' },
        'g9': { id: 'g9', parentId: 'g8',  level: 3, title: '完成第一篇文章',   pillar: 'knowledge', done: true,  notes: '', createdAt: '2026-05-10' },
        'g10':{ id: 'g10',parentId: 'g8',  level: 3, title: '每週發一篇',       pillar: 'deepWork', done: false, notes: '', createdAt: '2026-05-10' },
        'g11':{ id: 'g11',parentId: 'g10', level: 4, title: '寫完本週文章草稿', pillar: 'deepWork', done: false, notes: '', createdAt: '2026-05-30' },
        'g12':{ id: 'g12',parentId: null,  level: 0, title: '人脈資本擴展',     pillar: null,       done: false, notes: '', createdAt: '2026-05-06' },
        'g13':{ id: 'g13',parentId: 'g12', level: 1, title: '打進業界圈子',     pillar: null,       done: false, notes: '', createdAt: '2026-05-06' },
        'g14':{ id: 'g14',parentId: 'g13', level: 2, title: '參加3個技術meetup', pillar: null,       done: false, notes: '', createdAt: '2026-05-07' },
        'g15':{ id: 'g15',parentId: 'g14', level: 3, title: '下週參加 JSConf',  pillar: 'networking',done: false, notes: '', createdAt: '2026-05-07' },
        'g16':{ id: 'g16',parentId: 'g15', level: 4, title: '今天確認報名並準備自我介紹', pillar: 'networking', done: false, notes: '', createdAt: '2026-05-30' },
      },
      goalRoots: ['g1', 'g12'],
    },
    version: 1,
  }),
};

async function shot(ctx, navText, filename) {
  const page = await ctx.newPage();
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.evaluate((d) => Object.entries(d).forEach(([k,v]) => localStorage.setItem(k,v)), SEED_DATA);
  await page.reload();
  await page.waitForTimeout(1300);
  if (navText) {
    const btn = page.locator(`button:has-text("${navText}")`).first();
    if (await btn.isVisible()) { await btn.click(); await page.waitForTimeout(900); }
  }
  await page.screenshot({ path: require('path').join(OUT_DIR, filename) });
  console.log('✅', filename);
  await page.close();
}

async function go() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Mobile 390×844 @2x
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await shot(mob, null,    '01-today.png');
  await shot(mob, '任務樹', '02-goals.png');
  await shot(mob, '儀表板', '03-dashboard.png');
  await shot(mob, '征途',   '04-growth-map.png');
  await shot(mob, '人脈',   '05-network.png');
  await shot(mob, '覆盤',   '06-weekly-review.png');

  // Stabilizer
  const stabPage = await mob.newPage();
  await stabPage.goto(BASE_URL);
  await stabPage.waitForLoadState('networkidle');
  await stabPage.evaluate((d) => Object.entries(d).forEach(([k,v]) => localStorage.setItem(k,v)), SEED_DATA);
  await stabPage.reload();
  await stabPage.waitForTimeout(1300);
  const stabBtn = stabPage.locator('button:has-text("需要穩一下")').first();
  if (await stabBtn.isVisible()) { await stabBtn.click(); await stabPage.waitForTimeout(900); }
  await stabPage.screenshot({ path: require('path').join(OUT_DIR, '07-stabilizer.png') });
  console.log('✅ 07-stabilizer.png');
  await stabPage.close();

  // Desktop 1280×800 @1.5x
  const desk = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5 });
  await shot(desk, null,    '08-desktop-today.png');
  await shot(desk, '任務樹', '09-desktop-goals.png');
  await shot(desk, '儀表板', '10-desktop-dashboard.png');
  await shot(desk, '征途',   '11-desktop-growth.png');

  await browser.close();
  console.log('\n🎉 All done');
}
go().catch(console.error);
