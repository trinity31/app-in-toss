import { useState, useEffect } from 'react'

export default function GenderSelect({ onNext, onBack, initialGender = null }) {
  const [selectedGender, setSelectedGender] = useState(initialGender || null)

  useEffect(() => {
    setSelectedGender(initialGender || null)
  }, [initialGender])

  const handleGenderSelect = (gender) => {
    // 이미 선택된 성별을 다시 클릭한 경우 바로 이동
    if (selectedGender === gender) {
      onNext({ gender })
      return
    }
    // 새로운 성별 선택
    setSelectedGender(gender)
    setTimeout(() => {
      onNext({ gender })
    }, 500)
  }

  const handleSubmit = () => {
    if (selectedGender) {
      onNext({ gender: selectedGender })
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 24px 0' }}>
          성별을 선택해 주세요
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => handleGenderSelect('female')}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '16px',
              fontWeight: selectedGender === 'female' ? 'bold' : 'normal',
              color: selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'female' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            여성
          </button>

          <button
            onClick={() => handleGenderSelect('male')}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '16px',
              fontWeight: selectedGender === 'male' ? 'bold' : 'normal',
              color: selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'male' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            남성
          </button>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
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
        {selectedGender && (
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            다음
          </button>
        )}
      </div>
    </>
  )
}
