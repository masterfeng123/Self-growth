import { useState } from 'react'
import Layout from './components/Layout'
import TodayPage from './pages/TodayPage'
import DashboardPage from './pages/DashboardPage'
import GrowthMapPage from './pages/GrowthMapPage'
import NetworkPage from './pages/NetworkPage'
import WeeklyReviewPage from './pages/WeeklyReviewPage'
import StabilizerPage from './pages/StabilizerPage'

export default function App() {
  const [page, setPage] = useState('today')

  if (page === 'stabilizer') {
    return <StabilizerPage onExit={() => setPage('today')} />
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'today' && <TodayPage onStabilizer={() => setPage('stabilizer')} />}
      {page === 'dashboard' && <DashboardPage />}
      {page === 'growth' && <GrowthMapPage />}
      {page === 'network' && <NetworkPage />}
      {page === 'review' && <WeeklyReviewPage />}
    </Layout>
  )
}
