import { useState, useEffect } from 'react'

export default function BirthdateInput({ name, onNext, onBack, initialBirthdate = {} }) {
  const [year, setYear] = useState(initialBirthdate?.year || '')
  const [month, setMonth] = useState(initialBirthdate?.month || '')
  const [day, setDay] = useState(initialBirthdate?.day || '')
  const [hour, setHour] = useState(initialBirthdate?.hour || '')
  const [minute, setMinute] = useState(initialBirthdate?.minute || '')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const isValid = year && month && day

  useEffect(() => {
    if (initialBirthdate) {
      setYear(initialBirthdate.year || '')
      setMonth(initialBirthdate.month || '')
      setDay(initialBirthdate.day || '')
      setHour(initialBirthdate.hour || '')
      setMinute(initialBirthdate.minute || '')
    }
  }, [initialBirthdate])

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
    if (isValid) {
      onNext({
        birthdate: {
          year,
          month,
          day,
          hour: hour || null,
          minute: minute || null
        }
      })
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 24px 0' }}>
          생년월일을 입력해 주세요
        </h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7684', marginBottom: '8px' }}>연</label>
            <input
              type="tel"
              inputMode="numeric"
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1995"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7684', marginBottom: '8px' }}>월</label>
            <input
              type="tel"
              inputMode="numeric"
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="9"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7684', marginBottom: '8px' }}>일</label>
            <input
              type="tel"
              inputMode="numeric"
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="12"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 8px 0' }}>
          태어난 시간을 입력해 주세요
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7684', margin: '0 0 24px 0' }}>모르면 비워두세요</p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7684', marginBottom: '8px' }}>시간</label>
            <input
              type="tel"
              inputMode="numeric"
              value={hour}
              onChange={(e) => setHour(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="18"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#6B7684', marginBottom: '8px' }}>분</label>
            <input
              type="tel"
              inputMode="numeric"
              value={minute}
              onChange={(e) => setMinute(e.target.value.replace(/\D/g, '').slice(0, 2))}
              placeholder="31"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: `${keyboardHeight}px`,
        left: 0,
        right: 0,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
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
