import { CheckCircle2, Circle, Lock, ChevronRight, MapPin } from 'lucide-react'
import { useStore } from '../store/useStore'

const PHASES = [
  {
    id: 1,
    label: '探索期',
    ageRange: '21–25歲',
    emoji: '🔍',
    accent: '#60a5fa',
    accentBg: 'rgba(96,165,250,0.08)',
    accentBorder: 'rgba(96,165,250,0.25)',
    target: '找到方向，打好技術基礎',
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
    accent: '#a78bfa',
    accentBg: 'rgba(167,139,250,0.08)',
    accentBorder: 'rgba(167,139,250,0.25)',
    target: '進入頂尖公司或創業，年收破百萬',
    milestones: [
      '進入科技頂尖企業或完成首輪融資',
      '建立個人品牌或代表作',
      '人脈圈擴展至業界導師',
      '副業或斜槓收入起步',
      '年薪突破 100 萬',
    ],
    insight: '在這5年，一個「對的公司」可以替代10年的自學。選公司比選薪水重要。',
  },
  {
    id: 3,
    label: '深化期',
    ageRange: '28–32歲',
    emoji: '⚡',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.25)',
    target: '成為領域專家，收入倍增',
    milestones: [
      '在專業領域有可量化的成果',
      '帶領小團隊或重要專案',
      '演講、寫作或教學輸出',
      '投資理財開始複利',
      '年薪突破 300 萬',
    ],
    insight: '30歲前的努力是線性的。30歲後若佈局得當，開始指數成長。',
  },
  {
    id: 4,
    label: '躍升期',
    ageRange: '32–36歲',
    emoji: '🏔️',
    accent: '#34d399',
    accentBg: 'rgba(52,211,153,0.08)',
    accentBorder: 'rgba(52,211,153,0.25)',
    target: '管理或創業，收入規模化',
    milestones: [
      '晉升高管或成立自己的公司/產品',
      '打造可複製的收入模型',
      '建立業界影響力',
      '主動收入 + 被動收入雙軌',
      '年薪突破 1000 萬',
    ],
    insight: '這個階段看的不是「你做了多少」，而是「你影響了多少人」。',
  },
  {
    id: 5,
    label: '衝刺期',
    ageRange: '36–40歲',
    emoji: '🏆',
    accent: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.10)',
    accentBorder: 'rgba(245,158,11,0.35)',
    target: '年薪 2500 萬，財務自由門口',
    milestones: [
      '公司或產品達到規模化',
      '多元化收入流穩定',
      '打造能獨立運作的系統',
      '投資組合產生被動收入 300 萬+',
      '🎯 年薪 2500 萬達成',
    ],
    insight: '到了這個時候，2500萬不是終點——那只是你在對的軌道上自然的結果。',
  },
]

