import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import NewYearPage from './pages/NewYearPage'
import NewYearHistoryPage from './pages/NewYearHistoryPage'
import './App.css'

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/newyear" element={<NewYearPage />} />
        <Route path="/newyear/history" element={<NewYearHistoryPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
