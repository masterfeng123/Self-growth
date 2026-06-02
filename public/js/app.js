const API = '/api';

const CATEGORY_META = {
  mind:       { letter: '心', name: '心智',  color: '#4d5fcf', bg: 'rgba(77,95,207,0.09)'  },
  body:       { letter: '身', name: '身體',  color: '#2e9468', bg: 'rgba(46,148,104,0.09)' },
  skills:     { letter: '技', name: '技能',  color: '#2270c9', bg: 'rgba(34,112,201,0.09)' },
  social:     { letter: '社', name: '社交',  color: '#c25454', bg: 'rgba(194,84,84,0.09)'  },
  creativity: { letter: '創', name: '創意',  color: '#c97430', bg: 'rgba(201,116,48,0.09)' },
  reflection: { letter: '思', name: '內省',  color: '#7a5ab0', bg: 'rgba(122,90,176,0.09)' },
};

const ACHIEVEMENT_COLORS = {
  'first-step': '#2270c9', 'streak-3': '#2e9468', 'streak-7': '#c97430',
  'streak-14': '#c25454', 'streak-30': '#4d5fcf', 'streak-100': '#7a5ab0',
  'level-5': '#2270c9', 'level-10': '#4d5fcf', 'level-20': '#c97430',
  'mind-x3': '#4d5fcf', 'body-x3': '#2e9468', 'skills-x3': '#2270c9',
  'social-x3': '#c25454', 'creativity-x3': '#c97430', 'reflection-x3': '#7a5ab0',
  'all-categories': '#c97430',
};

// 目標時間層級（瀑布結構）
const HORIZON = {
  'life': { label: '人生北極星', short: '人生', color: '#b5860d', parentOf: null     },
  '10yr': { label: '十年願景',   short: '十年', color: '#7a5ab0', parentOf: 'life'   },
  '5yr':  { label: '五年方向',   short: '五年', color: '#4d5fcf', parentOf: '10yr'   },
  '1yr':  { label: '年度目標',   short: '今年', color: '#2270c9', parentOf: '5yr'    },
  '1mo':  { label: '月度計劃',   short: '本月', color: '#2e9468', parentOf: '1yr'    },
  '1wk':  { label: '本週重點',   short: '本週', color: '#c97430', parentOf: '1mo'    },
  'mit':  { label: '今日 MIT',   short: '今日', color: '#c25454', parentOf: '1wk'    },
};
const HORIZON_ORDER = ['life', '10yr', '5yr', '1yr', '1mo', '1wk'];

const MOOD_LABEL = { 1: '很差', 2: '不好', 3: '普通', 4: '好', 5: '很好' };

function diffDots(d) {
  const f = '<span class="filled">◆</span>';
  const e = '<span class="empty">◇</span>';
  return `<span class="diff-dots">${f.repeat(d)}${e.repeat(3 - d)}</span>`;
}

// ── 導航 ──
document.querySelectorAll('nav a[data-page], .tab-btn[data-page]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('nav a, .tab-btn').forEach(a => a.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll(`[data-page="${link.dataset.page}"]`).forEach(el => el.classList.add('active'));
    const page = link.dataset.page;
    document.getElementById(page).classList.add('active');
    if (page === 'dashboard') { loadDailyChallenge(); loadStats(); loadUpcoming(); }
    if (page === 'goals')        loadGoals();
    if (page === 'habits')       loadHabits();
    if (page === 'journal')      loadJournal();
    if (page === 'achievements') loadAchievements();
    if (page === 'weekly')       loadWeeklyReport();
    if (page === 'projects')     loadProjects();
    if (page === 'debuglog')     loadDebugLogs();
    if (page === 'calendar')     loadCalendar();
  });
});

function navigateTo(page) {
  document.querySelectorAll('nav a, .tab-btn').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll(`[data-page="${page}"]`).forEach(el => el.classList.add('active'));
  document.getElementById(page).classList.add('active');
  if (page === 'dashboard') { loadDailyChallenge(); loadStats(); loadUpcoming(); }
  if (page === 'goals')        loadGoals();
  if (page === 'habits')       loadHabits();
  if (page === 'journal')      loadJournal();
  if (page === 'achievements') loadAchievements();
  if (page === 'weekly')       loadWeeklyReport();
  if (page === 'projects')     loadProjects();
  if (page === 'debuglog')     loadDebugLogs();
  if (page === 'calendar')     loadCalendar();
}

function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  if (id === 'journal-modal') {
    _editingJournalId = null;
    document.querySelector('#journal-modal .modal-header h2').textContent = '寫日記';
  }
  if (id === 'goal-modal') {
    _editingGoalId = null;
    document.getElementById('goal-modal-title').textContent = '新增目標';
  }
}
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

async function apiFetch(url, opts = {}) {
  const res = await fetch(API + url, { headers: { 'Content-Type': 'application/json' }, ...opts });
  return res.json();
}

// ════════════════════════════════════════
//  每日挑戰
// ════════════════════════════════════════
async function loadDailyChallenge() {
  const { data } = await apiFetch('/daily');
  if (!data) return;
  const { challenge, todayCompleted, todayLog, profile, quote } = data;
  const { levelInfo, current_streak } = profile;
  const meta = CATEGORY_META[challenge.category] || {};

  // Nav 等級條
  const navLevel = document.getElementById('nav-level');
  navLevel.style.display = 'flex';
  document.getElementById('nav-level-text').textContent = `LV.${levelInfo.level}  ${levelInfo.name}`;
  document.getElementById('nav-xp-fill').style.width = levelInfo.progress + '%';

  document.getElementById('level-badge').textContent = `LV.${levelInfo.level}  ${levelInfo.name}`;
  document.getElementById('xp-fill').style.width = levelInfo.progress + '%';
  document.getElementById('xp-label').textContent = `${levelInfo.currentXp} / ${levelInfo.neededXp} pt`;
  document.getElementById('streak-badge').textContent =
    current_streak > 0 ? `連續 ${current_streak} 天` : '開始連勝';

  const tipHtml = challenge.tip ? `<div class="challenge-tip">${challenge.tip}</div>` : '';
  const body = document.getElementById('daily-card-body');

  if (todayCompleted) {
    const mood = todayLog?.mood;
    body.innerHTML = `
      <div class="challenge-header">
        <div class="cat-mark" style="background:${meta.bg};color:${meta.color}">${meta.letter}</div>
        <div class="challenge-header-text">
          <div class="challenge-category-label" style="color:${meta.color}">${meta.name}</div>
          <div class="challenge-title">${challenge.title}</div>
        </div>
      </div>
      <div class="challenge-desc">${challenge.description}</div>
      <div class="daily-done-state">
        <span style="font-size:1.1rem;font-weight:900">✓</span>
        今日挑戰已完成
        ${todayLog?.reflection ? `<span style="color:var(--text-muted);font-weight:400;font-style:italic;margin-left:.25rem">${todayLog.reflection}</span>` : ''}
        <span style="margin-left:auto;color:var(--accent);font-weight:700">+ ${todayLog?.xp_earned || 0} pt</span>
        ${mood ? `<span style="color:var(--text-muted);font-size:.78rem">${MOOD_LABEL[mood]}</span>` : ''}
      </div>`;
  } else {
    body.innerHTML = `
      <div class="challenge-header">
        <div class="cat-mark" style="background:${meta.bg};color:${meta.color}">${meta.letter}</div>
        <div class="challenge-header-text">
          <div class="challenge-category-label" style="color:${meta.color}">${meta.name}</div>
          <div class="challenge-title">${challenge.title}</div>
        </div>
      </div>
      <div class="challenge-desc">${challenge.description}</div>
      <div class="challenge-meta">
        <span>${challenge.duration}</span>
        ${diffDots(challenge.difficulty)}
        <span class="xp-chip">+ ${challenge.xpReward} pt</span>
      </div>
      ${tipHtml}
      <button class="btn btn-primary btn-lg" onclick="openModal('checkin-modal')">
        完成挑戰，領取 ${challenge.xpReward} pt
      </button>`;
  }

  const qCard = document.getElementById('quote-card');
  if (quote) {
    document.getElementById('quote-text').textContent = `"${quote.text}"`;
    document.getElementById('quote-author').textContent = `— ${quote.author}`;
    qCard.style.display = 'block';
  }

  const achievements = profile.achievements || [];
  const achSection = document.getElementById('achievements-section');
  if (achievements.length > 0) {
    achSection.style.display = 'block';
    document.getElementById('achievement-count').textContent = `${achievements.length}`;
    document.getElementById('achievements-grid').innerHTML = achievements.map(a => {
      const dotColor = ACHIEVEMENT_COLORS[a.id] || '#9b8f80';
      return `<div class="achievement-chip" title="${a.description}">
        <span class="achievement-dot" style="background:${dotColor}"></span>${a.name}
      </div>`;
    }).join('');
  }

  loadMit();
  loadHistory();
}