export default function GrowthMapPage() {
  const { profile, updateProfile } = useStore()
  const currentPhase = profile.currentPhase || 1

  const currentYear = new Date().getFullYear()
  const birthYear = profile.birthYear || 2003
  const currentAge = currentYear - birthYear
  const yearsToGoal = 40 - currentAge
  const progressPct = Math.min(100, Math.max(0, Math.round(((currentAge - 21) / 19) * 100)))

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
          征途地圖
        </h1>
        <p style={{ fontSize: '12px', color: '#5e5e68', marginTop: '2px' }}>
          從今天到 2040，每一步都算數
        </p>
      </div>

      {/* Overall progress */}
      <div className="card glow-gold">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <p style={{ fontSize: '11px', color: '#5e5e68' }}>終極目標</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', letterSpacing: '-0.02em', marginTop: '2px' }}>
              年薪 2,500 萬
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#5e5e68' }}>距離目標</p>
            <p style={{ fontSize: '20px', fontWeight: 700, color: '#f0f0f4', letterSpacing: '-0.02em', marginTop: '2px' }}>
              {yearsToGoal} 年
            </p>
          </div>
        </div>
        <div style={{ background: '#111113', borderRadius: '99px', height: '5px', overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 40%, #f59e0b 100%)',
            borderRadius: '99px',
            transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5e5e68' }}>
          <span>21歲 出發</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#c4c4cc' }}>
            <MapPin size={10} />{currentAge}歲
          </span>
          <span>40歲 🏆</span>
        </div>
      </div>

      {/* Phase selector */}
      <div className="card">
        <p style={{ fontSize: '11px', color: '#5e5e68', marginBottom: '10px' }}>你目前在哪個階段？</p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PHASES.map((p) => (
            <button
              key={p.id}
              onClick={() => updateProfile({ currentPhase: p.id })}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '99px', fontSize: '12px',
                border: '1px solid',
                borderColor: currentPhase === p.id ? p.accentBorder : 'rgba(255,255,255,0.07)',
                color: currentPhase === p.id ? p.accent : '#5e5e68',
                background: currentPhase === p.id ? p.accentBg : 'transparent',
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                fontWeight: currentPhase === p.id ? 500 : 400,
              }}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {PHASES.map((phase) => {
          const isCurrent = phase.id === currentPhase
          const isPast = phase.id < currentPhase
          const isFuture = phase.id > currentPhase

          return (
            <div
              key={phase.id}
              style={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isCurrent ? phase.accentBorder : 'rgba(255,255,255,0.07)',
                background: isCurrent ? phase.accentBg : 'transparent',
                padding: '16px',
                opacity: isFuture ? 0.5 : isPast ? 0.75 : 1,
                transition: 'all 200ms cubic-bezier(0.4,0,0.2,1)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{phase.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '13px', fontWeight: isCurrent ? 600 : 500,
                      color: isCurrent ? phase.accent : '#909098',
                    }}>
                      {phase.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#5e5e68' }}>{phase.ageRange}</span>
                    {isCurrent && (
                      <span style={{
                        fontSize: '10px', padding: '2px 7px', borderRadius: '99px',
                        background: phase.accentBg, border: `1px solid ${phase.accentBorder}`,
                        color: phase.accent, fontWeight: 500,
                      }}>
                        你在這裡
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '2px' }}>
                    目標：{phase.target}
                  </p>
                </div>
                {isFuture && <Lock size={13} style={{ color: '#5e5e68', flexShrink: 0 }} />}
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '7px', paddingLeft: '2px' }}>
                {phase.milestones.map((m, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ flexShrink: 0, marginTop: '1px' }}>
                      {isPast
                        ? <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                        : <Circle size={12} style={{ color: isCurrent ? phase.accent : '#5e5e68' }} />
                      }
                    </span>
                    <span style={{ fontSize: '12px', color: isCurrent ? '#c4c4cc' : '#5e5e68' }}>
                      {m}
                    </span>
                  </li>
                ))}
              </ul>

              {isCurrent && (
                <div style={{
                  marginTop: '14px', paddingTop: '12px',
                  borderTop: `1px solid ${phase.accentBorder}`,
                }}>
                  <p style={{ fontSize: '12px', color: '#909098', fontStyle: 'italic', lineHeight: 1.6 }}>
                    💬 {phase.insight}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 90-day focus */}
      <div className="card" style={{ borderColor: 'rgba(245,158,11,0.2)' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#f59e0b', marginBottom: '8px' }}>
          ⚡ 接下來 90 天的聚焦
        </p>
        <p style={{ fontSize: '12px', color: '#5e5e68', marginBottom: '10px' }}>
          基於你目前在「{PHASES[currentPhase - 1]?.label}」階段，最需要：
        </p>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(currentPhase === 1 ? [
            '每天至少1小時深度學習技術核心',
            '每週主動認識1位業界人士',
            '開始打造第一個可展示的作品',
          ] : currentPhase === 2 ? [
            '鎖定目標公司並打進去',
            '確立個人品牌的核心主題',
            '找到一位願意指導你的導師',
          ] : [
            '打造可量化的專業成果',
            '開始輸出：寫作、演講、教學',
            '建立被動收入的第一塊磚',
          ]).map((item, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ChevronRight size={12} style={{ color: '#f59e0b', marginTop: '2px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#c4c4cc' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
