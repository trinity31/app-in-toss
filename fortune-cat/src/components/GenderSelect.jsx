import { useState } from 'react'

export default function GenderSelect({ onNext, onBack }) {
  const [selectedGender, setSelectedGender] = useState(null)

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender)
    setTimeout(() => {
      onNext({ gender })
    }, 500)
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
            disabled={selectedGender !== null}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '16px',
              fontWeight: selectedGender === 'female' ? 'bold' : 'normal',
              color: selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'female' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: selectedGender !== null ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease'
            }}
          >
            여성
          </button>

          <button
            onClick={() => handleGenderSelect('male')}
            disabled={selectedGender !== null}
            style={{
              width: '100%',
              padding: '20px',
              fontSize: '16px',
              fontWeight: selectedGender === 'male' ? 'bold' : 'normal',
              color: selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'male' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: selectedGender !== null ? 'not-allowed' : 'pointer',
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
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
        background: '#fff',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={onBack}
          style={{
            width: '100%',
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
      </div>
    </>
  )
}
