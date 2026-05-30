import { useState } from 'react'
import { CheckCircle2, Calendar } from 'lucide-react'
import { useStore } from '../store/useStore'

const REVIEW_QUESTIONS = [
  { key: 'win',              label: '本週最大的贏',     placeholder: '這週最讓你驕傲的一件事是什麼？哪怕很小…' },
  { key: 'lesson',           label: '本週最大的學習',   placeholder: '這週踩了什麼坑？學到什麼教訓？' },
  { key: 'pillarReview',     label: '四支柱回顧',       placeholder: '學習/人脈/深度工作/知識輸入，哪個最薄弱？為什麼？' },
  { key: 'nextFocus',        label: '下週最重要的一件事', placeholder: '如果下週只能完成一件事，那是什麼？' },
  { key: 'energyManagement', label: '能量管理反思',     placeholder: '這週能量什麼時候最高？最低？有什麼規律？' },
]

function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d) => d.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

export default function WeeklyReviewPage() {
  const { saveWeeklyReview, getCurrentWeekReview, getLast7Days } = useStore()
  const existing = getCurrentWeekReview()
  const data7 = getLast7Days()

  const [rating, setRating] = useState(existing?.rating || 5)
  const [form, setForm] = useState({
    win: existing?.win || '',
    lesson: existing?.lesson || '',
    pillarReview: existing?.pillarReview || '',
    nextFocus: existing?.nextFocus || '',
    energyManagement: existing?.energyManagement || '',
  })
  const [saved, setSaved] = useState(!!existing)

  const setField = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false) }

  const weekScore = data7.length > 0
    ? Math.round(data7.reduce((a, b) => a + b.score, 0) / 7)
    : 0
  const completedDays = data7.filter((d) => d.score > 0).length
  const pillarSummary = {
    learning:   data7.filter((d) => d.learning).length,
    networking: data7.filter((d) => d.networking).length,
    deepWork:   data7.filter((d) => d.deepWork).length,
    knowledge:  data7.filter((d) => d.knowledge).length,
  }

  const ratingComment = rating <= 3
    ? '這週很難熬，但你撐過來了。下週從一件小事開始。'
    : rating <= 6
    ? '不錯的一週，有進步就算贏。找出哪裡可以再加10分。'
    : rating <= 8
    ? '很好的表現！記錄下是什麼讓這週這麼順，複製它。'
    : '頂級週！分析成功條件，讓這成為你的新基準線。'

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
          週覆盤
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
          <Calendar size={12} style={{ color: '#5e5e68' }} />
          <span style={{ fontSize: '12px', color: '#5e5e68' }}>{getWeekRange()}</span>
        </div>
      </div>

      {/* Week stats */}
      <div className="card">
        <p className="section-title" style={{ marginBottom: '14px' }}>本週數據快覽</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          {[
            { val: completedDays, label: '有效天數', color: '#f59e0b' },
            { val: weekScore,     label: '平均分數', color: '#60a5fa' },
            { val: Object.values(pillarSummary).reduce((a, b) => a + b, 0), label: '支柱達成', color: '#a78bfa' },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '22px', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: '10px', color: '#5e5e68', marginTop: '3px' }}>{label}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: '📚 學習',    count: pillarSummary.learning,   color: '#60a5fa' },
            { label: '🤝 人脈',    count: pillarSummary.networking,  color: '#a78bfa' },
            { label: '🎯 深度工作', count: pillarSummary.deepWork,    color: '#f59e0b' },
            { label: '💡 知識輸入', count: pillarSummary.knowledge,   color: '#34d399' },
          ].map((p) => (
            <div key={p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#909098' }}>{p.label}</span>
                <span style={{ fontSize: '11px', color: '#5e5e68' }}>{p.count}/7 天</span>
              </div>
              <div style={{ display: 'flex', gap: '3px' }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '99px',
                    background: i < p.count ? p.color : '#1e1e21',
                    transition: 'background 400ms',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#909098' }}>本週整體評分</span>
          <span style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', letterSpacing: '-0.03em' }}>
            {rating}<span style={{ fontSize: '12px', color: '#5e5e68', fontWeight: 400 }}>/10</span>
          </span>
        </div>
        <input
          type="range" min="1" max="10"
          value={rating}
          onChange={(e) => { setRating(parseInt(e.target.value)); setSaved(false) }}
          style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#5e5e68', marginTop: '4px', marginBottom: '10px' }}>
          <span>1 很爛</span>
          <span>5 普通</span>
          <span>10 完美</span>
        </div>
        <p style={{ fontSize: '12px', color: '#909098', fontStyle: 'italic', lineHeight: 1.6 }}>
          {ratingComment}
        </p>
      </div>

      {/* Review questions */}
      {REVIEW_QUESTIONS.map(({ key, label, placeholder }) => (
        <div key={key} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label className="label">{label}</label>
          <textarea
            rows={2}
            value={form[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={placeholder}
            className="textarea"
          />
        </div>
      ))}

      {/* Save */}
      <button
        onClick={() => { saveWeeklyReview({ ...form, rating }); setSaved(true) }}
        className="btn-primary"
        style={{ width: '100%', height: 40, fontSize: '14px' }}
      >
        {saved ? '✅ 已儲存' : '儲存本週覆盤'}
      </button>

      {saved && (
        <div style={{
          background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.2)',
          borderRadius: '10px', padding: '16px', textAlign: 'center',
        }}>
          <CheckCircle2 size={18} style={{ color: '#34d399', margin: '0 auto 6px' }} />
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#34d399' }}>覆盤完成</p>
          <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '4px' }}>
            持續覆盤的人，比不覆盤的人快 2-3 倍成長。你做到了。
          </p>
        </div>
      )}

    </div>
  )
}