async function loadHistory() {
  const { data } = await apiFetch('/daily/history');
  if (!data || data.length === 0) return;
  document.getElementById('history-section').style.display = 'block';
  document.getElementById('history-list').innerHTML = data.slice(0, 10).map(log => {
    const ch = log.challenge;
    const meta = ch ? CATEGORY_META[ch.category] : null;
    const dotColor = meta ? meta.color : '#9b8f80';
    const d = new Date(log.completed_at);
    const dateStr = `${d.getMonth()+1}/${d.getDate()}`;
    const mood = log.mood ? MOOD_LABEL[log.mood] : '';
    return `
      <div class="history-item">
        <span class="history-date">${dateStr}</span>
        <span class="history-cat-dot" style="background:${dotColor}"></span>
        <span>${ch ? ch.title : '—'}</span>
        ${log.reflection ? `<span style="color:var(--text-muted);font-size:.76rem;font-style:italic">${log.reflection}</span>` : ''}
        ${mood ? `<span style="color:var(--text-muted);font-size:.74rem;margin-left:auto;margin-right:.5rem">${mood}</span>` : '<span style="margin-left:auto"></span>'}
        <span class="history-xp">+${log.xp_earned} pt</span>
      </div>`;
  }).join('');
}

// ════════════════════════════════════════
//  MIT（今日最重要的事）
// ════════════════════════════════════════
async function loadMit() {
  const { data: mits } = await apiFetch('/goals/mit');
  const list = document.getElementById('mit-list');
  if (!mits || mits.length === 0) {
    list.innerHTML = `<div class="mit-empty">尚未設定今日首要任務（MIT）。點擊「+ 新增」設定今天最重要的一件事。</div>`;
    return;
  }
  list.innerHTML = mits.map(m => {
    const done = m.status === 'completed';
    const parentInfo = m.parent_title
      ? `<span class="mit-parent-chain">← ${HORIZON[m.parent_horizon]?.short || ''} · ${m.parent_title}</span>`
      : '';
    return `
      <div class="mit-item ${done ? 'mit-done' : ''}">
        <button class="mit-check ${done ? 'checked' : ''}" onclick="${done ? '' : `completeMit('${m.id}')`}"
          title="${done ? '已完成' : '標記完成'}" ${done ? 'disabled' : ''}>
          ${done ? '✓' : ''}
        </button>
        <div class="mit-item-content" onclick="navigateTo('goals')" style="cursor:pointer" title="前往目標頁">
          <div class="mit-item-title ${done ? 'done-text' : ''}">${m.title}</div>
          ${parentInfo}
        </div>
        ${done ? `<span class="mit-xp">+50 pt</span>` : ''}
        ${!done ? `<button class="btn btn-danger btn-sm" onclick="deleteMit('${m.id}')">刪除</button>` : ''}
      </div>`;
  }).join('');
}

async function openMitModal() {
  const { data: weekly } = await apiFetch('/goals?horizon=1wk');
  const sel = document.getElementById('mit-parent-select');
  const activeWeekly = (weekly || []).filter(g => g.status !== 'completed' && g.horizon === '1wk');
  sel.innerHTML = '<option value="">— 不連結 —</option>' +
    activeWeekly.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
  openModal('mit-modal');
}

async function submitMit() {
  const title = document.getElementById('mit-title-input').value.trim();
  if (!title) { toast('請輸入 MIT 標題', true); return; }
  const parent_id = document.getElementById('mit-parent-select').value || null;
  const { success } = await apiFetch('/goals', {
    method: 'POST',
    body: JSON.stringify({ title, horizon: 'mit', parent_id, category: 'general', priority: 1 }),
  });
  if (success) {
    toast('MIT 已設定');
    closeModal('mit-modal');
    document.getElementById('mit-title-input').value = '';
    loadMit();
  } else toast('設定失敗', true);
}

async function completeMit(id) {
  const { success, data } = await apiFetch(`/goals/${id}/done`, { method: 'POST' });
  if (!success) { toast('完成失敗', true); return; }
  showXpBurst(data);
  loadMit();
  setTimeout(() => { loadDailyChallenge(); loadStats(); }, 1200);
}

async function deleteMit(id) {
  const { success } = await apiFetch(`/goals/${id}`, { method: 'DELETE' });
  if (success) { toast('已刪除'); loadMit(); }
}

// ── 打卡提交 ──
let selectedMood = 3;
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMood = parseInt(btn.dataset.mood);
  });
});

async function submitCheckin() {
  const reflection = document.getElementById('checkin-reflection').value.trim();
  const { success, data, message } = await apiFetch('/daily/checkin', {
    method: 'POST',
    body: JSON.stringify({ mood: selectedMood, reflection: reflection || null }),
  });
  if (!success) { toast(message, true); return; }
  closeModal('checkin-modal');
  document.getElementById('checkin-reflection').value = '';
  showXpBurst(data);
  setTimeout(() => { loadDailyChallenge(); loadStats(); }, 1300);
}

function showXpBurst(data) {
  const burst = document.getElementById('xp-burst');
  const inner = document.getElementById('xp-burst-inner');
  const li = data.levelInfo;
  const achHtml = (data.newAchievements || []).map(a => {
    const dotColor = ACHIEVEMENT_COLORS[a.id] || '#9b8f80';
    return `<div class="achievement-chip new-unlock">
      <span class="achievement-dot" style="background:${dotColor}"></span>${a.name}
    </div>`;
  }).join('');
  inner.innerHTML = `
    <div class="xp-burst-eyebrow">完成</div>
    <span class="xp-burst-number">+${data.xpEarned}</span>
    <div class="xp-burst-unit">POINTS</div>
    <div class="xp-burst-title">${data.leveledUp ? `晉升至 Lv.${li.level} · ${li.name}` : '繼續前進'}</div>
    <div class="xp-burst-sub">
      連續第 ${data.newStreak || '—'} 天<br>
      累積 ${data.newTotalXp} pt · 距下一級 ${li.neededXp - li.currentXp} pt
    </div>
    ${achHtml ? `<div class="xp-burst-achievements">${achHtml}</div>` : ''}
    <button class="btn btn-primary" onclick="document.getElementById('xp-burst').style.display='none'">繼續</button>`;
  burst.style.display = 'flex';
}

