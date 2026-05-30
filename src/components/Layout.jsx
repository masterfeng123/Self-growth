import { Home, BarChart2, Map, Users, BookOpen, AlertTriangle, GitBranch } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'today',     label: '今日',   icon: Home },
  { id: 'goals',     label: '任務樹', icon: GitBranch },
  { id: 'dashboard', label: '儀表板', icon: BarChart2 },
  { id: 'growth',    label: '征途',   icon: Map },
  { id: 'network',   label: '人脈',   icon: Users },
  { id: 'review',    label: '覆盤',   icon: BookOpen },
]

export default function Layout({ children, currentPage, onNavigate }) {
  return (
    <div className="flex h-full min-h-screen" style={{ background: '#0c0c0e' }}>

      {/* ── Desktop sidebar ──────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0"
        style={{
          background: '#111113',
          borderRight: '1px solid #1e1e21',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-4 py-4"
          style={{ borderBottom: '1px solid #1e1e21' }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: '#f59e0b' }}
          >
            <span style={{ color: '#1a1000', fontSize: '11px', fontWeight: 700 }}>征</span>
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#f0f0f4', lineHeight: 1.2 }}>
              征途 2040
            </p>
            <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '1px' }}>
              自我成長系統
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="w-full flex items-center gap-2.5"
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: active ? 500 : 400,
                  color: active ? '#f0f0f4' : '#909098',
                  background: active ? '#212124' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = '#161618'
                    e.currentTarget.style.color = '#d0d0d8'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#909098'
                  }
                }}
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.75} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Emergency button */}
        <div className="p-2 pb-3">
          <button
            onClick={() => onNavigate('stabilizer')}
            className="w-full flex items-center gap-2.5"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 400,
              color: '#f87171',
              background: 'transparent',
              border: '1px solid rgba(248,113,113,0.2)',
              cursor: 'pointer',
              transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <AlertTriangle size={13} strokeWidth={1.75} />
            需要穩定一下
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0 fade-up">
          {children}
        </main>
      </div>

      {/* ── Mobile bottom nav ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(17,17,19,0.92)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid #1e1e21',
        }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = currentPage === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="flex flex-col items-center"
                style={{
                  gap: '3px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                  minWidth: 44,
                }}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2 : 1.5}
                  color={active ? '#f59e0b' : '#5e5e68'}
                />
                <span style={{
                  fontSize: '10px',
                  fontWeight: active ? 500 : 400,
                  color: active ? '#f59e0b' : '#5e5e68',
                  letterSpacing: '0.02em',
                }}>
                  {label}
                </span>
              </button>
            )
          })}
          <button
            onClick={() => onNavigate('stabilizer')}
            className="flex flex-col items-center"
            style={{
              gap: '3px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              minWidth: 44,
            }}
          >
            <AlertTriangle size={19} strokeWidth={1.5} color="#f87171" />
            <span style={{ fontSize: '10px', color: '#f87171', letterSpacing: '0.02em' }}>
              穩定
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}
