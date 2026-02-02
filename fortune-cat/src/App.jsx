import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SajuPage from './pages/SajuPage'
import NewYearPage from './pages/NewYearPage'
import AmuletPage from './pages/AmuletPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/saju" element={<SajuPage />} />
      <Route path="/newyear" element={<NewYearPage />} />
      <Route path="/amulet" element={<AmuletPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}

export default App