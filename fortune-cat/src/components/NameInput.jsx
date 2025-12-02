import { useState, useEffect } from 'react'

export default function NameInput({ onNext, initialValue = '' }) {
  const [name, setName] = useState(initialValue)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    setName(initialValue)
  }, [initialValue])

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const offset = windowHeight - viewportHeight
        setKeyboardHeight(offset)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  const handleSubmit = () => {
    if (name.trim()) {
      onNext({ name: name.trim() })
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 32px 0' }}>
          이름을 입력해주세요
        </h1>
      </div>

      <div style={{ padding: '0 20px' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 또는 닉네임"
          style={{
            width: '100%',
            padding: '20px 0',
            fontSize: '24px',
            border: 'none',
            borderBottom: '2px solid #E5E8EB',
            outline: 'none',
            color: '#191F28'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
        />
      </div>

      <div style={{
        position: 'fixed',
        bottom: `${keyboardHeight}px`,
        left: 0,
        right: 0,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
        background: '#fff',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'bottom 0.2s ease-out'
      }}>
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: name.trim() ? 'var(--color-primary)' : 'var(--color-disabled)',
            border: 'none',
            borderRadius: '8px',
            cursor: name.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          확인
        </button>
      </div>
    </>
  )
}
