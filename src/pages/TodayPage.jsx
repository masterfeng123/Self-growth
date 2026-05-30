import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flame, Target, Zap } from 'lucide-react'
import { useStore, PILLARS, PILLAR_COLORS } from '../store/useStore'

const MOODS = [
  { value: 'great',   label: '很好', emoji: '🔥' },
  { value: 'good',    label: '不錯', emoji: '😊' },
  { value: 'neutral', label: '普通', emoji: '😐' },
  { value: 'rough',   label: '辛苦', emoji: '😔' },
  { value: 'crashed', label: '崩潰', emoji: '💔' },
]

function PillarCard({ pillar, data, onToggle, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const colors = PILLAR_COLORS[pillar.color]

  return (
    <div className={`pillar-card ${data.done ? 'pillar-done' : 'pillar-pending'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          style={{ color: data.done ? undefined : '#5e5e68', transition: 'color 150ms' }}
        >
          {data.done
            ? <CheckCircle2 size={20} className={colors.text} />
            : <Circle size={20} style={{ color: '#5e5e68' }} />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '15px' }}>{pillar.emoji}</span>
            <span style={{
              fontSize: '13px',
              fontWeight: data.done ? 500 : 400,
              color: data.done ? '#f0f0f4' : '#c4c4cc',
              transition: 'all 150ms',
            }}>
              {pillar.label}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '2px' }}>
            {pillar.desc}
          </p>
        </div>

        {data.done && (
          <span className={`text-xs font-medium ${colors.text}`} style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2px 8px',
            borderRadius: '99px',
            fontSize: '11px',
          }}>
            {data[pillar.field]} {pillar.unit}
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          style={{ color: '#5e5e68', transition: 'color 150ms' }}
          onMouseEnter={e => e.currentTarget.style.color = '#909098'}
          onMouseLeave={e => e.currentTarget.style.color = '#5e5e68'}
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {expanded && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div>
            <label className="label">{pillar.unit}</label>
            <input
              type="number"
              min="0"
              value={data[pillar.field] || 0}
              onChange={(e) => onUpdate({ [pillar.field]: parseInt(e.target.value) || 0 })}
              className="input"
              style={{ width: '96px' }}
            />
          </div>
          <div>
            <label className="label">備註</label>
            <textarea
              rows={2}
              value={data.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder={`今天${pillar.label}做了什麼…`}
              className="textarea"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function TodayPage({ onStabilizer }) {
  const { getTodayLog, updateTodayLog, updatePillar, completeTodayLog, getStreak } = useStore()
  const log = getTodayLog()
  const streak = getStreak()

  const today = new Date()
  const dateLabel = today.toLocaleDateString('zh-TW', {
    month: 'long', day: 'numeric', weekday: 'long',
  })

  const pillarKeys = Object.keys(PILLARS)
  const donePillars = pillarKeys.filter((k) => log.pillars[k]?.done).length
  const progress = Math.round((donePillars / pillarKeys.length) * 100)

  const hours = today.getHours()
  const greeting = hours < 12 ? '早安，戰士' : hours < 18 ? '午後繼續衝' : '晚上也不放棄'

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p style={{ fontSize: '11px', color: '#5e5e68', marginBottom: '3px', letterSpacing: '0.02em' }}>
            {dateLabel}
          </p>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {greeting} 👊
          </h1>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          background: '#161618', border: '1px solid #242729',
          padding: '5px 11px', borderRadius: '99px',
        }}>
          <Flame size={13} style={{ color: '#fb923c' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fb923c' }}>{streak}</span>
          <span style={{ fontSize: '11px', color: '#5e5e68' }}>天</span>
        </div>
      </div>

      {/* Progress */}
      <div className="card">
        <div className="flex items-center justify-between" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', color: '#909098', fontWeight: 500 }}>今日完成度</span>
          <span style={{ fontSize: '20px', fontWeight: 700, color: '#f59e0b', letterSpacing: '-0.02em' }}>
            {progress}<span style={{ fontSize: '12px', fontWeight: 400 }}>%</span>
          </span>
        </div>
        <div style={{ background: '#111113', borderRadius: '99px', height: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            borderRadius: '99px',
            transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
        <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '6px' }}>
          {donePillars}/{pillarKeys.length} 支柱完成
          {log.completed && ' · ✅ 今日已結算'}
        </p>
      </div>

      {/* Energy */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
          <Zap size={13} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#909098' }}>
            今日能量值
          </span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b', marginLeft: 'auto', letterSpacing: '-0.02em' }}>
            {log.energy}<span style={{ fontSize: '11px', color: '#5e5e68', fontWeight: 400 }}>/10</span>
          </span>
        </div>
        <input
          type="range" min="1" max="10"
          value={log.energy}
          onChange={(e) => updateTodayLog({ energy: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
        />
        <div className="flex justify-between" style={{ marginTop: '4px' }}>
          <span style={{ fontSize: '10px', color: '#5e5e68' }}>耗竭</span>
          <span style={{ fontSize: '10px', color: '#5e5e68' }}>滿血</span>
        </div>
      </div>

      {/* Focus */}
      <div className="card">
        <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
          <Target size={13} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#909098' }}>
            今天最重要的一件事
          </span>
        </div>
        <input
          type="text"
          value={log.focus}
          onChange={(e) => updateTodayLog({ focus: e.target.value })}
          placeholder="今天完成這一件，就值了…"
          className="input"
        />
      </div>

      {/* Pillars */}
      <div>
        <p className="section-title" style={{ marginBottom: '10px' }}>四大支柱</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pillarKeys.map((key) => (
            <PillarCard
              key={key}
              pillar={PILLARS[key]}
              data={log.pillars[key]}
              onToggle={() => updatePillar(key, { done: !log.pillars[key].done })}
              onUpdate={(updates) => updatePillar(key, updates)}
            />
          ))}
        </div>
      </div>

      {/* Mood + Reflection */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">今日心情</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => updateTodayLog({ mood: m.value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '99px', fontSize: '12px',
                  border: '1px solid',
                  borderColor: log.mood === m.value ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
                  color: log.mood === m.value ? '#f0f0f4' : '#5e5e68',
                  background: log.mood === m.value ? '#212124' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
                }}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">今日反思（選填）</label>
          <textarea
            rows={2}
            value={log.reflection}
            onChange={(e) => updateTodayLog({ reflection: e.target.value })}
            placeholder="今天學到什麼？明天要調整什麼？"
            className="textarea"
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {!log.completed ? (
          <button
            onClick={completeTodayLog}
            disabled={donePillars === 0}
            className="btn-primary"
            style={{ flex: 1 }}
          >
            ✅ 結算今日
          </button>
        ) : (
          <div style={{
            flex: 1, textAlign: 'center', padding: '8px',
            fontSize: '13px', color: '#4ade80', fontWeight: 500,
          }}>
            🎉 今日已完成結算！
          </div>
        )}
        <button onClick={onStabilizer} className="btn-secondary">
          需要穩一下
        </button>
      </div>

    </div>
  )
}
