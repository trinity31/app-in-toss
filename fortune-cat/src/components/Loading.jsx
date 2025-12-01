import { useState, useEffect, useRef } from 'react'

const TEST_AD_GROUP_ID = 'ait-ad-test-rewarded-id'

export default function Loading({ userData, onNext }) {
  const [loadingMessage, setLoadingMessage] = useState('광고를 준비하고 있습니다...')
  const [adLoaded, setAdLoaded] = useState(false)
  const [adRewarded, setAdRewarded] = useState(false)
  const [apiCompleted, setApiCompleted] = useState(false)
  const cleanupRef = useRef(null)

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
          simulateApiCall()
          return
        }

        cleanupRef.current?.()
        cleanupRef.current = null

        const cleanup = GoogleAdMob.loadAppsInTossAdMob({
          options: {
            adGroupId: TEST_AD_GROUP_ID,
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
            simulateApiCall()
          },
        })

        cleanupRef.current = cleanup
      } catch (error) {
        console.error('광고 모듈 로드 실패:', error)
        // 광고 모듈 로드 실패해도 진행
        setAdLoaded(true)
        setAdRewarded(true)
        setLoadingMessage('사주를 풀이하고 있습니다...')
        simulateApiCall()
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
        simulateApiCall()
        return
      }

      GoogleAdMob.showAppsInTossAdMob({
        options: {
          adGroupId: TEST_AD_GROUP_ID,
        },
        onEvent: (event) => {
          switch (event.type) {
            case 'show':
              console.log('광고 재생 시작')
              // 광고 재생과 동시에 API 호출 시작
              simulateApiCall()
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
      simulateApiCall()
    }
  }

  // API 호출 시뮬레이션 (실제로는 여기서 사주풀이 API를 호출)
  const simulateApiCall = () => {
    setTimeout(() => {
      console.log('API 호출 완료')
      setApiCompleted(true)
    }, 3000) // 3초 대기
  }

  // API 완료되고 광고도 끝나면 결과 페이지로 이동
  useEffect(() => {
    if (apiCompleted && adRewarded) {
      setLoadingMessage('완료되었습니다!')
      setTimeout(() => {
        onNext({ fortuneResult: '임시 결과 데이터' })
      }, 500)
    }
  }, [apiCompleted, adRewarded, onNext])

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
        textAlign: 'center'
      }}>
        {loadingMessage}
      </h2>

      <p style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: '1.6'
      }}>
        {!adRewarded && '광고를 시청하면 더 빠르게 결과를 확인할 수 있습니다'}
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
