import { Navigate, Route, Routes } from 'react-router-dom'
import ProfilePage from './pages/ProfilePage'
import './App.css'

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}
