import { useState, useEffect } from 'react'

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export default function EmailInput({ onNext, onBack, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    setEmail(initialEmail)
  }, [initialEmail])

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
    if (isValidEmail(email)) {
      onNext({ email: email.trim() })
    }
  }

  const isValid = isValidEmail(email)

  return (
    <>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          부적 이미지를 받을<br />이메일을 입력해 주세요
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7684', margin: '0 0 32px 0' }}>
          24시간 이내에 입력하신 이메일로 부적 이미지를 보내드립니다
        </p>
      </div>

      <div style={{ padding: '0 20px' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          style={{
            width: '100%',
            padding: '20px 0',
            fontSize: '20px',
            border: 'none',
            borderBottom: `2px solid ${email && !isValid ? '#F04452' : '#E5E8EB'}`,
            outline: 'none',
            color: '#191F28'
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
        />
        {email && !isValid && (
          <p style={{ fontSize: '13px', color: '#F04452', margin: '8px 0 0 0' }}>
            올바른 이메일 형식을 입력해 주세요
          </p>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: `${keyboardHeight}px`,
        left: 0,
        right: 0,
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'bottom 0.2s ease-out'
      }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: isValid ? 'var(--color-primary)' : 'var(--color-disabled)',
            border: 'none',
            borderRadius: '8px',
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          신청하기
        </button>
      </div>
    </>
  )
}
