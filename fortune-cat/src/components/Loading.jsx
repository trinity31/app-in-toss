import { useState, useEffect, useRef } from 'react'
import { formatBirthdate, formatBirthTime, formatGender, base64ToBlob } from '../utils/dataTransform'

const AD_GROUP_ID = import.meta.env.VITE_AD_GROUP_ID || 'ait-ad-test-rewarded-id'

export default function Loading({ userData, onNext }) {
  const [loadingMessage, setLoadingMessage] = useState('광고를 준비하고 있습니다...')
  const [adLoaded, setAdLoaded] = useState(false)
  const [adRewarded, setAdRewarded] = useState(false)
  const [apiCompleted, setApiCompleted] = useState(false)
  const [apiError, setApiError] = useState(null)
  const cleanupRef = useRef(null)
  const abortControllerRef = useRef(null)
  const apiCalledRef = useRef(false)

  // 광고 로드
  useEffect(() => {
    const loadAd = async () => {
      try {
        const { GoogleAdMob } = await import('@apps-in-toss/web-framework')

        const isAdUnsupported = GoogleAdMob.loadAppsInTossAdMob.isSupported?.() === false

        if (isAdUnsupported) {
          console.warn('광고가 지원되지 않습니다.')
          // 광고가 지원되지 않는 환경이면 바로 API 대기로 진행
          setAdLoaded(true)
          setAdRewarded(true)
          setLoadingMessage('사주를 풀이하고 있습니다...')
          callSajuApi()
          return
        }

        cleanupRef.current?.()
        cleanupRef.current = null

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: AD_GROUP_ID,
          },
          onEvent: (event) => {
            if (event.type === 'loaded') {
              console.log('광고 로드 완료')
              setAdLoaded(true)
              setLoadingMessage('광고를 재생합니다')
            }
          },
          onError: (error) => {
            console.error('광고 로드 실패', error)
            // 광고 로드 실패해도 진행
            setAdLoaded(true)
            setAdRewarded(true)
            setLoadingMessage('사주를 풀이하고 있습니다...')
            callSajuApi()
          },
        })

        cleanupRef.current = cleanup
      } catch (error) {
        console.error('광고 모듈 로드 실패:', error)
        // 광고 모듈 로드 실패해도 진행
        setAdLoaded(true)
        setAdRewarded(true)
        setLoadingMessage('사주를 풀이하고 있습니다...')
        callSajuApi()
      }
    }

    loadAd()

    return () => {
      cleanupRef.current?.()
    }
  }, [])

  // 광고가 로드되면 자동 재생
  useEffect(() => {
    if (adLoaded && !adRewarded) {
      showAd()
    }
  }, [adLoaded, adRewarded])

  const showAd = async () => {
    try {
      const { GoogleAdMob } = await import('@apps-in-toss/web-framework')

      const isAdUnsupported = GoogleAdMob.showAppsInTossAdMob.isSupported?.() === false

      if (isAdUnsupported) {
        console.warn('광고 재생이 지원되지 않습니다.')
        setAdRewarded(true)
        setLoadingMessage('사주를 풀이하고 있습니다...')
        callSajuApi()
        return
      }

      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: AD_GROUP_ID,
        },
        onEvent: (event) => {
          switch (event.type) {
            case 'show':
              console.log('광고 재생 시작')
              // 광고 재생과 동시에 API 호출 시작
              callSajuApi()
              break

            case 'userEarnedReward':
              console.log('광고 시청 보상 획득')
              setAdRewarded(true)
              setLoadingMessage('사주를 풀이하고 있습니다...')
              break

            case 'dismissed':
              console.log('광고 종료')
              if (!adRewarded) {
                setAdRewarded(true)
                setLoadingMessage('사주를 풀이하고 있습니다...')
              }
              break

            case 'failedToShow':
              console.log('광고 재생 실패')
              setAdRewarded(true)
              setLoadingMessage('사주를 풀이하고 있습니다...')
              break
          }
        },
        onError: (error) => {
          console.error('광고 재생 실패', error)
          setAdRewarded(true)
          setLoadingMessage('사주를 풀이하고 있습니다...')
        },
      })
    } catch (error) {
      console.error('광고 재생 중 오류:', error)
      setAdRewarded(true)
      setLoadingMessage('사주를 풀이하고 있습니다...')
      callSajuApi()
    }
  }

  // 실제 API 호출
  const callSajuApi = async () => {
    // 이미 호출되었으면 중복 호출 방지
    if (apiCalledRef.current) {
      console.log('API 이미 호출됨, 중복 호출 방지')
      return
    }
    apiCalledRef.current = true

    try {
      setLoadingMessage('사주풀이와 이미지를 생성하고 있어요.\n최대 1분 정도 걸려요...')

      // AbortController 생성 (타임아웃용)
      abortControllerRef.current = new AbortController()
      const timeoutId = setTimeout(() => abortControllerRef.current?.abort(), 180000) // 3분 타임아웃

      // FormData 생성
      const formData = new FormData()

      // 1. name
      formData.append('name', userData.name || '사용자')

      // 2. datetime (생년월일)
      const datetime = formatBirthdate(userData.birthdate)
      formData.append('datetime', datetime)

      // 3. birth_time (태어난 시간 - 선택적)
      if (userData.birthdate?.period && userData.birthdate?.period !== 'unknown') {
        const birthTime = formatBirthTime(
          userData.birthdate.period,
          userData.birthdate.hour12,
          userData.birthdate.minuteRange
        )
        if (birthTime) {
          formData.append('birth_time', birthTime)
        }
      }

      // 4. gender
      const gender = formatGender(userData.gender)
      formData.append('gender', gender)

      // 5. theme_type
      formData.append('theme_type', userData.themeType || 'basic')

      // 6. reading_type
      formData.append('reading_type', userData.themeType || 'basic')

      // 7. language
      formData.append('language', 'ko')

      // 8. image (선택적 - 사진이 있는 경우)
      if (userData.photo?.dataUri) {
        const imageBlob = base64ToBlob(userData.photo.dataUri)
        if (imageBlob) {
          formData.append('image', imageBlob, 'photo.jpg')
        }
      }

      // API 호출
      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY
      const endpoint = import.meta.env.VITE_SAJU_AI_ENDPOINT

      console.log('API 호출 시작:', { endpoint, userData })

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
        },
        body: formData,
        signal: abortControllerRef.current.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API 호출 실패: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log('API 호출 성공:', result)

      // API 완료 상태로 변경
      setApiCompleted(true)

      // 결과를 onNext로 전달
      onNext({ fortuneResult: result })

    } catch (error) {
      console.error('API 호출 오류:', error)

      if (error.name === 'AbortError') {
        setApiError('요청 시간이 초과되었습니다. 다시 시도해 주세요.')
      } else {
        setApiError('사주 풀이를 생성하는데 실패했습니다. 다시 시도해 주세요.')
      }
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  // 에러가 발생한 경우 에러 화면 표시
  if (apiError) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '24px'
        }}>
          😢
        </div>

        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#fff',
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          {apiError}
        </h2>

        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '24px',
            padding: '16px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            background: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          처음부터 다시하기
        </button>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
    }}>
      <div style={{
        width: '80px',
        height: '80px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          borderTop: '4px solid #fff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>

      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: '12px',
        textAlign: 'center',
        whiteSpace: 'pre-line'
      }}>
        {loadingMessage}
      </h2>

      <p style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        {!adRewarded && '광고를 시청하면서 결과를 기다려 주세요.'}
        {adRewarded && !apiCompleted && '잠시만 기다려 주세요'}
        {adRewarded && apiCompleted && '곧 결과가 표시됩니다'}
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
