import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
} from 'recharts'
import { Flame, TrendingUp, Users, Award } from 'lucide-react'
import { useStore } from '../store/useStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-700 border border-surface-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-gray-300 font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-gold-400' }) {
  return (
    <div className="card flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
        <Icon size={18} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { getLast7Days, getStreak, getTotalDaysLogged, contacts, dailyLogs } = useStore()
  const data7 = getLast7Days()
  const streak = getStreak()
  const totalDays = getTotalDaysLogged()

  const avgScore =
    data7.length > 0
      ? Math.round(data7.reduce((a, b) => a + b.score, 0) / data7.filter((d) => d.score > 0).length) || 0
      : 0

  const pillarTotals = {
    learning: data7.filter((d) => d.learning).length,
    networking: data7.filter((d) => d.networking).length,
    deepWork: data7.filter((d) => d.deepWork).length,
    knowledge: data7.filter((d) => d.knowledge).length,
  }

  const radarData = [
    { subject: '學習', A: (pillarTotals.learning / 7) * 100 },
    { subject: '人脈', A: (pillarTotals.networking / 7) * 100 },
    { subject: '深度工作', A: (pillarTotals.deepWork / 7) * 100 },
    { subject: '知識輸入', A: (pillarTotals.knowledge / 7) * 100 },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-100">儀表板</h1>
        <p className="text-sm text-gray-500">你的成長數據全景</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={Flame}
          label="當前連線天數"
          value={`${streak}天`}
          sub="每天進步一點點"
          color="text-orange-400"
        />
        <StatCard
          icon={Award}
          label="累積完成天數"
          value={`${totalDays}天`}
          sub="你已走了這麼遠"
          color="text-gold-400"
        />
        <StatCard
          icon={TrendingUp}
          label="本週平均分數"
          value={`${avgScore}分`}
          sub="100分為滿"
          color="text-blue-400"
        />
        <StatCard
          icon={Users}
          label="人脈總計"
          value={`${contacts.length}人`}
          sub="你的關係資本"
          color="text-purple-400"
        />
      </div>

      {/* 7-day score bar chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">近7日每日得分</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data7} barSize={22}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} name="分數" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Energy trend */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">近7日能量趨勢</h2>
        <ResponsiveContainer width="100%" height={130}>
          <LineChart data={data7}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="#60a5fa"
              strokeWidth={2}
              dot={{ fill: '#60a5fa', r: 3 }}
              name="能量"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Radar chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">本週四大支柱完成率</h2>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#21262d" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Radar dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pillar breakdown */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-3">本週支柱達成次數（7天中）</h2>
        <div className="space-y-3">
          {[
            { label: '📚 學習成長', count: pillarTotals.learning, color: 'bg-blue-500' },
            { label: '🤝 人脈經營', count: pillarTotals.networking, color: 'bg-purple-500' },
            { label: '🎯 深度工作', count: pillarTotals.deepWork, color: 'bg-amber-500' },
            { label: '💡 知識輸入', count: pillarTotals.knowledge, color: 'bg-emerald-500' },
          ].map((p) => (
            <div key={p.label}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{p.label}</span>
                <span>{p.count}/7 天</span>
              </div>
              <div className="w-full bg-surface-600 rounded-full h-1.5">
                <div
                  className={`${p.color} h-1.5 rounded-full transition-all duration-700`}
                  style={{ width: `${(p.count / 7) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
