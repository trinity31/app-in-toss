import { Route, Routes } from 'react-router-dom'
import PetPage from './pages/PetPage'
import './App.css'

export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<PetPage />} />
        <Route path="*" element={<PetPage />} />
      </Routes>
    </div>
  )
}
