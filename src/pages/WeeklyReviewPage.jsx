import { useState, useEffect } from 'react'
import { CheckCircle2, Calendar } from 'lucide-react'
import { useStore } from '../store/useStore'

const REVIEW_QUESTIONS = [
  { key: 'win', label: '本週最大的贏', placeholder: '這週最讓你驕傲的一件事是什麼？哪怕很小…', rows: 2 },
  { key: 'lesson', label: '本週最大的學習', placeholder: '這週踩了什麼坑？學到什麼教訓？', rows: 2 },
  { key: 'pillarReview', label: '四支柱回顧', placeholder: '學習/人脈/深度工作/知識輸入，哪個最薄弱？為什麼？', rows: 2 },
  { key: 'nextFocus', label: '下週最重要的一件事', placeholder: '如果下週只能完成一件事，那是什麼？', rows: 2 },
  { key: 'energyManagement', label: '能量管理反思', placeholder: '這週能量什麼時候最高？最低？有什麼規律？', rows: 2 },
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

  const setField = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  const handleSave = () => {
    saveWeeklyReview({ ...form, rating })
    setSaved(true)
  }

  const weekScore =
    data7.length > 0
      ? Math.round(data7.reduce((a, b) => a + b.score, 0) / 7)
      : 0

  const completedDays = data7.filter((d) => d.score > 0).length

  const pillarSummary = {
    learning: data7.filter((d) => d.learning).length,
    networking: data7.filter((d) => d.networking).length,
    deepWork: data7.filter((d) => d.deepWork).length,
    knowledge: data7.filter((d) => d.knowledge).length,
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-100">週覆盤</h1>
        <div className="flex items-center gap-2 mt-1">
          <Calendar size={13} className="text-gray-500" />
          <span className="text-sm text-gray-500">{getWeekRange()}</span>
        </div>
      </div>

      {/* Week stats */}
      <div className="card">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">本週數據快覽</h2>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-gold-400">{completedDays}</p>
            <p className="text-xs text-gray-500">有效天數</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-400">{weekScore}</p>
            <p className="text-xs text-gray-500">平均分數</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-400">
              {Object.values(pillarSummary).reduce((a, b) => a + b, 0)}
            </p>
            <p className="text-xs text-gray-500">支柱達成</p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { label: '📚 學習', count: pillarSummary.learning },
            { label: '🤝 人脈', count: pillarSummary.networking },
            { label: '🎯 深度工作', count: pillarSummary.deepWork },
            { label: '💡 知識輸入', count: pillarSummary.knowledge },
          ].map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20">{p.label}</span>
              <div className="flex gap-1 flex-1">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-sm ${i < p.count ? 'bg-gold-500' : 'bg-surface-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 w-8 text-right">{p.count}/7</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly rating */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">
            本週整體評分
          </label>
          <span className="text-2xl font-bold text-gold-400">{rating}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={rating}
          onChange={(e) => { setRating(parseInt(e.target.value)); setSaved(false) }}
          className="w-full accent-amber-400"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 很爛</span>
          <span>5 普通</span>
          <span>10 完美</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 italic">
          {rating <= 3 && '這週很難熬，但你撐過來了。下週從一件小事開始。'}
          {rating > 3 && rating <= 6 && '不錯的一週，有進步就算贏。找出哪裡可以再加10分。'}
          {rating > 6 && rating <= 8 && '很好的表現！記錄下是什麼讓這週這麼順，複製它。'}
          {rating > 8 && '頂級週！分析清楚成功的條件，讓這成為你的新基準線。'}
        </p>
      </div>

      {/* Review questions */}
      {REVIEW_QUESTIONS.map(({ key, label, placeholder, rows }) => (
        <div key={key} className="card space-y-2">
          <label className="text-sm font-medium text-gray-300">{label}</label>
          <textarea
            rows={rows}
            value={form[key]}
            onChange={(e) => setField(key, e.target.value)}
            placeholder={placeholder}
            className="textarea"
          />
        </div>
      ))}

      {/* Save button */}
      <div className="flex gap-3 pb-4">
        <button onClick={handleSave} className="flex-1 btn-primary">
          {saved ? '✅ 已儲存' : '儲存本週覆盤'}
        </button>
      </div>

      {saved && (
        <div className="card border-green-500/30 bg-green-500/5 text-center">
          <CheckCircle2 size={20} className="text-green-400 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-400">覆盤完成</p>
          <p className="text-xs text-gray-500 mt-0.5">
            持續覆盤的人，比不覆盤的人快2-3倍成長。你做到了。
          </p>
        </div>
      )}
    </div>
  )
}
