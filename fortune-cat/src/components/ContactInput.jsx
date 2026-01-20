import { useState, useRef, useEffect } from 'react'

export default function ContactInput({ onNext, onBack, userData }) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const emailRef = useRef(null)

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isValidPhone = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(phone.replace(/-/g, ''))
  const isValid = isValidEmail && isValidPhone

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

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

  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^0-9]/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const handleSubmit = () => {
    if (isValid) {
      onNext({ email, phone })
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 8px 0' }}>
          부적 이미지를 받을<br />연락처를 입력해 주세요
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7684', lineHeight: '1.6', margin: '0 0 32px 0' }}>
          24시간 내 이메일과 문자로 발송됩니다
        </p>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4E5968', marginBottom: '8px' }}>
            이메일
          </label>
          <input
            ref={emailRef}
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E8EB'
            }}
          />
          {email && !isValidEmail && (
            <p style={{ fontSize: '12px', color: '#F04452', marginTop: '4px' }}>
              올바른 이메일 형식을 입력해 주세요
            </p>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4E5968', marginBottom: '8px' }}>
            휴대폰 번호
          </label>
          <input
            type="tel"
            placeholder="010-1234-5678"
            value={phone}
            onChange={handlePhoneChange}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#E5E8EB'
            }}
          />
          {phone && !isValidPhone && (
            <p style={{ fontSize: '12px', color: '#F04452', marginTop: '4px' }}>
              올바른 휴대폰 번호를 입력해 주세요
            </p>
          )}
        </div>

        <div style={{
          background: '#F7F8FA',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <p style={{ fontSize: '13px', color: '#6B7684', margin: 0, lineHeight: '1.6' }}>
            입력하신 연락처로 부적 이미지가 발송됩니다.<br />
            정확한 정보를 입력해 주세요.
          </p>
        </div>
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
          다음
        </button>
      </div>
    </>
  )
}
