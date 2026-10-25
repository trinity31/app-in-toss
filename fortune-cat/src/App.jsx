import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { Component, lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import TabBar from './components/TabBar'
import TossAccountGate from './components/TossAccountGate'
import { PURCHASE_UNAVAILABLE_MESSAGE } from './lib/purchaseAvailability'
import './App.css'

const NewYearPage = lazy(() => import('./pages/NewYearPage'))
const TarotPage = lazy(() => import('./pages/TarotPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))

// A rejected lazy import stays cached until a full page reload.
class RouteErrorBoundary extends Component {
  state = { failed: false, locationKey: null }

  static getDerivedStateFromProps({ locationKey }, state) {
    if (locationKey !== state.locationKey) {
      return { failed: false, locationKey }
    }
    return null
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <section role="status" style={{ padding: 24 }}>
          <h2>화면을 불러오지 못했어요.</h2>
          <p>홈으로 이동하거나, 연결을 확인한 뒤 다시 불러와 주세요.</p>
          <Link to="/">홈으로 이동</Link>
          <button type="button" onClick={() => window.location.reload()}>
            다시 불러오기
          </button>
        </section>
      )
    }
    return this.props.children
  }
}

function App() {
  const location = useLocation()
  return (
    <>
      <RouteErrorBoundary locationKey={location.key}>
        <Suspense fallback={<div role="status" style={{ padding: 24 }}>화면을 불러오고 있어요.</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/saju" element={<section role="status" style={{ padding: 24 }}>이전 사주 서비스는 안전 점검 중이에요. 신년운세 메뉴에서 이용 가능한 풀이를 확인해 주세요.</section>} />
            <Route path="/newyear" element={<TossAccountGate><NewYearPage /></TossAccountGate>} />
            <Route path="/amulet" element={<section role="status" style={{ padding: 24 }}>{PURCHASE_UNAVAILABLE_MESSAGE}</section>} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/library" element={<TossAccountGate hasBottomNavigation><LibraryPage /></TossAccountGate>} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
      <TabBar />
    </>
  )
}

export default App
