const CLAUDE_API_BASE = 'https://claude.ai/api';

async function fetchWithSession(path: string): Promise<any> {
  const sessionKey = process.env.CLAUDE_SESSION_KEY;
  if (!sessionKey) throw new Error('CLAUDE_SESSION_KEY 未設定');

  const res = await fetch(`${CLAUDE_API_BASE}${path}`, {
    headers: {
      'Cookie': `sessionKey=${sessionKey}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept': 'application/json',
      'Referer': 'https://claude.ai/',
    },
  });

  if (res.status === 401 || res.status === 403) {
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) {
    throw new Error(`claude.ai API 錯誤 ${res.status}`);
  }
  return res.json();
}

export interface ClaudeUsageData {
  plan: string;
  usedPercent: number;
  resetAt: string | null;
  raw: any;
}

export async function fetchClaudeUsage(): Promise<ClaudeUsageData> {
  // Step 1: 取得帳號資訊（含 org id）
  const bootstrap = await fetchWithSession('/bootstrap');
  const account = bootstrap?.account;
  const orgId = account?.memberships?.[0]?.organization?.uuid
    || bootstrap?.organizations?.[0]?.uuid;

  let usedPercent = 0;
  let plan = account?.plan?.name || 'Pro';
  let resetAt: string | null = null;
  let raw: any = {};

  // Step 2: 取得用量資訊
  if (orgId) {
    try {
      const limits = await fetchWithSession(`/organizations/${orgId}/ratelimits`);
      raw = limits;
      // 不同版本的 claude.ai API 結構不同，嘗試多種格式
      const limit = limits?.limits?.find?.((l: any) => l.type === 'MESSAGE_LIMIT')
        || limits?.messageLimit
        || limits?.rate_limits?.[0]
        || limits;

      if (limit?.used !== undefined && limit?.limit !== undefined) {
        usedPercent = Math.round((limit.used / limit.limit) * 100);
        resetAt = limit.resetsAt || limit.reset_at || null;
      } else if (limit?.percent_used !== undefined) {
        usedPercent = Math.round(limit.percent_used * 100);
        resetAt = limit.resets_at || null;
      }
    } catch {
      // 如果 ratelimits 端點不通，嘗試其他路徑
    }
  }

  // 備用：從 bootstrap 直接找用量
  if (usedPercent === 0 && bootstrap) {
    const rl = bootstrap?.rate_limit || bootstrap?.rateLimit || bootstrap?.usage;
    if (rl?.percent_used) usedPercent = Math.round(rl.percent_used * 100);
    if (rl?.usedPercent) usedPercent = Math.round(rl.usedPercent);
  }

  return { plan, usedPercent, resetAt, raw };
}
