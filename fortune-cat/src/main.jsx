import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@toss/tds-mobile'
import './index.css'
import App from './App.jsx'

// 앱 시작 시 초기 history state 추가
window.history.pushState({ page: 'init' }, '', '')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
