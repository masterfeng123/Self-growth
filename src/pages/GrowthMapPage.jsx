import { CheckCircle2, Circle, Lock, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'

const PHASES = [
  {
    id: 1,
    label: '探索期',
    ageRange: '21–25歲',
    emoji: '🔍',
    color: 'blue',
    target: '找到方向，打好基礎',
    milestones: [
      '確定核心技術專精方向',
      '完成第一個有意義的專案',
      '建立第一批業界人脈（20人+）',
      '養成每日學習習慣（連線30天）',
      '英文溝通能力達到工作級別',
    ],
    insight: '這個階段的任務不是賺錢，是找到能讓你進入「頂流」的那條路。',
  },
  {
    id: 2,
    label: '起步期',
    ageRange: '25–28歲',
    emoji: '🚀',
    color: 'purple',
    target: '進入頂尖公司或創業，年收破百萬',
    milestones: [
      '進入科技頂尖企業或完成首輪融資',
      '建立個人品牌或代表作',
      '人脈圈擴展至業界導師',
      '副業或斜槓收入起步',
      '年薪突破100萬',
    ],
    insight: '在這5年，一個「對的公司」可以替代10年的自學。選公司比選薪水重要。',
  },
  {
    id: 3,
    label: '深化期',
    ageRange: '28–32歲',
    emoji: '⚡',
    color: 'amber',
    target: '成為領域專家，收入倍增',
    milestones: [
      '在專業領域有可量化的成果',
      '帶領小團隊或重要專案',
      '演講、寫作或教學輸出',
      '投資理財開始複利',
      '年薪突破300萬',
    ],
    insight: '30歲前的努力是線性的。30歲後若佈局得當，開始指數成長。',
  },
  {
    id: 4,
    label: '躍升期',
    ageRange: '32–36歲',
    emoji: '🏔️',
    color: 'emerald',
    target: '管理或創業，收入規模化',
    milestones: [
      '晉升高管或成立自己的公司/產品',
      '打造可複製的收入模型',
      '建立業界影響力',
      '主動收入+被動收入雙軌',
      '年薪突破1000萬',
    ],
    insight: '這個階段看的不是「你做了多少」，而是「你影響了多少人」。',
  },
  {
    id: 5,
    label: '衝刺期',
    ageRange: '36–40歲',
    emoji: '🏆',
    color: 'gold',
    target: '年薪2500萬，財務自由門口',
    milestones: [
      '公司或產品達到規模化',
      '多元化收入流穩定',
      '打造能獨立運作的系統',
      '投資組合產生被動收入300萬+',
      '🎯 年薪2500萬達成',
    ],
    insight: '到了這個時候，2500萬不是終點——那只是你在對的軌道上自然的結果。',
  },
]

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/20 text-blue-300',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/20 text-purple-300',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/20 text-amber-300',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  gold: {
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/50',
    text: 'text-gold-400',
    dot: 'bg-gold-500',
    badge: 'bg-gold-500/20 text-gold-300',
  },
}

export default function GrowthMapPage() {
  const { profile, updateProfile } = useStore()
  const currentPhase = profile.currentPhase || 1

  const currentYear = new Date().getFullYear()
  const birthYear = profile.birthYear || 2003
  const currentAge = currentYear - birthYear
  const yearsToGoal = 40 - currentAge
  const progressPct = Math.min(100, Math.round(((currentAge - 21) / 19) * 100))

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">征途地圖</h1>
        <p className="text-sm text-gray-500">從今天到 2040，每一步都算數</p>
      </div>

      {/* Overall progress */}
      <div className="card glow-gold">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500">終極目標</p>
            <p className="text-lg font-bold text-gold-400">年薪 2,500 萬</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">距離目標</p>
            <p className="text-lg font-bold text-gray-200">{yearsToGoal} 年</p>
          </div>
        </div>
        <div className="w-full bg-surface-600 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-gold-500 h-3 rounded-full transition-all duration-1000"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>21歲 出發</span>
          <span className="text-gray-300 font-medium">{currentAge}歲（你在這裡）</span>
          <span>40歲 🏆</span>
        </div>
      </div>

      {/* Current phase selector */}
      <div className="card">
        <p className="text-xs text-gray-500 mb-2">你目前在哪個階段？</p>
        <div className="flex gap-2 flex-wrap">
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => updateProfile({ currentPhase: p.id })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                currentPhase === p.id
                  ? `${COLOR_MAP[p.color].badge} border-transparent`
                  : 'border-surface-600 text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div className="space-y-4">
        {PHASES.map((phase, idx) => {
          const c = COLOR_MAP[phase.color]
          const isCurrent = phase.id === currentPhase
          const isPast = phase.id < currentPhase
          const isFuture = phase.id > currentPhase

          return (
            <div
              key={phase.id}
              className={`rounded-xl border-2 transition-all duration-200 overflow-hidden ${
                isCurrent
                  ? `${c.bg} ${c.border}`
                  : isPast
                  ? 'border-surface-600 bg-surface-800/50 opacity-70'
                  : 'border-surface-700 bg-surface-800/30 opacity-60'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{phase.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${isCurrent ? c.text : 'text-gray-400'}`}>
                          {phase.label}
                        </h3>
                        {isCurrent && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>
                            ← 你在這裡
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{phase.ageRange}</p>
                    </div>
                  </div>
                  {isFuture && <Lock size={14} className="text-gray-600 mt-0.5 shrink-0" />}
                </div>

                <p className={`text-xs font-medium mb-3 ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                  目標：{phase.target}
                </p>

                <ul className="space-y-2">
                  {phase.milestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="mt-0.5 shrink-0">
                        {isPast ? (
                          <CheckCircle2 size={13} className="text-emerald-400" />
                        ) : isCurrent ? (
                          <Circle size={13} className={c.text} />
                        ) : (
                          <Circle size={13} className="text-gray-600" />
                        )}
                      </div>
                      <span className={`text-xs ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                        {m}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent && (
                  <div className={`mt-4 pt-3 border-t ${c.border} ${c.bg} -mx-4 -mb-4 px-4 pb-4`}>
                    <p className="text-xs text-gray-400 italic">💬 {phase.insight}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Next 90 days box */}
      <div className="card border-gold-500/30">
        <h2 className="text-sm font-semibold text-gold-400 mb-2">⚡ 接下來90天的聚焦</h2>
        <p className="text-xs text-gray-400 mb-3">
          基於你目前在「{PHASES[currentPhase - 1]?.label}」階段，你最需要的是：
        </p>
        <ul className="space-y-2">
          {currentPhase === 1 && [
            '每天至少1小時深度學習技術核心',
            '每週主動認識1位業界人士',
            '開始打造第一個可展示的作品',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
              <ChevronRight size={12} className="text-gold-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
          {currentPhase === 2 && [
            '鎖定目標公司並打進去',
            '確立個人品牌的核心主題',
            '找到一位願意指導你的導師',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
              <ChevronRight size={12} className="text-gold-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
          {currentPhase >= 3 && [
            '打造可量化的專業成果',
            '開始輸出：寫作、演講、教學',
            '建立被動收入的第一塊磚',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
              <ChevronRight size={12} className="text-gold-400 mt-0.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
