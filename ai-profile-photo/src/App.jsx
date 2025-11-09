import { Navigate, Route, Routes } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import './App.css'

const PROFILE_PATH = '/profile'

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to={PROFILE_PATH} replace />} />
        <Route path={PROFILE_PATH} element={<ProfilePage />} />
        <Route path="*" element={<Navigate to={PROFILE_PATH} replace />} />
      </Routes>
    </div>
  )
}
