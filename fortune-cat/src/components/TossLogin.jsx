import { useState } from 'react'
import { Loader } from '@toss/tds-mobile'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export default function TossLogin({ onNext, onBack, userData }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // 토스 로그인 SDK 호출
      const { appLogin } = await import('@apps-in-toss/web-framework')
      let loginResult
      try {
        loginResult = await appLogin()
      } catch (sdkError) {
        console.error('[TossLogin] SDK 오류:', sdkError)
        throw new Error(sdkError.message || '토스 로그인 SDK 오류가 발생했습니다')
      }
      const { authorizationCode, referrer } = loginResult

      // 백엔드 API로 토큰 발급 및 사용자 정보 조회
      const response = await fetch(`${API_BASE_URL}/toss-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ authorizationCode, referrer }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || '로그인 처리 중 오류가 발생했습니다')
      }

      // 사용자 정보와 함께 다음 단계로 이동
      onNext({
        tossUserInfo: {
          userKey: data.userKey,
          name: data.name,
          phone: data.phone,
          birthday: data.birthday,
          gender: data.gender,
        },
      })
    } catch (err) {
      console.error('[TossLogin] 로그인 실패:', err)
      setError(err.message || '로그인에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 140px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 12px 0' }}>
          토스 로그인이 필요해요
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', lineHeight: '1.6', margin: '0 0 32px 0' }}>
          부적 이미지 신청을 위해<br />
          토스 계정 인증이 필요합니다
        </p>

        <div style={{
          background: '#F7F8FA',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginBottom: '4px' }}>선택한 부적 스타일</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-gray-700)', margin: 0 }}>
              {userData.amuletTypeTitle}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: 'var(--color-gray-400)', marginBottom: '4px' }}>신청자</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-gray-700)', margin: 0 }}>
              {userData.name}님
            </p>
          </div>
        </div>

        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            gap: '16px'
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', margin: 0 }}>로그인 중...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ fontSize: '14px', color: 'var(--color-error)', margin: 0 }}>{error}</p>
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
        background: 'var(--color-white)',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={onBack}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--color-gray-700)',
            background: 'var(--color-gray-100)',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          이전
        </button>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: isLoading ? 'var(--color-disabled)' : '#1E6BFA',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          토스로 로그인
        </button>
      </div>
    </>
  )
}