// ════════════════════════════════════════
//  統計
// ════════════════════════════════════════
async function loadStats() {
  const { data } = await apiFetch('/stats');
  document.getElementById('today-date').textContent =
    new Date().toLocaleDateString('zh-TW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="label">進行中目標</div>
      <div class="value">${data.goals.total - data.goals.completed}</div>
      <div class="sub">已完成 ${data.goals.completed} / 共 ${data.goals.total}</div>
    </div>
    <div class="stat-card">
      <div class="label">今日習慣</div>
      <div class="value">${data.habits.todayCompleted}<span style="font-size:1.1rem;font-weight:400;color:var(--text-muted)"> / ${data.habits.active}</span></div>
      <div class="sub">活躍習慣 ${data.habits.active} 個</div>
    </div>
    <div class="stat-card">
      <div class="label">成長日記</div>
      <div class="value">${data.journal.total}</div>
      <div class="sub">平均心情 ${data.journal.avgMood ? data.journal.avgMood + ' / 5' : '—'}</div>
    </div>
    <div class="stat-card">
      <div class="label">習慣最長連勝</div>
      <div class="value">${data.topStreak ? data.topStreak.streak : 0}<span style="font-size:1rem;font-weight:400;color:var(--text-muted)"> 天</span></div>
      <div class="sub">${data.topStreak ? data.topStreak.title : '尚無習慣'}</div>
    </div>`;
}

// ════════════════════════════════════════
//  目標瀑布視圖
// ════════════════════════════════════════
let currentHorizonFilter = 'all';
let allGoalsCache = [];

async function loadGoals() {
  const { data } = await apiFetch('/goals');
  if (!data) return;
  allGoalsCache = data.filter(g => g.horizon !== 'mit');
  renderCascadeBar();
  renderGoalsList(allGoalsCache);
}

function renderCascadeBar() {
  const counts = {};
  allGoalsCache.forEach(g => { counts[g.horizon] = (counts[g.horizon] || 0) + 1; });
  const bar = document.getElementById('cascade-bar');
  const allCount = allGoalsCache.filter(g => g.status !== 'completed').length;

  bar.innerHTML = `
    <button class="cascade-tab ${currentHorizonFilter === 'all' ? 'active' : ''}"
      onclick="filterGoals('all')" style="--tc:#4a4035">
      全部 <span class="cascade-count">${allCount}</span>
    </button>` +
    HORIZON_ORDER.map((h, i) => {
      const hm = HORIZON[h];
      const active = currentHorizonFilter === h ? 'active' : '';
      const cnt = (allGoalsCache.filter(g => g.horizon === h && g.status !== 'completed')).length;
      const arrow = i < HORIZON_ORDER.length - 1
        ? `<span class="cascade-arrow">→</span>` : '';
      return `
        <button class="cascade-tab ${active}" onclick="filterGoals('${h}')"
          style="--tc:${hm.color}">
          ${hm.short} <span class="cascade-count">${cnt}</span>
        </button>${arrow}`;
    }).join('');
}

function filterGoals(h) {
  currentHorizonFilter = h;
  renderCascadeBar();
  const filtered = h === 'all' ? allGoalsCache : allGoalsCache.filter(g => g.horizon === h);
  renderGoalsList(filtered);
  document.getElementById('goals-page-title').textContent =
    h === 'all' ? '目標瀑布' : HORIZON[h]?.label || '目標';
}

function renderGoalsList(goals) {
  const el = document.getElementById('goals-list');
  if (!goals.length) {
    el.innerHTML = '<div class="empty-state">這個層級還沒有目標。點擊右上角新增。</div>';
    return;
  }

  // 按 horizon 分組
  const groups = {};
  HORIZON_ORDER.forEach(h => { groups[h] = []; });
  goals.forEach(g => { if (groups[g.horizon]) groups[g.horizon].push(g); });

  let html = '';
  HORIZON_ORDER.forEach(h => {
    const list = groups[h];
    if (!list.length) return;
    const hm = HORIZON[h];
    html += `<div class="horizon-group">
      <div class="horizon-label" style="color:${hm.color}">
        <span class="horizon-dot" style="background:${hm.color}"></span>
        ${hm.label}
      </div>`;
    list.forEach(g => {
      const statusLabel = { active: '進行中', completed: '已完成', paused: '暫停' }[g.status] || '進行中';
      const statusClass = { active: 'primary', completed: 'success', paused: 'warning' }[g.status] || 'primary';
      const parentCrumb = g.parent_title
        ? `<span class="goal-parent-crumb" style="color:${HORIZON[g.parent_horizon]?.color || '#9b8f80'}">
            ${HORIZON[g.parent_horizon]?.short || ''} · ${g.parent_title}
           </span>` : '';
      const canAddChild = h !== '1wk';
      const nextH = HORIZON_ORDER[HORIZON_ORDER.indexOf(h) + 1];
      const isLife = h === 'life';
      html += `
        <div class="card goal-card ${g.status === 'completed' ? 'goal-card-done' : ''} ${isLife ? 'goal-card-life' : ''}">
          <div class="card-header">
            <div style="flex:1;min-width:0">
              ${parentCrumb}
              <div class="card-title">${isLife ? '<span class="goal-life-crown">★</span>' : ''}${g.title}</div>
              ${g.description ? `<div class="card-meta">${g.description}</div>` : ''}
            </div>
            <div class="actions">
              <span class="badge badge-${statusClass}">${statusLabel}</span>
              ${g.status !== 'completed' ? `<button class="btn btn-success btn-sm" onclick="completeGoal('${g.id}')">完成</button>` : ''}
              ${canAddChild && nextH ? `<button class="btn btn-sm" style="background:var(--surface2);color:var(--text-2);border:1px solid var(--border)" onclick="openGoalModal('${nextH}','${g.id}')">+ 子目標</button>` : ''}
              <button class="btn btn-sm" style="background:var(--surface2);color:var(--text-2);border:1px solid var(--border)" onclick="editGoal('${g.id}')">編輯</button>
              <button class="btn btn-danger btn-sm" onclick="deleteGoal('${g.id}')">刪除</button>
            </div>
          </div>
          ${h !== '10yr' && h !== '5yr' ? `
            <div class="progress-bar"><div class="progress-bar-fill" style="width:${g.progress || 0}%"></div></div>
            <div style="font-size:.72rem;color:var(--text-muted);margin-top:.3rem">
              進度 ${g.progress || 0}%
              <input type="range" min="0" max="100" value="${g.progress || 0}"
                style="width:100px;margin-left:.5rem;vertical-align:middle;accent-color:var(--accent)"
                onchange="updateProgress('${g.id}', this.value, this.parentElement.previousElementSibling.firstElementChild)">
            </div>` : ''}
        </div>`;
    });
    html += `</div>`;
  });
  el.innerHTML = html;
}

// ── 目標 Modal（含 horizon picker）──
let goalModalPresetHorizon = '1yr';
let goalModalPresetParent  = null;
let _editingGoalId = null;

async function editGoal(id) {
  const { data: g } = await apiFetch(`/goals/${id}`);
  if (!g) return;
  _editingGoalId = id;

  document.getElementById('goal-form').reset();
  document.getElementById('goal-modal-title').textContent = '編輯目標';
  document.getElementById('goal-horizon-val').value = g.horizon;

  // horizon picker
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.h === g.horizon);
  });

  // 填入資料
  const form = document.getElementById('goal-form');
  form.title.value       = g.title || '';
  form.description.value = g.description || '';
  form.category.value    = g.category || 'general';
  form.priority.value    = g.priority ?? 2;
  if (form.target_date) form.target_date.value = g.target_date ? g.target_date.slice(0, 10) : '';

  // 上層目標
  const hIdx = HORIZON_ORDER.indexOf(g.horizon);
  const showParent = hIdx > 0;
  document.getElementById('parent-group').style.display = showParent ? 'block' : 'none';
  if (showParent) await refreshParentSelect(g.horizon, g.parent_id);

  openModal('goal-modal');
}

async function openGoalModal(presetHorizon = '1yr', presetParentId = null) {
  _editingGoalId = null;
  goalModalPresetHorizon = presetHorizon;
  goalModalPresetParent  = presetParentId;

  // Reset form
  document.getElementById('goal-form').reset();
  document.getElementById('goal-modal-title').textContent = '新增目標';
  document.getElementById('goal-horizon-val').value = presetHorizon;

  // Update horizon picker UI
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.h === presetHorizon);
  });

  // Show/hide parent group
  const hIdx = HORIZON_ORDER.indexOf(presetHorizon);
  const showParent = hIdx > 0;
  document.getElementById('parent-group').style.display = showParent ? 'block' : 'none';
  if (showParent) await refreshParentSelect(presetHorizon, presetParentId);

  openModal('goal-modal');
}

// Horizon picker buttons
document.querySelectorAll('.horizon-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    document.querySelectorAll('.horizon-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const h = btn.dataset.h;
    document.getElementById('goal-horizon-val').value = h;
    const hIdx = HORIZON_ORDER.indexOf(h);
    const showParent = hIdx > 0;
    document.getElementById('parent-group').style.display = showParent ? 'block' : 'none';
    if (showParent) await refreshParentSelect(h, null);
  });
});

async function refreshParentSelect(horizon, preselect) {
  const parentH = HORIZON_ORDER[HORIZON_ORDER.indexOf(horizon) - 1];
  if (!parentH) return;
  const { data: parents } = await apiFetch('/goals');
  const sel = document.getElementById('goal-parent-select');
  const filtered = (parents || []).filter(g => g.horizon === parentH && g.status !== 'completed');
  sel.innerHTML = '<option value="">— 無 —</option>' +
    filtered.map(g => `<option value="${g.id}" ${preselect === g.id ? 'selected' : ''}>${g.title}</option>`).join('');
}

document.getElementById('goal-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.priority = parseInt(body.priority);
  body.horizon = document.getElementById('goal-horizon-val').value;
  if (!body.parent_id) delete body.parent_id;
  if (!body.target_date) delete body.target_date;

  if (_editingGoalId) {
    const { success } = await apiFetch(`/goals/${_editingGoalId}`, { method: 'PUT', body: JSON.stringify(body) });
    if (success) { toast('目標已更新'); closeModal('goal-modal'); _editingGoalId = null; loadGoals(); }
    else toast('更新失敗', true);
  } else {
    const { success } = await apiFetch('/goals', { method: 'POST', body: JSON.stringify(body) });
    if (success) { toast('目標已建立'); closeModal('goal-modal'); e.target.reset(); loadGoals(); }
    else toast('建立失敗', true);
  }
});

async function completeGoal(id) {
  await apiFetch(`/goals/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed', progress: 100 }) });
  toast('目標完成'); loadGoals();
}

async function deleteGoal(id) {
  if (!confirm('確定刪除此目標？')) return;
  await apiFetch(`/goals/${id}`, { method: 'DELETE' });
  toast('已刪除'); loadGoals();
}

async function updateProgress(id, value, barEl) {
  barEl.style.width = value + '%';
  await apiFetch(`/goals/${id}`, { method: 'PUT', body: JSON.stringify({ progress: parseInt(value) }) });
}

// ════════════════════════════════════════
//  習慣
// ════════════════════════════════════════
async function loadHabits() {
  const { data } = await apiFetch('/habits');
  const el = document.getElementById('habits-list');
  if (!data.length) { el.innerHTML = '<div class="empty-state">尚無習慣</div>'; return; }
  const today = new Date().toISOString().slice(0, 10);
  const logChecks = await Promise.all(data.map(h => apiFetch(`/habits/${h.id}/logs`)));
  el.innerHTML = data.map((h, i) => {
    const logs = logChecks[i].data || [];
    const doneToday = logs.some(l => l.completed_at.slice(0, 10) === today);
    return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${h.title}</div>
          <div class="card-meta">${h.frequency === 'daily' ? '每天' : '每週'} · ${h.category}</div>
        </div>
        <div class="actions">
          <span style="font-size:.78rem;font-weight:700;color:var(--warning)">連 ${h.streak} 天</span>
          ${doneToday ? '<span class="badge badge-success">今日完成</span>'
            : `<button class="btn btn-success btn-sm" onclick="checkIn('${h.id}')">打卡</button>`}
          <button class="btn btn-danger btn-sm" onclick="deleteHabit('${h.id}')">停用</button>
        </div>
      </div>
      ${h.description ? `<div style="color:var(--text-muted);font-size:.82rem">${h.description}</div>` : ''}
    </div>`;
  }).join('');
}

async function checkIn(id) {
  const { success, message } = await apiFetch(`/habits/${id}/log`, { method: 'POST', body: '{}' });
  toast(message, !success); if (success) loadHabits();
}

async function deleteHabit(id) {
  if (!confirm('確定停用此習慣？')) return;
  await apiFetch(`/habits/${id}`, { method: 'DELETE' });
  toast('習慣已停用'); loadHabits();
}

document.getElementById('habit-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target).entries());
  const { success } = await apiFetch('/habits', { method: 'POST', body: JSON.stringify(body) });
  if (success) { toast('習慣已建立'); closeModal('habit-modal'); e.target.reset(); loadHabits(); }
  else toast('建立失敗', true);
});

// ════════════════════════════════════════
//  日記
// ════════════════════════════════════════
async function loadJournal() {
  const { data } = await apiFetch('/journal');
  const el = document.getElementById('journal-list');
  if (!data.length) { el.innerHTML = '<div class="empty-state">開始記錄你的成長旅程</div>'; return; }
  el.innerHTML = data.map(j => `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${j.title}</div>
          <div class="card-meta">${new Date(j.created_at).toLocaleString('zh-TW')}</div>
        </div>
        <div class="actions">
          <span class="mood-emoji">${MOOD_LABEL[j.mood] || '普通'}</span>
          <button class="btn btn-sm" style="background:var(--surface2);color:var(--text-2);border:1px solid var(--border)" onclick="editJournal('${j.id}')">編輯</button>
          <button class="btn btn-danger btn-sm" onclick="deleteJournal('${j.id}')">刪除</button>
        </div>
      </div>
      <div style="color:var(--text-2);font-size:.85rem;line-height:1.7;white-space:pre-wrap">${j.content}</div>
    </div>`).join('');
}

async function deleteJournal(id) {
  if (!confirm('確定刪除此日記？')) return;
  await apiFetch(`/journal/${id}`, { method: 'DELETE' });
  toast('已刪除'); loadJournal();
}

let _editingJournalId = null;

async function editJournal(id) {
  const { data: j } = await apiFetch(`/journal/${id}`);
  if (!j) return;
  _editingJournalId = id;
  const form = document.getElementById('journal-form');
  form.title.value   = j.title || '';
  form.content.value = j.content || '';
  form.mood.value    = j.mood ?? 3;
  document.querySelector('#journal-modal .modal-header h2').textContent = '編輯日記';
  openModal('journal-modal');
}

document.getElementById('journal-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target).entries());
  body.mood = parseInt(body.mood);
  if (_editingJournalId) {
    const { success } = await apiFetch(`/journal/${_editingJournalId}`, { method: 'PUT', body: JSON.stringify(body) });
    if (success) {
      toast('日記已更新'); closeModal('journal-modal');
      _editingJournalId = null;
      document.querySelector('#journal-modal .modal-header h2').textContent = '寫日記';
      loadJournal();
    } else toast('更新失敗', true);
  } else {
    const { success } = await apiFetch('/journal', { method: 'POST', body: JSON.stringify(body) });
    if (success) { toast('日記已儲存'); closeModal('journal-modal'); e.target.reset(); loadJournal(); }
    else toast('儲存失敗', true);
  }
});

// ════════════════════════════════════════
//  週報
// ════════════════════════════════════════
const RPT_CAT_COLORS = {
  mind:'#4d5fcf', body:'#2e9468', skills:'#2270c9',
  social:'#c25454', creativity:'#c97430', reflection:'#7a5ab0',
};
const RPT_CAT_NAMES = {
  mind:'心智', body:'身體', skills:'技能',
  social:'社交', creativity:'創意', reflection:'內省',
};
function rptScoreColor(s) {
  if (s >= 8) return '#2e9468';
  if (s >= 6) return '#2270c9';
  if (s >= 4) return '#c97430';
  return '#c25454';
}

function renderWeeklyReport(report) {
  let fullReport = {};
  try { fullReport = JSON.parse(report.full_report || '{}'); } catch {}
  const raw = report.raw_data || {};
  const scoreReason = fullReport.scoreReason || fullReport.score_reason || '';
  const score = report.score || 0;
  const sColor = rptScoreColor(score);

  // 評分 10 點
  const scoreDots = Array.from({length:10}, (_,i) =>
    `<span class="score-dot${i<score?' filled':''}" ${i<score?`style="background:${sColor}"`:''} ></span>`
  ).join('');

  // 類別長條圖
  const catBreak = raw.categoryBreakdown || {};
  const maxCat = Math.max(...Object.values(catBreak).map(Number), 1);
  const catBarsHtml = Object.entries(catBreak).length
    ? Object.entries(catBreak).sort(([,a],[,b])=>Number(b)-Number(a)).map(([cat,n])=>`
        <div class="report-bar-row">
          <span class="report-bar-label">${RPT_CAT_NAMES[cat]||cat}</span>
          <div class="report-bar-track">
            <div class="report-bar-fill" style="width:${(Number(n)/maxCat*100).toFixed(0)}%;background:${RPT_CAT_COLORS[cat]||'#9b8f80'}"></div>
          </div>
          <span class="report-bar-count">${n} 次</span>
        </div>`).join('')
    : '<span style="color:var(--text-muted);font-size:.82rem">本週無記錄</span>';

  const createdAt = new Date(report.created_at)
    .toLocaleString('zh-TW',{month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'});
  const br = s => (s||'').replace(/\n/g,'<br>');

  return `
    <div class="report-header">
      <div class="report-hero">
        <div class="report-week-range">${report.week_start} — ${report.week_end}</div>
        <div class="report-persona-title">${report.persona_title}</div>
        <div class="report-generated-at">由 AI 生成 · ${createdAt}</div>
      </div>
      <div class="report-score-block">
        <div class="report-score-number" style="color:${sColor}">${score}</div>
        <div class="report-score-unit">/ 10</div>
        <div class="report-score-dots">${scoreDots}</div>
        ${scoreReason ? `<div class="report-score-reason">${scoreReason}</div>` : ''}
      </div>
    </div>

    <div class="report-stats">
      <div class="report-stat"><div class="report-stat-value">${raw.daysActive??0}</div><div class="report-stat-label">活躍天數</div></div>
      <div class="report-stat"><div class="report-stat-value">${raw.totalXp??0}</div><div class="report-stat-label">本週 XP</div></div>
      <div class="report-stat"><div class="report-stat-value">${raw.avgMood??'—'}</div><div class="report-stat-label">平均心情</div></div>
      <div class="report-stat"><div class="report-stat-value">${raw.challengeCount??0}</div><div class="report-stat-label">完成挑戰</div></div>
      ${(raw.journalCount??0)>0?`<div class="report-stat"><div class="report-stat-value">${raw.journalCount}</div><div class="report-stat-label">日記篇數</div></div>`:''}
    </div>

    <div class="report-section-card">
      <div class="report-section-label">人格分析</div>
      <div class="report-persona-desc">${br(report.persona_description)}</div>
    </div>

    <div class="report-two-col">
      <div class="report-section-card">
        <div class="report-section-label">本週亮點</div>
        <ul class="report-item-list report-highlights">
          ${(report.highlights||[]).map(h=>`<li>${h}</li>`).join('')}
        </ul>
      </div>
      <div class="report-section-card report-blind-card">
        <div class="report-section-label">盲點觀察</div>
        <ul class="report-item-list report-blind-spots">
          ${(report.blind_spots||[]).map(b=>`<li>${b}</li>`).join('')}
        </ul>
      </div>
    </div>

    ${Object.keys(catBreak).length?`
    <div class="report-section-card">
      <div class="report-section-label">類別分佈</div>
      <div class="report-cat-bars">${catBarsHtml}</div>
    </div>`:''}

    <div class="report-section-card">
      <div class="report-section-label">行為模式</div>
      <div class="report-body-text">${br(report.patterns)}</div>
    </div>

    <div class="report-section-card report-next-focus">
      <div class="report-section-label">下週聚焦</div>
      <div class="report-body-text">${br(report.next_week_focus)}</div>
    </div>
  `;
}

async function loadWeeklyReport() {
  const el = document.getElementById('weekly-report-content');
  if (!el) return;
  el.innerHTML = '<div class="loading-pulse">載入週報中...</div>';
  try {
    const { data } = await apiFetch('/weekly-report/latest');
    if (!data) {
      el.innerHTML = `
        <div class="report-empty-state">
          <div class="report-empty-icon">◎</div>
          <div class="report-empty-title">尚無週報</div>
          <div class="report-empty-sub">點擊上方「立即生成本週評價」<br>讓 AI 分析你這週的成長軌跡</div>
        </div>`;
      return;
    }
    el.innerHTML = renderWeeklyReport(data);
    requestAnimationFrame(() => {
      el.querySelectorAll('.report-bar-fill').forEach(bar => {
        const w = bar.style.width; bar.style.width = '0';
        setTimeout(() => { bar.style.width = w; }, 60);
      });
    });
  } catch { el.innerHTML = '<div class="empty-state">載入失敗，請重試</div>'; }
}

async function generateReport() {
  const btn = document.getElementById('gen-report-btn');
  const el  = document.getElementById('weekly-report-content');
  btn.disabled = true; btn.textContent = '生成中...';
  el.innerHTML = `
    <div class="report-generating">
      <div class="report-generating-ring"></div>
      <div class="report-generating-text">AI 正在分析你的成長軌跡...</div>
    </div>`;
  try {
    const { success, message, data } = await apiFetch('/weekly-report/generate', { method: 'POST' });
    if (success && data) {
      el.innerHTML = renderWeeklyReport(data);
      requestAnimationFrame(() => {
        el.querySelectorAll('.report-bar-fill').forEach(bar => {
          const w = bar.style.width; bar.style.width = '0';
          setTimeout(() => { bar.style.width = w; }, 60);
        });
      });
      toast('週報已生成');
    } else { toast(message || '生成失敗', true); loadWeeklyReport(); }
  } catch { toast('生成失敗，請確認 GEMINI_API_KEY', true); loadWeeklyReport(); }
  finally { btn.disabled = false; btn.textContent = '立即生成本週評價'; }
}

// ════════════════════════════════════════
//  成就頁
// ════════════════════════════════════════
let allAchievements = [];
let achFilter = 'all';

async function loadAchievements() {
  const { data } = await apiFetch('/achievements');
  if (!data) return;

  allAchievements = data.achievements;
  const { unlockedCount, totalCount } = data;

  // 環形進度條
  const circumference = 113.1;
  const offset = circumference - (unlockedCount / totalCount) * circumference;
  const fill = document.getElementById('ach-ring-fill');
  if (fill) fill.style.strokeDashoffset = offset;
  const ringNum = document.getElementById('ach-ring-num');
  if (ringNum) ringNum.textContent = unlockedCount;
  const ringTotal = document.getElementById('ach-ring-total');
  if (ringTotal) ringTotal.textContent = `/ ${totalCount}`;

  const summary = document.getElementById('ach-summary');
  if (summary) summary.textContent =
    `已解鎖 ${unlockedCount} / ${totalCount} · 連勝 ${data.profile.streak} 天 · 完成 ${data.profile.totalCompleted} 個挑戰`;

  renderAchievements();
}

function renderAchievements() {
  const filtered = allAchievements.filter(a => {
    if (achFilter === 'unlocked') return a.unlocked;
    if (achFilter === 'locked')   return !a.unlocked;
    return true;
  });

  const el = document.getElementById('ach-grid');
  if (!el) return;

  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state" style="padding:2rem">此篩選條件下沒有成就</div>';
    return;
  }

  el.innerHTML = filtered.map(a => `
    <div class="ach-card ${a.unlocked ? 'unlocked' : 'locked'}">
      <div class="ach-emoji">${a.emoji}</div>
      <div class="ach-body">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.description}</div>
        <div class="ach-progress-row">
          <div class="ach-prog-bar"><div class="ach-prog-fill" style="width:${a.percent}%"></div></div>
          <span class="ach-hint">${a.hint}</span>
        </div>
      </div>
      <div class="ach-status">${a.unlocked ? '✓' : '🔒'}</div>
    </div>
  `).join('');
}

document.querySelectorAll('.ach-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.ach-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    achFilter = btn.dataset.filter;
    renderAchievements();
  });
});

// ════════════════════════════════════════
//  專案監控
// ════════════════════════════════════════
let _currentProjectId = null;
let _pendingProgress = null;

const STATUS_LABEL = { active: '進行中', paused: '暫停', done: '已完成' };

async function loadProjects() {
  const { data } = await apiFetch('/projects');
  const list = document.getElementById('projects-list');
  document.getElementById('project-monitor').style.display = 'none';
  list.style.display = 'grid';
  if (!data || data.length === 0) {
    list.innerHTML = '<div style="color:var(--text-muted);padding:2rem 0;text-align:center">尚無專案，點擊右上角新增</div>';
    return;
  }
  list.innerHTML = data.map(p => {
    const days = daysLeft(p.target_date);
    const daysHtml = days !== null
      ? `<span class="days-left-chip${days < 7 ? ' urgent' : ''}">${days >= 0 ? `剩 ${days} 天` : `逾期 ${Math.abs(days)} 天`}</span>`
      : '';
    const ms = p.milestone_total > 0 ? `${p.milestone_done}/${p.milestone_total} 里程碑` : '無里程碑';
    return `
      <div class="project-card" onclick="openMonitor('${p.id}')">
        <div class="project-card-name">${p.name}</div>
        ${p.description ? `<div class="project-card-desc">${p.description}</div>` : ''}
        <div class="project-card-progress">
          <div class="project-card-track"><div class="project-card-fill" style="width:${p.progress}%"></div></div>
          <span class="project-card-pct">${p.progress}%</span>
        </div>
        <div class="project-card-meta">
          <span class="status-badge status-${p.status}">${STATUS_LABEL[p.status] || p.status}</span>
          <span>${ms}</span>
          ${daysHtml}
        </div>
      </div>`;
  }).join('');
}

function daysLeft(targetDate) {
  if (!targetDate) return null;
  const diff = Math.round((new Date(targetDate) - new Date()) / 86400000);
  return diff;
}

async function openMonitor(id) {
  _currentProjectId = id;
  const { data } = await apiFetch(`/projects/${id}`);
  if (!data) return;
  document.getElementById('projects-list').style.display = 'none';
  const monitor = document.getElementById('project-monitor');
  monitor.style.display = 'block';

  document.getElementById('monitor-name').textContent = data.name;
  document.getElementById('monitor-desc').textContent = data.description || '';
  const sb = document.getElementById('monitor-status-badge');
  sb.textContent = STATUS_LABEL[data.status] || data.status;
  sb.className = `status-badge status-${data.status}`;

  const start = data.start_date ? data.start_date.slice(0,10) : '—';
  const end   = data.target_date ? data.target_date.slice(0,10) : '未設定';
  document.getElementById('monitor-dates').textContent = `${start} → ${end}`;

  const days = daysLeft(data.target_date);
  const dlChip = document.getElementById('monitor-days-left');
  if (data.status === 'done') {
    dlChip.textContent = '已完成'; dlChip.className = 'days-left-chip done-chip';
  } else if (days !== null) {
    dlChip.textContent = days >= 0 ? `剩 ${days} 天` : `逾期 ${Math.abs(days)} 天`;
    dlChip.className = `days-left-chip${days < 7 ? ' urgent' : ''}`;
  } else {
    dlChip.textContent = ''; dlChip.className = 'days-left-chip';
  }

  setMonitorProgress(data.progress);
  _pendingProgress = data.progress;

  renderMilestones(data.milestones || []);
  renderLogs(data.logs || []);
}

function setMonitorProgress(pct) {
  document.getElementById('monitor-pct').textContent = pct + '%';
  document.getElementById('monitor-pct-fill').style.width = pct + '%';
  document.getElementById('progress-slider').value = pct;
}

function onProgressSlide(val) {
  _pendingProgress = parseInt(val);
  document.getElementById('monitor-pct').textContent = val + '%';
  document.getElementById('monitor-pct-fill').style.width = val + '%';
}

async function saveProgress() {
  if (_pendingProgress === null) return;
  await apiFetch(`/projects/${_currentProjectId}`, {
    method: 'PATCH',
    body: JSON.stringify({ progress: _pendingProgress }),
  });
  toast('進度已更新');
}

function closeMonitor() {
  _currentProjectId = null;
  document.getElementById('project-monitor').style.display = 'none';
  loadProjects();
}

function renderMilestones(list) {
  const el = document.getElementById('milestones-list');
  if (list.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:.82rem;padding:.5rem 0">尚無里程碑</div>';
    return;
  }
  el.innerHTML = list.map(m => `
    <div class="milestone-item">
      <div class="milestone-check ${m.done ? 'done' : ''}" onclick="toggleMilestone('${m.id}', ${m.done ? 1 : 0})"></div>
      <div class="milestone-text">
        <div class="milestone-title ${m.done ? 'done-text' : ''}">${m.title}</div>
        ${m.due_date ? `<div class="milestone-due">${m.due_date.slice(0,10)}</div>` : ''}
      </div>
    </div>`).join('');
}

function renderLogs(list) {
  const el = document.getElementById('logs-list');
  if (list.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);font-size:.82rem;padding:.5rem 0">尚無記錄</div>';
    return;
  }
  el.innerHTML = list.map(l => `
    <div class="log-item">
      <div class="log-item-note">${l.note}</div>
      <div class="log-item-meta">
        <span>${l.logged_at.slice(0,16)}</span>
        ${l.progress_snapshot !== null ? `<span class="log-snap-chip">${l.progress_snapshot}%</span>` : ''}
      </div>
    </div>`).join('');
}

async function openEditProjectModal() {
  const { data } = await apiFetch(`/projects/${_currentProjectId}`);
  if (!data) return;
  const form = document.getElementById('edit-project-form');
  form.name.value = data.name;
  form.description.value = data.description || '';
  form.start_date.value = data.start_date ? data.start_date.slice(0, 10) : '';
  form.target_date.value = data.target_date ? data.target_date.slice(0, 10) : '';
  form.status.value = data.status;
  openModal('edit-project-modal');
}

document.getElementById('edit-project-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  Object.keys(body).forEach(k => { if (body[k] === '') body[k] = null; });
  await apiFetch(`/projects/${_currentProjectId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  closeModal('edit-project-modal');
  toast('專案已更新');
  openMonitor(_currentProjectId);
});

function openMilestoneModal() {
  document.getElementById('milestone-form').reset();
  openModal('milestone-modal');
}

async function toggleMilestone(mid, currentDone) {
  const res = await apiFetch(`/projects/milestones/${mid}`, {
    method: 'PATCH',
    body: JSON.stringify({ done: currentDone ? 0 : 1 }),
  });
  if (res.data?.projectCompleted) {
    toast(`專案完成！獲得 ${res.data.xpEarned} XP`);
  }
  openMonitor(_currentProjectId);
}

async function submitLog() {
  const note = document.getElementById('log-note-input').value.trim();
  if (!note) return toast('請輸入記錄內容', true);
  await apiFetch(`/projects/${_currentProjectId}/logs`, {
    method: 'POST',
    body: JSON.stringify({ note, progress_snapshot: _pendingProgress }),
  });
  document.getElementById('log-note-input').value = '';
  openMonitor(_currentProjectId);
}

async function deleteCurrentProject() {
  if (!confirm('確定刪除此專案？所有里程碑和記錄將一併刪除。')) return;
  await apiFetch(`/projects/${_currentProjectId}`, { method: 'DELETE' });
  toast('專案已刪除');
  closeMonitor();
}

document.getElementById('project-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  Object.keys(body).forEach(k => { if (!body[k]) delete body[k]; });
  const { data } = await apiFetch('/projects', { method: 'POST', body: JSON.stringify(body) });
  if (data) {
    closeModal('project-modal');
    e.target.reset();
    toast('專案已建立');
    loadProjects();
  }
});

document.getElementById('milestone-form').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  Object.keys(body).forEach(k => { if (!body[k]) delete body[k]; });
  const { data } = await apiFetch(`/projects/${_currentProjectId}/milestones`, {
    method: 'POST', body: JSON.stringify(body),
  });
  if (data) {
    closeModal('milestone-modal');
    e.target.reset();
    toast('里程碑已新增');
    openMonitor(_currentProjectId);
  }
});

