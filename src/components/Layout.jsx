import { Home, BarChart2, Map, Users, BookOpen, AlertCircle } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'today', label: '今日', icon: Home },
  { id: 'dashboard', label: '儀表板', icon: BarChart2 },
  { id: 'growth', label: '征途', icon: Map },
  { id: 'network', label: '人脈', icon: Users },
  { id: 'review', label: '覆盤', icon: BookOpen },
]

export default function Layout({ children, currentPage, onNavigate }) {
  return (
    <div className="flex h-full min-h-screen bg-surface-900">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-surface-800 border-r border-surface-600 shrink-0">
        <div className="p-5 border-b border-surface-600">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center">
              <span className="text-gray-900 font-bold text-sm">征</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-100">征途 2040</p>
              <p className="text-xs text-gray-500">自我成長系統</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                currentPage === id
                  ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-700'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-3">
          <button
            onClick={() => onNavigate('stabilizer')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            <AlertCircle size={16} />
            需要穩定一下
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-800 border-t border-surface-600 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                currentPage === id
                  ? 'text-gold-400'
                  : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs">{label}</span>
            </button>
          ))}
          <button
            onClick={() => onNavigate('stabilizer')}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-red-400"
          >
            <AlertCircle size={20} />
            <span className="text-xs">穩定</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
