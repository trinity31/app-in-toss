import { Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import HomePage from './pages/HomePage'
import TabBar from './components/TabBar'
import './App.css'

const SajuPage = lazy(() => import('./pages/SajuPage'))
const NewYearPage = lazy(() => import('./pages/NewYearPage'))
const AmuletPage = lazy(() => import('./pages/AmuletPage'))
const TarotPage = lazy(() => import('./pages/TarotPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))

function App() {
  return (
    <>
      <Suspense fallback={<div role="status" style={{ padding: 24 }}>화면을 불러오고 있어요.</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/saju" element={<SajuPage />} />
        <Route path="/newyear" element={<NewYearPage />} />
        <Route path="/amulet" element={<AmuletPage />} />
        <Route path="/tarot" element={<TarotPage />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      </Suspense>
      <TabBar />
    </>
  )
}

export default App
