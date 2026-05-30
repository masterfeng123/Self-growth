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
  const [phase, setPhase] = useState('inhale')
  const [count, setCount] = useState(4)
  const [active, setActive] = useState(false)

  const PHASES = {
    inhale: { label: '吸氣', duration: 4, next: 'hold',   color: '#60a5fa' },
    hold:   { label: '屏住', duration: 4, next: 'exhale', color: '#a78bfa' },
    exhale: { label: '呼氣', duration: 6, next: 'inhale', color: '#34d399' },
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

  const current = PHASES[phase]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      <div
        className={active ? 'breathe-circle' : ''}
        style={{
          width: 100, height: 100, borderRadius: '50%',
          border: `3px solid ${active ? current.color : 'rgba(255,255,255,0.15)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 500ms',
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 700, color: active ? current.color : '#5e5e68' }}>
          {active ? count : ''}
        </span>
        <span style={{ fontSize: '12px', color: active ? current.color : '#5e5e68', marginTop: '2px' }}>
          {active ? current.label : '開始'}
        </span>
      </div>

      <button
        onClick={() => {
          if (!active) { setPhase('inhale'); setCount(4) }
          setActive(!active)
        }}
        style={{
          padding: '8px 20px', borderRadius: '99px', fontSize: '13px', fontWeight: 500,
          border: 'none', cursor: 'pointer',
          background: active ? 'rgba(255,255,255,0.1)' : 'rgba(52,211,153,0.2)',
          color: active ? '#c4c4cc' : '#34d399',
          transition: 'all 200ms',
        }}
      >
        {active ? '暫停' : '開始呼吸練習'}
      </button>
      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
        4-4-6 呼吸法 · 激活副交感神經
      </p>
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

  const sectionStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
  }

  return (
    <div className="bg-stabilizer" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Back button */}
      <div style={{ padding: '20px' }}>
        <button
          onClick={onExit}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: 'rgba(52,211,153,0.8)', background: 'none', border: 'none',
            fontSize: '13px', cursor: 'pointer', transition: 'color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#34d399'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(52,211,153,0.8)'}
        >
          <ArrowLeft size={15} />
          回到征途
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 20px 48px', maxWidth: 400, margin: '0 auto', width: '100%', gap: '20px',
      }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', paddingTop: '8px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Heart size={22} style={{ color: '#34d399' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            你現在安全了
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            崩潰不是弱點，是你的神經系統在保護你。<br />
            先照顧自己，進步可以等一會兒。
          </p>
        </div>

        {/* Achievements */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle2 size={13} style={{ color: '#34d399' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#34d399', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              你已經做到的事
            </p>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {achievements.map((a, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                <span style={{ color: '#34d399', flexShrink: 0 }}>·</span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Breathing */}
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
            <Wind size={13} style={{ color: '#60a5fa' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              先呼吸一下
            </p>
          </div>
          <BreathingExercise />
        </div>

        {/* Tiny action */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Zap size={13} style={{ color: '#f59e0b' }} />
            <p style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              一個微小的行動
            </p>
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
            {randomAction}
          </p>
          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
            不需要做更多。這一件就夠了。
          </p>
        </div>

        {/* Quote */}
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', textAlign: 'center', lineHeight: 1.8 }}>
          「所有大人物都有過這樣的夜晚。<br />
          區別不在於他們沒崩潰，<br />
          而在於崩潰後他們選擇了繼續。」
        </p>

        {/* CTA */}
        <button
          onClick={onExit}
          style={{
            width: '100%', height: 44, borderRadius: '10px',
            background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)',
            color: '#34d399', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 200ms',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(52,211,153,0.22)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(52,211,153,0.15)'}
        >
          我準備好繼續了 →
        </button>

      </div>
    </div>
  )
}
