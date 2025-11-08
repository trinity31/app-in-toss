import { useState } from 'react'
import IntroPage from './intro_page'
import LoadingPage from './loading_page'
import ResultPage from './result_page'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('intro')

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return <IntroPage onNext={() => setCurrentPage('loading')} />
      case 'loading':
        return <LoadingPage />
      case 'result':
        return <ResultPage />
      default:
        return <IntroPage onNext={() => setCurrentPage('loading')} />
    }
  }

  return (
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App