// ════════════════════════════════════════
//  Debug Log
// ════════════════════════════════════════
let _currentLogId = null;
let _dlSearchTimer = null;
let _dlSevFilter = 'all';
let _dlPreviewVisible = true;

// marked 設定：延遲到 DOMContentLoaded 後執行，確保 CDN 腳本已載入
function initMarked() {
  if (typeof marked !== 'undefined') {
    marked.setOptions({
      highlight: (code, lang) => {
        if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang }).value;
        }
        return code;
      },
      breaks: true,
    });
  }
}
document.addEventListener('DOMContentLoaded', initMarked);

function renderMd(content) {
  if (typeof marked === 'undefined') return `<pre>${content}</pre>`;
  return marked.parse(content || '');
}

// ── 篩選按鈕 ──
document.querySelectorAll('.dl-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.dl-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _dlSevFilter = btn.dataset.sev;
    loadDebugLogs();
  });
});

function debounceSearch() {
  clearTimeout(_dlSearchTimer);
  _dlSearchTimer = setTimeout(loadDebugLogs, 280);
}

async function loadDebugLogs() {
  document.getElementById('dl-detail-view').style.display = 'none';
  document.getElementById('dl-list-view').style.display = 'block';
  const q = document.getElementById('dl-search').value.trim();
  let url = '/debug-logs?';
  if (q) url += `q=${encodeURIComponent(q)}&`;
  if (_dlSevFilter !== 'all') url += `severity=${_dlSevFilter}`;
  const { data } = await apiFetch(url);
  const el = document.getElementById('dl-list');
  if (!data || data.length === 0) {
    el.innerHTML = '<div style="color:var(--text-muted);padding:2rem 0;text-align:center">尚無記錄，點擊右上角新增第一筆 Debug Log</div>';
    return;
  }
  el.innerHTML = data.map(log => {
    const tags = log.tags ? log.tags.split(',').filter(Boolean) : [];
    const excerpt = (log.content || '').replace(/[#*`>\-_]/g, '').slice(0, 120);
    return `
      <div class="dl-card" onclick="openLogDetail('${log.id}')">
        <div class="dl-card-title-row">
          <span class="sev-badge sev-${log.severity}">${log.severity}</span>
          <span class="dl-card-title">${log.title}</span>
        </div>
        ${excerpt ? `<div class="dl-card-excerpt">${excerpt}${log.content.length > 120 ? '...' : ''}</div>` : ''}
        <div class="dl-card-footer">
          <span>${log.created_at.slice(0, 16)}</span>
          ${tags.map(t => `<span class="dl-tag">#${t.trim()}</span>`).join('')}
        </div>
      </div>`;
  }).join('');
}

async function openLogDetail(id) {
  _currentLogId = id;
  const { data } = await apiFetch(`/debug-logs/${id}`);
  if (!data) return;
  document.getElementById('dl-list-view').style.display = 'none';
  document.getElementById('dl-detail-view').style.display = 'block';
  const sev = document.getElementById('dl-detail-sev-badge');
  sev.textContent = data.severity;
  sev.className = `sev-badge sev-${data.severity}`;
  document.getElementById('dl-detail-title').textContent = data.title;
  document.getElementById('dl-detail-date').textContent = data.created_at.slice(0, 16);
  const tags = (data.tags || '').split(',').filter(Boolean);
  document.getElementById('dl-detail-tags').innerHTML = tags.map(t => `<span class="dl-tag">#${t.trim()}</span>`).join('');
  document.getElementById('dl-detail-body').innerHTML = renderMd(data.content);
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('#dl-detail-body pre code').forEach(el => hljs.highlightElement(el));
  }
}

function closeDlDetail() {
  _currentLogId = null;
  document.getElementById('dl-detail-view').style.display = 'none';
  document.getElementById('dl-list-view').style.display = 'block';
}

async function copyCurrentLog() {
  const res = await fetch(`/api/debug-logs/${_currentLogId}/export`);
  const text = await res.text();
  await navigator.clipboard.writeText(text);
  toast('已複製 Markdown 到剪貼簿');
}

async function deleteCurrentLog() {
  if (!confirm('確定刪除此 Debug Log？')) return;
  await apiFetch(`/debug-logs/${_currentLogId}`, { method: 'DELETE' });
  toast('已刪除');
  closeDlDetail();
  loadDebugLogs();
}

// ── Editor ──
async function openDebugEditor(editId = null) {
  document.getElementById('dl-title-input').value = '';
  document.getElementById('dl-content-editor').value = '';
  document.getElementById('dl-tags-input').value = '';
  document.getElementById('dl-sev-select').value = 'info';
  document.getElementById('dl-project-select').value = '';
  document.getElementById('dl-live-preview').innerHTML = '';
  document.getElementById('dl-editor-modal').dataset.editId = '';

  // 填入專案選項
  const { data: projects } = await apiFetch('/projects');
  const sel = document.getElementById('dl-project-select');
  sel.innerHTML = '<option value="">— 不連結專案 —</option>';
  (projects || []).forEach(p => {
    sel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
  });

  if (editId) {
    const { data } = await apiFetch(`/debug-logs/${editId}`);
    if (data) {
      document.getElementById('dl-title-input').value = data.title;
      document.getElementById('dl-content-editor').value = data.content;
      document.getElementById('dl-tags-input').value = data.tags;
      document.getElementById('dl-sev-select').value = data.severity;
      document.getElementById('dl-project-select').value = data.project_id || '';
      document.getElementById('dl-editor-modal').dataset.editId = editId;
      syncPreview();
    }
  }

  // 預設單欄（不預渲染，減少打字卡頓；使用者可點「預覽」手動開啟）
  _dlPreviewVisible = false;
  document.getElementById('dl-preview-pane').classList.add('hidden');
  document.getElementById('dl-editor-pane').classList.add('full');

  openModal('dl-editor-modal');
}

function editCurrentLog() {
  openDebugEditor(_currentLogId);
}

function closeDebugEditor() {
  closeModal('dl-editor-modal');
}

let _syncPreviewTimer = null;
function syncPreview() {
  if (!_dlPreviewVisible) return;
  clearTimeout(_syncPreviewTimer);
  _syncPreviewTimer = setTimeout(() => {
    const content = document.getElementById('dl-content-editor').value;
    const preview = document.getElementById('dl-live-preview');
    preview.innerHTML = renderMd(content);
    if (typeof hljs !== 'undefined') {
      preview.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    }
  }, 400);
}

function togglePreview() {
  _dlPreviewVisible = !_dlPreviewVisible;
  document.getElementById('dl-preview-pane').classList.toggle('hidden', !_dlPreviewVisible);
  document.getElementById('dl-editor-pane').classList.toggle('full', !_dlPreviewVisible);
  if (_dlPreviewVisible) {
    const content = document.getElementById('dl-content-editor').value;
    const preview = document.getElementById('dl-live-preview');
    preview.innerHTML = renderMd(content);
    if (typeof hljs !== 'undefined') {
      preview.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    }
  }
}

async function saveDebugLog() {
  const title = document.getElementById('dl-title-input').value.trim();
  if (!title) return toast('請輸入標題', true);
  const body = {
    title,
    content: document.getElementById('dl-content-editor').value,
    tags: document.getElementById('dl-tags-input').value.trim(),
    severity: document.getElementById('dl-sev-select').value,
    project_id: document.getElementById('dl-project-select').value || null,
  };
  const editId = document.getElementById('dl-editor-modal').dataset.editId;
  if (editId) {
    await apiFetch(`/debug-logs/${editId}`, { method: 'PATCH', body: JSON.stringify(body) });
    toast('已更新');
    closeDebugEditor();
    openLogDetail(editId);
  } else {
    const { data } = await apiFetch('/debug-logs', { method: 'POST', body: JSON.stringify(body) });
    if (data) {
      toast('Debug Log 已儲存');
      closeDebugEditor();
      loadDebugLogs();
    }
  }
}

// ════════════════════════════════════════
//  AI 助理
// ════════════════════════════════════════
let _aiHistory = [];
let _aiTyping = false;

function toggleAiChat() {
  const panel = document.getElementById('ai-chat-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    setTimeout(() => document.getElementById('ai-input').focus(), 80);
  }
}

function clearAiHistory() {
  _aiHistory = [];
  const msgs = document.getElementById('ai-messages');
  msgs.innerHTML = `<div class="ai-msg ai">
    <div class="ai-bubble">對話記錄已清除。有什麼我能幫你的？</div>
  </div>`;
}

function handleAiKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendAiMessage();
  }
}

function appendAiMsg(role, text, actions = []) {
  const msgs = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  const actionsHtml = actions.length
    ? `<div class="ai-actions-list">${actions.map(a => `<span class="ai-action-item">${a}</span>`).join('')}</div>`
    : '';
  div.innerHTML = `<div class="ai-bubble">${text.replace(/\n/g, '<br>')}${actionsHtml}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendAiMessage() {
  if (_aiTyping) return;
  const input = document.getElementById('ai-input');
  const msg = input.value.trim();
  if (!msg) return;

  input.value = '';
  appendAiMsg('user', msg);

  _aiTyping = true;
  document.getElementById('ai-send-btn').disabled = true;
  const loadingDiv = appendAiMsg('ai', '思考中...');
  loadingDiv.querySelector('.ai-bubble').classList.add('loading');

  try {
    const res = await apiFetch('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: msg, history: _aiHistory }),
    });

    loadingDiv.remove();

    if (res.success) {
      const { reply, actions } = res.data;
      appendAiMsg('ai', reply, actions);
      _aiHistory.push({ role: 'user', text: msg });
      _aiHistory.push({ role: 'model', text: reply });
      if (_aiHistory.length > 20) _aiHistory = _aiHistory.slice(-20);

      // 若有執行操作，自動刷新目前頁面
      if (actions.length > 0) {
        const activePage = document.querySelector('.page.active')?.id;
        if (activePage === 'dashboard') { loadDailyChallenge(); loadStats(); }
        else if (activePage === 'goals') loadGoals();
        else if (activePage === 'habits') loadHabits();
        else if (activePage === 'journal') loadJournal();
        else if (activePage === 'projects') loadProjects();
        else if (activePage === 'debuglog') loadDebugLogs();
      }
    } else {
      appendAiMsg('ai', `錯誤：${res.message}`);
    }
  } catch (e) {
    loadingDiv.remove();
    appendAiMsg('ai', '連線失敗，請確認伺服器狀態');
  }

  _aiTyping = false;
  document.getElementById('ai-send-btn').disabled = false;
  document.getElementById('ai-input').focus();
}

// ════════════════════════════════════════
//  Usage 下拉
// ════════════════════════════════════════
let _usageOpen = false;

function toggleUsageDropdown() {
  _usageOpen = !_usageOpen;
  document.getElementById('usage-panel').classList.toggle('open', _usageOpen);
  document.getElementById('usage-trigger').classList.toggle('open', _usageOpen);
  if (_usageOpen) loadUsage();
}

document.addEventListener('click', e => {
  const wrap = document.getElementById('usage-wrap');
  if (_usageOpen && wrap && !wrap.contains(e.target)) {
    _usageOpen = false;
    document.getElementById('usage-panel').classList.remove('open');
    document.getElementById('usage-trigger').classList.remove('open');
  }
});

async function loadUsage() {
  const { data } = await apiFetch('/usage');
  if (!data) return;

  const { gemini, claude, weekStart } = data;

  document.getElementById('gemini-week-calls').textContent = gemini.weekCalls + ' 次';
  document.getElementById('gemini-today-calls').textContent = gemini.todayCalls + ' 次';

  const totalTokens = (gemini.weekTokensIn || 0) + (gemini.weekTokensOut || 0);
  document.getElementById('gemini-tokens').textContent =
    totalTokens > 0 ? (totalTokens >= 1000 ? (totalTokens / 1000).toFixed(1) + 'K' : totalTokens + '') : '0';

  // 狀態燈 & badge
  let statusClass = 'ok', statusText = '正常', dotClass = '';
  if (gemini.weekCalls > 800) { statusClass = 'high'; statusText = '用量高'; dotClass = 'high'; }
  else if (gemini.weekCalls > 400) { statusClass = 'warn'; statusText = '注意'; dotClass = 'warn'; }

  const badge = document.getElementById('gemini-status-badge');
  badge.textContent = statusText;
  badge.className = `usage-badge ${statusClass}`;
  const dot = document.getElementById('usage-dot');
  dot.className = `usage-dot ${dotClass}`;

  // Claude
  document.getElementById('claude-conv-input').value = claude.weekConversations || '';
  document.getElementById('claude-note-input').value = claude.note || '';

  // 週範圍
  const ws = new Date(weekStart);
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  document.getElementById('usage-week-range').textContent =
    `${ws.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} — ` +
    `${we.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`;
}

async function refreshClaudeUsage() {
  const btn = document.getElementById('claude-refresh-btn');
  const msg = document.getElementById('claude-status-msg');
  btn.classList.add('spinning');
  btn.disabled = true;
  msg.textContent = '抓取中...';
  try {
    const res = await apiFetch('/usage/claude/live');
    if (res.success) {
      const { usedPercent, plan, resetAt } = res.data;
      document.getElementById('claude-live-row').style.display = 'flex';
      document.getElementById('claude-plan-row').style.display = 'flex';
      document.getElementById('claude-pct').textContent = usedPercent + '%';
      document.getElementById('claude-plan').textContent = plan || 'Pro';
      const fill = document.getElementById('claude-bar-fill');
      fill.style.width = usedPercent + '%';
      fill.className = 'usage-bar-fill' + (usedPercent > 80 ? ' high' : usedPercent > 50 ? ' warn' : '');
      if (resetAt) {
        document.getElementById('claude-reset-row').style.display = 'flex';
        document.getElementById('claude-reset').textContent = new Date(resetAt).toLocaleDateString('zh-TW');
      }
      msg.textContent = '已更新 ' + new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
      document.getElementById('claude-session-hint').style.display = 'none';
    } else if (res.message?.includes('SESSION_EXPIRED') || res.message?.includes('Session')) {
      msg.textContent = '';
      document.getElementById('claude-session-hint').style.display = 'block';
    } else {
      msg.textContent = '錯誤：' + res.message;
    }
  } catch {
    msg.textContent = '連線失敗';
  }
  btn.classList.remove('spinning');
  btn.disabled = false;
}

// ════════════════════════════════════════
//  即將到來（Today 面板）
// ════════════════════════════════════════
async function loadUpcoming() {
  const { data } = await apiFetch('/calendar/upcoming?days=7');
  if (!data) return;
  const { events, goals, milestones } = data;

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const items = [];

  (events || []).forEach(e => {
    items.push({ date: e.date, title: e.title, type: '行程', time: e.all_day ? '全天' : e.time || '', color: e.color });
  });
  (goals || []).forEach(g => {
    items.push({ date: g.target_date, title: g.title, type: '目標截止', color: '#c97430' });
  });
  (milestones || []).forEach(m => {
    items.push({ date: m.due_date, title: `${m.project_name} · ${m.title}`, type: '里程碑', color: '#7a5ab0' });
  });

  if (items.length === 0) return;

  items.sort((a, b) => a.date.localeCompare(b.date));

  const section = document.getElementById('upcoming-section');
  section.style.display = 'block';
  document.getElementById('upcoming-list').innerHTML = items.map(item => {
    let chipClass = 'soon', chipText = item.date.slice(5).replace('-', '/');
    if (item.date === today)    { chipClass = 'today';    chipText = '今天'; }
    if (item.date === tomorrow) { chipClass = 'tomorrow'; chipText = '明天'; }
    const timeStr = item.time ? `<span style="color:var(--text-muted);font-size:.72rem;margin-left:.3rem">${item.time}</span>` : '';
    const targetPage = item.type === '行程' ? 'calendar' : item.type === '里程碑' ? 'projects' : 'goals';
    return `<div class="upcoming-item" onclick="navigateTo('${targetPage}')" style="cursor:pointer" title="前往${item.type === '行程' ? '行事曆' : item.type === '里程碑' ? '專案' : '目標'}頁">
      <span class="upcoming-day-chip ${chipClass}">${chipText}</span>
      <span class="upcoming-color-dot" style="background:${item.color}"></span>
      <span class="upcoming-item-title">${item.title}${timeStr}</span>
      <span class="upcoming-item-type">${item.type}</span>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════
//  行事曆
// ════════════════════════════════════════
let _calYear  = new Date().getFullYear();
let _calMonth = new Date().getMonth() + 1;
let _calSelectedDate = null;
let _calEvents = {};
let _calEditingId = null;
const _calSelectedColor = { value: '#2270c9' };

async function loadCalendar() {
  await fetchCalendarMonth(_calYear, _calMonth);
  renderCalendar();
  document.getElementById('cal-day-panel').style.display = 'none';
}

async function fetchCalendarMonth(year, month) {
  const { data } = await apiFetch(`/calendar?year=${year}&month=${month}`);
  _calEvents = {};
  (data || []).forEach(e => {
    const k = e.date;
    if (!_calEvents[k]) _calEvents[k] = [];
    _calEvents[k].push(e);
  });
}

function renderCalendar() {
  const monthNames = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  document.getElementById('cal-month-label').textContent = `${_calYear} 年 ${monthNames[_calMonth - 1]}`;

  const today = new Date().toISOString().slice(0, 10);
  const firstDay = new Date(_calYear, _calMonth - 1, 1).getDay();
  const daysInMonth = new Date(_calYear, _calMonth, 0).getDate();
  const daysInPrev = new Date(_calYear, _calMonth - 1, 0).getDate();

  let html = '';
  let totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  for (let i = 0; i < totalCells; i++) {
    let dateStr, isOther = false;
    if (i < firstDay) {
      const d = daysInPrev - firstDay + 1 + i;
      const m = _calMonth === 1 ? 12 : _calMonth - 1;
      const y = _calMonth === 1 ? _calYear - 1 : _calYear;
      dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      isOther = true;
    } else if (i >= firstDay + daysInMonth) {
      const d = i - firstDay - daysInMonth + 1;
      const m = _calMonth === 12 ? 1 : _calMonth + 1;
      const y = _calMonth === 12 ? _calYear + 1 : _calYear;
      dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      isOther = true;
    } else {
      const d = i - firstDay + 1;
      dateStr = `${_calYear}-${String(_calMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    }

    const isToday = dateStr === today;
    const isSelected = dateStr === _calSelectedDate;
    const evs = _calEvents[dateStr] || [];
    const dotsHtml = evs.slice(0, 5).map(e =>
      `<div class="cal-dot" style="background:${e.color}" title="${e.title}"></div>`
    ).join('');

    html += `<div class="cal-cell${isOther?' other-month':''}${isToday?' today':''}${isSelected?' selected':''}"
      onclick="calSelectDay('${dateStr}')">
      <div class="cal-day-num">${dateStr.slice(8)}</div>
      <div class="cal-dots">${dotsHtml}</div>
    </div>`;
  }

  document.getElementById('cal-grid').innerHTML = html;
}

function calSelectDay(dateStr) {
  _calSelectedDate = dateStr;
  renderCalendar();

  const panel = document.getElementById('cal-day-panel');
  panel.style.display = 'block';

  const [y, m, d] = dateStr.split('-');
  document.getElementById('cal-day-panel-title').textContent = `${parseInt(y)} 年 ${parseInt(m)} 月 ${parseInt(d)} 日`;

  const evs = _calEvents[dateStr] || [];
  const el = document.getElementById('cal-day-events');
  if (evs.length === 0) {
    el.innerHTML = '<div class="cal-empty">這天沒有行程。點擊右上角新增。</div>';
    return;
  }
  el.innerHTML = evs.map(e => {
    const timeStr = e.all_day ? '全天' : `${e.time || ''}${e.end_time ? ' – ' + e.end_time : ''}`;
    const descStr = e.description ? `<div class="cal-event-meta">${e.description}</div>` : '';
    return `<div class="cal-event-item">
      <div class="cal-event-color-bar" style="background:${e.color}"></div>
      <div class="cal-event-body">
        <div class="cal-event-title">${e.title}</div>
        <div class="cal-event-meta">${timeStr}</div>
        ${descStr}
      </div>
      <div class="cal-event-actions">
        <button class="btn btn-sm" style="background:var(--surface2);color:var(--text-2);border:1px solid var(--border)" onclick="editCalEvent('${e.id}')">編輯</button>
      </div>
    </div>`;
  }).join('');
}

function calPrevMonth() {
  if (_calMonth === 1) { _calMonth = 12; _calYear--; }
  else _calMonth--;
  loadCalendar();
}

function calNextMonth() {
  if (_calMonth === 12) { _calMonth = 1; _calYear++; }
  else _calMonth++;
  loadCalendar();
}

function calGoToday() {
  const now = new Date();
  _calYear = now.getFullYear();
  _calMonth = now.getMonth() + 1;
  loadCalendar();
}

function openCalendarEventModal(presetDate = null) {
  _calEditingId = null;
  document.getElementById('cal-event-form').reset();
  document.getElementById('cal-event-modal-title').textContent = '新增行程';
  document.getElementById('cal-delete-btn').style.display = 'none';
  document.getElementById('cal-date').value = presetDate || new Date().toISOString().slice(0, 10);
  document.getElementById('cal-end-date').value = '';
  document.getElementById('cal-all-day').checked = true;
  document.getElementById('cal-time-row').style.display = 'none';
  selectCalColor('#2270c9', document.querySelector('.cal-color-btn'));
  openModal('cal-event-modal');
}

async function editCalEvent(id) {
  let ev = null;
  Object.values(_calEvents).forEach(arr => {
    const found = arr.find(e => e.id === id);
    if (found) ev = found;
  });
  if (!ev) return;

  _calEditingId = id;
  document.getElementById('cal-event-modal-title').textContent = '編輯行程';
  document.getElementById('cal-delete-btn').style.display = 'inline-flex';
  document.getElementById('cal-title').value = ev.title;
  document.getElementById('cal-date').value = ev.date;
  document.getElementById('cal-end-date').value = ev.end_date || '';
  document.getElementById('cal-desc').value = ev.description || '';
  document.getElementById('cal-all-day').checked = !!ev.all_day;
  document.getElementById('cal-time').value = ev.time || '';
  document.getElementById('cal-end-time').value = ev.end_time || '';
  document.getElementById('cal-time-row').style.display = ev.all_day ? 'none' : 'grid';
  // 選顏色
  document.querySelectorAll('.cal-color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.color === ev.color);
  });
  document.getElementById('cal-color').value = ev.color;
  openModal('cal-event-modal');
}

function toggleCalTime(isAllDay) {
  document.getElementById('cal-time-row').style.display = isAllDay ? 'none' : 'grid';
}

function selectCalColor(color, btn) {
  document.querySelectorAll('.cal-color-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('cal-color').value = color;
}

document.getElementById('cal-event-form').addEventListener('submit', async e => {
  e.preventDefault();
  const allDay = document.getElementById('cal-all-day').checked;
  const body = {
    title:       document.getElementById('cal-title').value.trim(),
    description: document.getElementById('cal-desc').value.trim() || null,
    date:        document.getElementById('cal-date').value,
    end_date:    document.getElementById('cal-end-date').value || null,
    time:        allDay ? null : document.getElementById('cal-time').value || null,
    end_time:    allDay ? null : document.getElementById('cal-end-time').value || null,
    all_day:     allDay,
    color:       document.getElementById('cal-color').value,
  };

  if (_calEditingId) {
    const { success } = await apiFetch(`/calendar/${_calEditingId}`, { method: 'PUT', body: JSON.stringify(body) });
    if (success) { toast('行程已更新'); closeModal('cal-event-modal'); loadCalendar().then(() => { if (_calSelectedDate) calSelectDay(_calSelectedDate); }); }
    else toast('更新失敗', true);
  } else {
    const { success } = await apiFetch('/calendar', { method: 'POST', body: JSON.stringify(body) });
    if (success) { toast('行程已新增'); closeModal('cal-event-modal'); loadCalendar().then(() => { if (body.date) calSelectDay(body.date); }); }
    else toast('新增失敗', true);
  }
});

async function deleteCalEvent() {
  if (!_calEditingId || !confirm('確定刪除此行程？')) return;
  await apiFetch(`/calendar/${_calEditingId}`, { method: 'DELETE' });
  toast('已刪除');
  closeModal('cal-event-modal');
  _calEditingId = null;
  const prevDate = _calSelectedDate;
  await loadCalendar();
  if (prevDate) calSelectDay(prevDate);
}

// ════════════════════════════════════════
//  初始化
// ════════════════════════════════════════
loadDailyChallenge();
loadStats();
loadUpcoming();
