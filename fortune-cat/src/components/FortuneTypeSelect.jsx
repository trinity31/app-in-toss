import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader } from '@toss/tds-mobile'

export default function FortuneTypeSelect({ onNext, onBack }) {
  const [selectedType, setSelectedType] = useState(null)
  const [fortuneTypes, setFortuneTypes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchFortuneTypes() {
      try {
        setIsLoading(true)
        console.log('[FortuneTypeSelect] Supabase 조회 시작')

        const { data, error } = await supabase
          .from('saju_reading_types')
          .select('*')
          .order('id', { ascending: true })

        console.log('[FortuneTypeSelect] Supabase 응답:', { data, error })

        if (error) {
          throw error
        }

        console.log('[FortuneTypeSelect] 받아온 데이터:', data)
        setFortuneTypes(data || [])
      } catch (err) {
        console.error('[FortuneTypeSelect] 조회 실패:', err)
        setError('운세 타입을 불러오는데 실패했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchFortuneTypes()
  }, [])

  const handleTypeSelect = (type) => {
    setSelectedType(type.id)
    setTimeout(() => {
      onNext({
        fortuneType: type.id,
        themeType: type.theme_type,
        readingType: type.reading_type
      })
    }, 500)
  }

  return (
    <>
      <div style={{ padding: '20px 20px 100px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          원하는 결과를 선택해 주세요
        </h1>

        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            gap: '16px'
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: '#6B7684', margin: 0 }}>운세 타입을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '16px', color: '#F04452', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#fff',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {fortuneTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type)}
                disabled={selectedType !== null}
                style={{
                  width: '100%',
                  padding: '20px 0',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderBottom: '1px solid #F2F4F6',
                  background: selectedType === type.id ? 'var(--color-primary-light)' : 'none',
                  cursor: selectedType !== null ? 'not-allowed' : 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: selectedType === type.id ? 'var(--color-primary)' : '#191F28',
                    marginBottom: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {type.title_ko}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: selectedType === type.id ? 'var(--color-primary)' : '#8B95A1',
                    transition: 'color 0.2s ease'
                  }}>
                    {type.description_ko}
                  </div>
                </div>
                <img
                  src={type.image_url}
                  alt={type.title_ko}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: '#fff' }}>
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
