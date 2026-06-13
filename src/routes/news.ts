import { Router, Request, Response } from 'express';
import { XMLParser } from 'fast-xml-parser';

const router = Router();

const FEEDS = [
  { id: 'tc-ai',    label: 'TechCrunch AI', category: 'ai',    url: 'https://techcrunch.com/category/artificial-intelligence/feed/' },
  { id: 'verge',    label: 'The Verge',     category: 'ai',    url: 'https://www.theverge.com/rss/index.xml' },
  { id: 'bbc-tech', label: 'BBC 科技',      category: 'ai',    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { id: 'bbc-world',label: 'BBC 全球',      category: 'world', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
];

interface Article {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: string;
  category: string;
}

let _cache: { articles: Article[]; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000;

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();
}

function getGeminiKey(): string | null {
  const keys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_KEY_1,
    process.env.GEMINI_KEY_2,
    process.env.GEMINI_KEY_3,
    process.env.GEMINI_KEY_4,
  ].filter(Boolean) as string[];
  return keys[0] ?? null;
}

async function translateArticles(articles: Article[]): Promise<Article[]> {
  const key = getGeminiKey();
  if (!key) return articles;

  // 只翻譯尚未是中文的文章（BBC 中文版已是中文可跳過）
  const toTranslate = articles.map(a => ({ title: a.title, desc: a.description }));

  const prompt = `將以下 JSON 陣列每筆的 title 和 desc 翻譯成繁體中文。
規則：
- 專有名詞（人名、公司名、產品名）直接保留英文，不要括注
- 標題簡潔有力，不超過 40 字
- desc 不超過 80 字
- 只回傳純 JSON 陣列，不要加任何說明或 markdown

${JSON.stringify(toTranslate)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(30000),
      }
    );
    if (!res.ok) return articles;

    const data: any = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    // 從回應中提取 JSON
    const start = raw.indexOf('[');
    const end = raw.lastIndexOf(']');
    if (start === -1 || end === -1) return articles;
    const translated: { title: string; desc: string }[] = JSON.parse(raw.slice(start, end + 1));

    return articles.map((a, i) => ({
      ...a,
      title: translated[i]?.title || a.title,
      description: translated[i]?.desc || a.description,
    }));
  } catch {
    return articles; // 翻譯失敗直接回傳原文
  }
}

async function fetchFeed(feed: typeof FEEDS[0]): Promise<Article[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const data = parser.parse(xml);

  const channel = data?.rss?.channel ?? data?.feed;
  if (!channel) return [];

  const rawItems = channel.item ?? channel.entry ?? [];
  const items: any[] = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.slice(0, 10).map((item: any, i: number) => {
    const link = typeof item.link === 'string'
      ? item.link
      : item.link?.['@_href'] ?? item.link?.['#text'] ?? '';

    const desc = stripHtml(String(item.description ?? item.summary ?? item['media:description'] ?? '')).slice(0, 220);
    const title = stripHtml(String(item.title ?? '')).slice(0, 160);
    const pubDate = String(item.pubDate ?? item.published ?? item.updated ?? '');

    return { id: `${feed.id}-${i}`, title, link: String(link).trim(), description: desc, pubDate, source: feed.label, category: feed.category };
  }).filter(a => a.title && a.link);
}

async function getNews(force = false): Promise<Article[]> {
  if (!force && _cache && Date.now() - _cache.fetchedAt < CACHE_TTL) return _cache.articles;

  const results = await Promise.allSettled(FEEDS.map(f => fetchFeed(f)));
  const raw: Article[] = [];
  results.forEach(r => { if (r.status === 'fulfilled') raw.push(...r.value); });
  raw.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  console.log(`[news] 抓到 ${raw.length} 篇，開始翻譯...`);
  const articles = await translateArticles(raw);
  console.log(`[news] 翻譯完成`);

  _cache = { articles, fetchedAt: Date.now() };
  return articles;
}

// GET /api/news
router.get('/', async (_req: Request, res: Response) => {
  try {
    const articles = await getNews();
    res.json({ success: true, articles, fetchedAt: _cache?.fetchedAt ?? Date.now() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/news/refresh — 強制重新抓取並翻譯
router.post('/refresh', async (_req: Request, res: Response) => {
  try {
    const articles = await getNews(true);
    res.json({ success: true, articles, fetchedAt: _cache?.fetchedAt ?? Date.now() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
