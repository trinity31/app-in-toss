import { useState } from 'react'
import { saveBase64Data, Analytics } from '@apps-in-toss/web-framework'

const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || 'ait-ad-test-rewarded-id'

export default function Result({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, fortuneResult } = userData
  const [isLoadingAd, setIsLoadingAd] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  // 이미지 저장/공유
  const handleSaveImage = async () => {
    try {
      setIsSavingImage(true)

      if (!fortuneResult?.image_base64) {
        alert('저장할 이미지가 없습니다.')
        return
      }

      const base64Data = fortuneResult.image_base64
      const mimeType = 'image/png'
      const fileName = `saju-${Date.now()}.png`
      // 저장/공유
      await saveBase64Data({
        data: base64Data,
        fileName: fileName,
        mimeType: mimeType
      })

    } catch (err) {
      // 사용자 취소는 조용히 처리
      if (err.message && !err.message.toLowerCase().includes('cancel')) {
        alert(`이미지 저장 중 오류가 발생했습니다: ${err.message}`)
      }
    } finally {
      setIsSavingImage(false)
    }
  }

  // 광고 재생 후 타입 선택으로 이동
  const handleBackToTypeSelectWithAd = async () => {
    try {
      Analytics.click({ button_name: 'back_to_type_select' })
      setIsLoadingAd(true)
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework')

      const isAdUnsupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.() === false

      if (isAdUnsupported) {
        console.warn('광고 재생이 지원되지 않습니다.')
        onBackToTypeSelect()
        return
      }

      // 광고 로드
      const loadCleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            console.log('광고 로드 완료')
            // 광고 재생
            GoogleAdMob.showAppsInTossAdMob({
              options: {
                adGroupId: AD_GROUP_ID,
              },
              onEvent: (showEvent) => {
                if (showEvent.type === 'dismissed' || showEvent.type === 'userEarnedReward') {
                  console.log('광고 시청 완료')
                  setIsLoadingAd(false)
                  onBackToTypeSelect()
                }
              },
              onError: (error) => {
                console.error('광고 재생 실패', error)
                setIsLoadingAd(false)
                onBackToTypeSelect()
              },
            })
          }
        },
        onError: (error) => {
          console.error('광고 로드 실패', error)
          setIsLoadingAd(false)
          onBackToTypeSelect()
        },
      })

      // cleanup 함수는 나중에 필요할 때 사용
      return () => loadCleanup?.()
    } catch (error) {
      console.error('광고 모듈 로드 실패:', error)
      setIsLoadingAd(false)
      onBackToTypeSelect()
    }
  }

  // image_description 처리
  let descriptionItems = []
  let isJsonArray = false
  if (fortuneResult?.image_description) {
    let description = fortuneResult.image_description

    // 마크다운 코드 블록 형식 제거 (```json ... ``` 또는 '''json ... ''')
    description = description.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
    description = description.replace(/^'''json\s*/i, '').replace(/\s*'''$/, '')
    description = description.trim()

    try {
      // JSON 형식인 경우 파싱 시도
      const parsed = JSON.parse(description)
      descriptionItems = parsed.items || []
      isJsonArray = true
    } catch (e) {
      // JSON이 아닌 단순 문자열인 경우 그대로 사용
      // OOO님을 실제 이름으로 치환
      if (name) {
        description = description.replace(/OOO님/g, `${name}님`)
      }
      descriptionItems = [description]
      isJsonArray = false
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: '100px' }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#191F28',
          marginBottom: '8px'
        }}>
          {name}님의 사주풀이
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8B95A1',
          marginBottom: '24px'
        }}>
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일
        </p>

        {fortuneResult?.image_base64 && (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={`data:image/png;base64,${fortuneResult.image_base64}`}
              alt="사주 이미지"
              style={{
                width: '100%',
                borderRadius: '12px',
                objectFit: 'cover'
              }}
            />

            {/* 공유하기 버튼 */}
            <button
              onClick={handleSaveImage}
              disabled={isSavingImage}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '16px',
                backgroundColor: isSavingImage ? '#E5E8EB' : 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isSavingImage ? 'not-allowed' : 'pointer',
                opacity: isSavingImage ? 0.6 : 1
              }}
            >
              {isSavingImage ? '저장 중...' : '공유하기'}
            </button>

            {descriptionItems.length > 0 && (
              <div style={{
                marginTop: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {descriptionItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: isJsonArray ? '8px 14px' : '14px 18px',
                      fontSize: '14px',
                      fontWeight: '600',
                      lineHeight: '1.5',
                      color: '#4E5968',
                      background: '#F2F4F6',
                      borderRadius: '12px',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {fortuneResult?.reading && (
          <div style={{
            background: 'var(--color-primary-light)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              marginBottom: '12px'
            }}>
              사주 풀이
            </h2>
            <p style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#4E5968',
              whiteSpace: 'pre-wrap'
            }}>
              {fortuneResult.reading}
            </p>
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
          onClick={handleBackToTypeSelectWithAd}
          disabled={isLoadingAd}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: isLoadingAd ? '#E5E8EB' : '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoadingAd ? 'not-allowed' : 'pointer',
            opacity: isLoadingAd ? 0.6 : 1
          }}
        >
          {isLoadingAd ? '광고 로딩 중...' : '타입 선택으로'}
        </button>
        <button
          onClick={onRestart}
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
          처음부터 다시하기
        </button>
      </div>
    </div>
  )
}
