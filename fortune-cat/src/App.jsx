import { Navigate, Route, Routes } from 'react-router-dom'
import SajuPage from './pages/SajuPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/saju" element={<SajuPage />} />
      <Route path="*" element={<Navigate to="/saju" replace />} />
    </Routes>
  )
}

export default App
