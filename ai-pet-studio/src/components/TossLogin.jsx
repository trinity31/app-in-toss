import { useState } from 'react'
import { colors } from '@toss/tds-colors'
import { API_ENDPOINTS } from '../config/const'

export default function TossLogin({ onNext, onBack }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { appLogin } = await import('@apps-in-toss/web-framework')
      let loginResult
      try {
        loginResult = await appLogin()
      } catch (sdkError) {
        console.error('[TossLogin] SDK 오류:', sdkError)
        throw new Error(sdkError.message || '토스 로그인 SDK 오류가 발생했습니다')
      }
      const { authorizationCode, referrer } = loginResult

      const response = await fetch(API_ENDPOINTS.TOSS_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode, referrer }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || '로그인 처리 중 오류가 발생했습니다')
      }

      onNext({
        tossUserInfo: {
          userKey: data.userKey,
          name: data.name,
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
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#F8F9FA',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px 140px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: '#EBF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '32px',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#1E6BFA"/>
          </svg>
        </div>

        <h1 style={{
          fontSize: '22px',
          lineHeight: '1.4',
          fontWeight: 'bold',
          color: colors.grey900,
          margin: '0 0 12px 0',
        }}>
          토스 로그인이 필요해요
        </h1>

        <p style={{
          fontSize: '15px',
          color: colors.grey500,
          lineHeight: '1.6',
          margin: '0 0 32px 0',
        }}>
          토스 계정으로 간편하게 인증하고<br />
          나만의 연하장을 만들어 보세요
        </p>

        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '16px'
          }}>
            <p style={{ fontSize: '14px', color: colors.grey600, margin: 0 }}>로그인 중...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '16px',
            width: '100%',
            maxWidth: '400px',
            boxSizing: 'border-box',
          }}>
            <p style={{ fontSize: '14px', color: colors.red500, margin: 0 }}>{error}</p>
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
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: colors.grey900,
            background: colors.grey100,
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
            background: isLoading ? colors.grey400 : '#1E6BFA',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          토스로 로그인
        </button>
      </div>
    </div>
  )
}
