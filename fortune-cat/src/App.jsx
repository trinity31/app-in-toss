import { useState } from 'react'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <main className="container">
        <div className="hero-section">
          <div className="glass-card hero-card">
            <h1>Fortune Cat</h1>
            <p className="subtitle">Discover your daily fortune with the wisdom of the cat.</p>
            <button className="btn btn-primary">
              Reveal Fortune
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
