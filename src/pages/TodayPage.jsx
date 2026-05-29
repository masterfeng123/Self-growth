import { useState } from 'react'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Flame, Target, Zap } from 'lucide-react'
import { useStore, PILLARS, PILLAR_COLORS } from '../store/useStore'

const MOODS = [
  { value: 'great', label: '很好', emoji: '🔥' },
  { value: 'good', label: '不錯', emoji: '😊' },
  { value: 'neutral', label: '普通', emoji: '😐' },
  { value: 'rough', label: '辛苦', emoji: '😔' },
  { value: 'crashed', label: '崩潰', emoji: '💔' },
]

function PillarCard({ pillar, data, onToggle, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const colors = PILLAR_COLORS[pillar.color]

  return (
    <div
      className={`pillar-card ${data.done ? 'pillar-done border-2' : 'pillar-pending border-2'} ${colors.border}`}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="shrink-0 text-gray-400 hover:text-white transition-colors"
        >
          {data.done ? (
            <CheckCircle2 size={22} className={colors.text} />
          ) : (
            <Circle size={22} className="text-gray-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">{pillar.emoji}</span>
            <span className={`text-sm font-semibold ${data.done ? colors.text : 'text-gray-200'}`}>
              {pillar.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{pillar.desc}</p>
        </div>

        {data.done && (
          <span className={`text-xs font-medium ${colors.text} bg-transparent border ${colors.border} px-2 py-0.5 rounded-full`}>
            {data[pillar.field]} {pillar.unit}
          </span>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-600 space-y-3">
          <div>
            <label className="label">{pillar.unit}</label>
            <input
              type="number"
              min="0"
              value={data[pillar.field] || 0}
              onChange={(e) => onUpdate({ [pillar.field]: parseInt(e.target.value) || 0 })}
              className="input w-28"
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
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const pillarKeys = Object.keys(PILLARS)
  const donePillars = pillarKeys.filter((k) => log.pillars[k]?.done).length
  const progress = Math.round((donePillars / pillarKeys.length) * 100)

  const handleComplete = () => {
    completeTodayLog()
  }

  const hours = today.getHours()
  const greeting =
    hours < 12 ? '早安，戰士' : hours < 18 ? '午後繼續衝' : '晚上也不放棄'

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{dateLabel}</p>
          <h1 className="text-xl font-bold text-gray-100">{greeting} 👊</h1>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-800 border border-surface-600 px-3 py-1.5 rounded-full">
          <Flame size={14} className="text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">{streak}</span>
          <span className="text-xs text-gray-500">天連線</span>
        </div>
      </div>

      {/* Progress overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">今日完成度</span>
          <span className="text-lg font-bold text-gold-400">{progress}%</span>
        </div>
        <div className="w-full bg-surface-600 rounded-full h-2">
          <div
            className="bg-gold-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">
          {donePillars}/{pillarKeys.length} 支柱完成
          {log.completed && ' · ✅ 今日已結算'}
        </p>
      </div>

      {/* Energy level */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-gold-400" />
          <label className="text-sm font-medium text-gray-300">
            今日能量值 <span className="text-gold-400 font-bold">{log.energy}</span>/10
          </label>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={log.energy}
          onChange={(e) => updateTodayLog({ energy: parseInt(e.target.value) })}
          className="w-full accent-amber-400"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>耗竭</span>
          <span>滿血</span>
        </div>
      </div>

      {/* Today's one focus */}
      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-gold-400" />
          <label className="text-sm font-medium text-gray-300">今天最重要的一件事</label>
        </div>
        <input
          type="text"
          value={log.focus}
          onChange={(e) => updateTodayLog({ focus: e.target.value })}
          placeholder="今天完成這一件，就值了…"
          className="input"
        />
      </div>

      {/* 4 Pillars */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          四大支柱
        </h2>
        <div className="space-y-3">
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
      <div className="card space-y-4">
        <div>
          <label className="label">今日心情</label>
          <div className="flex gap-2 flex-wrap">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => updateTodayLog({ mood: m.value })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all ${
                  log.mood === m.value
                    ? 'bg-surface-600 border-gray-400 text-gray-100'
                    : 'border-surface-600 text-gray-400 hover:border-gray-500'
                }`}
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
      <div className="flex gap-3">
        {!log.completed ? (
          <button
            onClick={handleComplete}
            disabled={donePillars === 0}
            className="flex-1 btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ✅ 結算今日
          </button>
        ) : (
          <div className="flex-1 text-center py-2.5 text-sm text-green-400 font-medium">
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
