import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { Flame, TrendingUp, Users, Award } from 'lucide-react'
import { useStore } from '../store/useStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1c1c1f', border: '1px solid #2e3033',
      borderRadius: '8px', padding: '10px 12px', fontSize: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <p style={{ color: '#909098', fontWeight: 500, marginBottom: '4px' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{
        width: 38, height: 38, borderRadius: '8px',
        background: '#111113', border: '1px solid #242729',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '11px', color: '#5e5e68', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '20px', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </p>
        {sub && <p style={{ fontSize: '11px', color: '#5e5e68', marginTop: '2px' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { getLast7Days, getStreak, getTotalDaysLogged, contacts } = useStore()
  const data7 = getLast7Days()
  const streak = getStreak()
  const totalDays = getTotalDaysLogged()

  const activeData = data7.filter((d) => d.score > 0)
  const avgScore = activeData.length > 0
    ? Math.round(activeData.reduce((a, b) => a + b.score, 0) / activeData.length)
    : 0

  const pillarTotals = {
    learning:   data7.filter((d) => d.learning).length,
    networking: data7.filter((d) => d.networking).length,
    deepWork:   data7.filter((d) => d.deepWork).length,
    knowledge:  data7.filter((d) => d.knowledge).length,
  }

  const radarData = [
    { subject: '學習',    A: Math.round((pillarTotals.learning / 7) * 100) },
    { subject: '人脈',    A: Math.round((pillarTotals.networking / 7) * 100) },
    { subject: '深度工作', A: Math.round((pillarTotals.deepWork / 7) * 100) },
    { subject: '知識輸入', A: Math.round((pillarTotals.knowledge / 7) * 100) },
  ]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px 40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#f0f0f4', letterSpacing: '-0.02em' }}>
          儀表板
        </h1>
        <p style={{ fontSize: '12px', color: '#5e5e68', marginTop: '2px' }}>你的成長數據全景</p>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <StatCard icon={Flame}     label="當前連線天數" value={`${streak}天`}    sub="每天進步一點" color="#fb923c" />
        <StatCard icon={Award}     label="累積完成天數" value={`${totalDays}天`}  sub="你已走了這遠" color="#f59e0b" />
        <StatCard icon={TrendingUp} label="本週平均分數" value={`${avgScore}分`}  sub="滿分100" color="#60a5fa" />
        <StatCard icon={Users}     label="人脈總計"    value={`${contacts.length}人`} sub="關係資本" color="#a78bfa" />
      </div>

      {/* 7-day bar chart */}
      <div className="card">
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#909098', marginBottom: '16px' }}>
          近7日每日得分
        </p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data7} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e21" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#5e5e68', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#5e5e68', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="score" fill="#f59e0b" radius={[4, 4, 0, 0]} name="分數" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Energy trend */}
      <div className="card">
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#909098', marginBottom: '16px' }}>
          近7日能量趨勢
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data7}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e21" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#5e5e68', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={{ fill: '#5e5e68', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
            <Line
              type="monotone" dataKey="energy" stroke="#60a5fa" strokeWidth={2}
              dot={{ fill: '#60a5fa', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 4, fill: '#93c5fd' }}
              name="能量"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Radar */}
      <div className="card">
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#909098', marginBottom: '8px' }}>
          本週四大支柱完成率
        </p>
        <ResponsiveContainer width="100%" height={190}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1e1e21" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#909098', fontSize: 12 }} />
            <Radar dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={1.5} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pillar breakdown */}
      <div className="card">
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#909098', marginBottom: '14px' }}>
          本週支柱達成次數（7天中）
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: '📚 學習成長',  count: pillarTotals.learning,   color: '#60a5fa' },
            { label: '🤝 人脈經營',  count: pillarTotals.networking,  color: '#a78bfa' },
            { label: '🎯 深度工作',  count: pillarTotals.deepWork,    color: '#f59e0b' },
            { label: '💡 知識輸入',  count: pillarTotals.knowledge,   color: '#34d399' },
          ].map((p) => (
            <div key={p.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12px', color: '#909098' }}>{p.label}</span>
                <span style={{ fontSize: '11px', color: '#5e5e68' }}>{p.count}/7</span>
              </div>
              <div style={{ background: '#111113', borderRadius: '99px', height: '3px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(p.count / 7) * 100}%`,
                  height: '100%',
                  background: p.color,
                  borderRadius: '99px',
                  transition: 'width 800ms cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
