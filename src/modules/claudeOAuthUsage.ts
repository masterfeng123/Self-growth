import fs from 'fs';
import path from 'path';
import os from 'os';

const CREDENTIALS_PATH = path.join(os.homedir(), '.claude', '.credentials.json');
const TOKEN_URL  = 'https://claude.ai/api/auth/oauth/token';
const USAGE_URL  = 'https://api.anthropic.com/api/oauth/usage';
const CACHE_TTL_MS = 60_000;

export interface WindowUsage {
  utilization: number; // 0-100
  resetsAt: string;
  remaining: number;   // 0-100
}

export interface ClaudeOAuthUsageData {
  plan: string;
  fiveHour: WindowUsage;
  sevenDay: WindowUsage;
  extraUsage: { enabled: boolean };
  fetchedAt: string;
  stale?: boolean;
}

interface Credentials {
  claudeAiOauth: {
    accessToken: string;
    expiresAt: number; // ms timestamp
    refreshToken: string;
    subscriptionType: string;
    rateLimitTier: string;
    scopes: string[];
  };
}

let cache: { data: ClaudeOAuthUsageData; ts: number } | null = null;

function readCredentials(): Credentials {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('CREDENTIALS_NOT_FOUND');
  }
  try {
    return JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
  } catch {
    throw new Error('CREDENTIALS_PARSE_ERROR');
  }
}

function writeCredentials(creds: Credentials): void {
  fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(creds, null, 2));
}

function getAccessToken(): string {
  // 每次都從檔案讀最新 token（Claude Code 本身會自動更新 credentials）
  const creds = readCredentials();
  const oauth = creds.claudeAiOauth;
  if (!oauth.accessToken) throw new Error('TOKEN_REFRESH_FAILED:no_token');
  if (oauth.expiresAt && Date.now() > oauth.expiresAt) {
    throw new Error('TOKEN_EXPIRED');
  }
  return oauth.accessToken;
}

function pct(val: number | undefined): number {
  if (val === undefined || val === null) return 0;
  // 可能是 0-1 小數或 0-100 整數
  return val > 1 ? Math.round(val) : Math.round(val * 100);
}

export async function fetchClaudeOAuthUsage(): Promise<ClaudeOAuthUsageData> {
  // 快取還有效
  if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.data;
  }

  const accessToken = await getAccessToken();
  const creds = readCredentials();

  const res = await fetch(USAGE_URL, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'anthropic-version': '2023-06-01',
    },
  });

  if (res.status === 429) {
    if (cache) return { ...cache.data, stale: true };
    throw new Error('RATE_LIMITED');
  }
  if (res.status === 401 || res.status === 403) {
    // Token 可能已在背景被 Claude Code 更新，清快取後重試一次
    cache = null;
    throw new Error('TOKEN_EXPIRED');
  }
  if (!res.ok) throw new Error(`USAGE_API_ERROR:${res.status}`);

  const raw = await res.json() as any;

  const fiveHour: WindowUsage = {
    utilization: Math.round(raw.five_hour?.utilization ?? 0),
    resetsAt: raw.five_hour?.resets_at ?? '',
    remaining: Math.max(0, 100 - Math.round(raw.five_hour?.utilization ?? 0)),
  };
  const sevenDay: WindowUsage = {
    utilization: Math.round(raw.seven_day?.utilization ?? 0),
    resetsAt: raw.seven_day?.resets_at ?? '',
    remaining: Math.max(0, 100 - Math.round(raw.seven_day?.utilization ?? 0)),
  };

  const result: ClaudeOAuthUsageData = {
    plan: creds.claudeAiOauth.subscriptionType || 'pro',
    fiveHour,
    sevenDay,
    extraUsage: { enabled: raw.extra_usage?.is_enabled ?? false },
    fetchedAt: new Date().toISOString(),
  };

  cache = { data: result, ts: Date.now() };
  return result;
}
