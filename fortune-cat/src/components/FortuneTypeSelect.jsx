import { useState, useEffect } from 'react'
import { supabase, getMenuImageUrl } from '../lib/supabase'
import { Loader } from '@toss/tds-mobile'
import { Analytics } from '@apps-in-toss/web-framework'

// 사진 업로드가 필요한 타입들
const PHOTO_UPLOAD_TYPES = ['basic', 'lookbook', 'travel_lookbook']

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
    Analytics.click({ button_name: type.title_ko })

    // 사진 업로드가 필요한 타입은 바로 이동
    if (PHOTO_UPLOAD_TYPES.includes(type.code)) {
      setSelectedType(type.id)
      setTimeout(() => {
        onNext({
          fortuneType: type.code,
          themeType: type.theme_type,
          readingType: type.reading_type
        })
      }, 500)
    } else {
      // 사진 업로드가 필요 없는 타입은 선택만 (자동 이동 안함)
      setSelectedType(type.id)
    }
  }

  const handleNext = () => {
    const selectedTypeData = fortuneTypes.find(t => t.id === selectedType)
    if (selectedTypeData) {
      onNext({
        fortuneType: selectedTypeData.code,
        themeType: selectedTypeData.theme_type,
        readingType: selectedTypeData.reading_type
      })
    }
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
                style={{
                  width: '100%',
                  padding: '16px',
                  background: selectedType === type.id ? '#F7F8FA' : '#fff',
                  border: selectedType === type.id ? '2px solid var(--color-primary)' : '1px solid #E5E8EB',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '8px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: selectedType === type.id ? '#191F28' : '#191F28',
                    marginBottom: '4px',
                    transition: 'color 0.2s ease'
                  }}>
                    {type.title_ko}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: selectedType === type.id ? '#4E5968' : '#8B95A1',
                    transition: 'color 0.2s ease'
                  }}>
                    {type.description_ko}
                  </div>
                </div>
                <img
                  src={getMenuImageUrl(type.image_url)}
                  alt={type.title_ko}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: selectedType === type.id ? '2px solid var(--color-primary)' : 'none',
                    transition: 'border 0.2s ease'
                  }}
                />
              </button>
            ))}
          </div>
        )}
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
            flex: selectedType && !PHOTO_UPLOAD_TYPES.includes(fortuneTypes.find(t => t.id === selectedType)?.code) ? 1 : '100%',
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

        {/* 사진 업로드가 필요 없는 타입이 선택된 경우에만 표시 */}
        {selectedType && !PHOTO_UPLOAD_TYPES.includes(fortuneTypes.find(t => t.id === selectedType)?.code) && (
          <button
            onClick={handleNext}
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
            광고 보고 생성하기
          </button>
        )}
      </div>
    </>
  )
}
