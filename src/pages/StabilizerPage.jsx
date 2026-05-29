import { useState, useEffect } from 'react'
import { ArrowLeft, Heart, Wind, CheckCircle2, Zap } from 'lucide-react'
import { useStore } from '../store/useStore'

const TINY_ACTIONS = [
  '打開筆記本，寫下一件你今天完成的事',
  '喝一杯水，站起來走動30秒',
  '傳訊息給一個你信任的人，說「我今天有點難熬」',
  '關上所有分心的東西，做3分鐘的深呼吸',
  '打開你的學習材料，只看第一頁就好',
  '寫下3件讓你感謝的小事',
  '設定一個15分鐘的計時器，做任何一件小事',
  '把眼前最讓你焦慮的事情寫下來，然後問：最壞的情況是什麼？',
]

function BreathingExercise() {
  const [phase, setPhase] = useState('inhale') // inhale | hold | exhale
  const [count, setCount] = useState(4)
  const [active, setActive] = useState(false)

  const PHASES = {
    inhale: { label: '吸氣', duration: 4, next: 'hold', color: 'border-blue-400' },
    hold: { label: '屏住', duration: 4, next: 'exhale', color: 'border-purple-400' },
    exhale: { label: '呼氣', duration: 6, next: 'inhale', color: 'border-teal-400' },
  }

  useEffect(() => {
    if (!active) return
    if (count > 0) {
      const t = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(t)
    } else {
      const p = PHASES[phase]
      setPhase(p.next)
      setCount(PHASES[p.next].duration)
    }
  }, [active, count, phase])

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ${
          active ? PHASES[phase].color : 'border-gray-600'
        } ${active ? 'breathe-circle' : ''}`}
      >
        <span className="text-2xl font-bold text-gray-200">{active ? count : ''}</span>
        <span className="text-sm text-gray-400">{active ? PHASES[phase].label : '開始'}</span>
      </div>

      <button
        onClick={() => {
          if (!active) {
            setPhase('inhale')
            setCount(4)
          }
          setActive(!active)
        }}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
          active
            ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            : 'bg-teal-600 text-white hover:bg-teal-500'
        }`}
      >
        {active ? '暫停' : '開始呼吸練習'}
      </button>
      <p className="text-xs text-gray-500">4-4-6 呼吸法 · 激活副交感神經</p>
    </div>
  )
}

export default function StabilizerPage({ onExit }) {
  const { getTotalDaysLogged, getStreak, dailyLogs, contacts } = useStore()
  const totalDays = getTotalDaysLogged()
  const streak = getStreak()

  const randomAction = TINY_ACTIONS[Math.floor(Math.random() * TINY_ACTIONS.length)]

  const achievements = [
    totalDays > 0 && `你已經完成了 ${totalDays} 天的成長記錄`,
    streak > 0 && `你已經連線 ${streak} 天，沒有中斷`,
    contacts.length > 0 && `你已經建立了 ${contacts.length} 個人脈連結`,
    Object.keys(dailyLogs).length > 0 && '你選擇了記錄自己，而不是逃避',
    '你打開了這個系統，說明你還沒放棄',
    '崩潰不是失敗，是你的系統在告訴你需要充電',
  ].filter(Boolean).slice(0, 3)

  return (
    <div className="min-h-screen bg-stabilizer flex flex-col">
      <div className="flex items-center p-5">
        <button
          onClick={onExit}
          className="flex items-center gap-2 text-teal-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">回到征途</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-6 pb-10 max-w-sm mx-auto w-full space-y-8">
        {/* Main message */}
        <div className="text-center pt-4">
          <div className="w-14 h-14 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-teal-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">你現在安全了</h1>
          <p className="text-teal-200/80 text-sm leading-relaxed">
            崩潰不是弱點，是你的神經系統在保護你。<br />
            先照顧自己，進步可以等一會兒。
          </p>
        </div>

        {/* What you've already done */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-teal-400" />
            <h2 className="text-sm font-semibold text-teal-300">你已經做到的事</h2>
          </div>
          <ul className="space-y-2.5">
            {achievements.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-200">
                <span className="text-teal-400 shrink-0">·</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Breathing exercise */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Wind size={14} className="text-blue-400" />
            <h2 className="text-sm font-semibold text-blue-300">先呼吸一下</h2>
          </div>
          <BreathingExercise />
        </div>

        {/* Tiny action */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-gold-400" />
            <h2 className="text-sm font-semibold text-gold-300">一個微小的行動</h2>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            {randomAction}
          </p>
          <p className="text-xs text-gray-500 mt-2">不需要做更多。這一件就夠了。</p>
        </div>

        {/* Reframe */}
        <div className="w-full text-center">
          <p className="text-xs text-gray-400 italic leading-relaxed">
            「所有大人物都有過這樣的夜晚。<br />
            區別不在於他們沒崩潰，<br />
            而在於崩潰後他們選擇了繼續。」
          </p>
        </div>

        <button
          onClick={onExit}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors text-sm"
        >
          我準備好繼續了 →
        </button>
      </div>
    </div>
  )
}
