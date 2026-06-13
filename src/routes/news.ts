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

async function fetchFeed(feed: typeof FEEDS[0]): Promise<Article[]> {
  const res = await fetch(feed.url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return [];
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const data = parser.parse(xml);

  // 支援 RSS 2.0 和 Atom
  const channel = data?.rss?.channel ?? data?.feed;
  if (!channel) return [];

  const rawItems = channel.item ?? channel.entry ?? [];
  const items: any[] = Array.isArray(rawItems) ? rawItems : [rawItems];

  return items.slice(0, 12).map((item: any, i: number) => {
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
  const articles: Article[] = [];
  results.forEach(r => { if (r.status === 'fulfilled') articles.push(...r.value); });
  articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

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

// POST /api/news/refresh — 強制重新抓取
router.post('/refresh', async (_req: Request, res: Response) => {
  try {
    const articles = await getNews(true);
    res.json({ success: true, articles, fetchedAt: _cache?.fetchedAt ?? Date.now() });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
