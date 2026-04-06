import { useState } from 'react';
import { appLogin } from '@apps-in-toss/web-framework';
import { theme, primaryButton, secondaryButton } from '../styles/theme';
import { API_ENDPOINTS } from '../config/api';

export default function TossLogin({ onNext, onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[TossLogin] appLogin() 호출...');
      const loginResult = await appLogin();
      console.log('[TossLogin] appLogin() 결과:', JSON.stringify(loginResult));

      const { authorizationCode, referrer } = loginResult;
      console.log('[TossLogin] 백엔드 toss-login 호출:', API_ENDPOINTS.TOSS_LOGIN);

      const res = await fetch(API_ENDPOINTS.TOSS_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorizationCode, referrer }),
      });

      console.log('[TossLogin] 백엔드 응답 상태:', res.status);
      const data = await res.json();
      console.log('[TossLogin] 백엔드 응답 데이터:', JSON.stringify(data));

      if (!res.ok) {
        throw new Error(data.error || '로그인 처리 중 오류가 발생했습니다');
      }

      console.log('[TossLogin] 로그인 성공 - userKey:', data.userKey);
      onNext({ userKey: data.userKey, name: data.name });
    } catch (err) {
      console.error('토스 로그인 실패:', err);
      setError(err.message || '로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.iconWrap}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill={theme.color.primary}/>
          </svg>
        </div>
        <h2 style={styles.title}>토스 로그인</h2>
        <p style={styles.description}>
          결제 및 이미지 저장을 위해<br />토스 로그인이 필요해요.
        </p>

        {error && (
          <p style={styles.error}>{error}</p>
        )}
      </div>

      <div style={styles.ctaArea}>
        <button
          style={{ ...styles.loginButton, opacity: isLoading ? 0.5 : 1 }}
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '토스로 로그인'}
        </button>
        <button style={styles.backButton} onClick={onBack}>
          돌아가기
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100dvh', width: '100%',
    backgroundColor: theme.color.bg, boxSizing: 'border-box',
  },
  content: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px 140px', textAlign: 'center',
  },
  iconWrap: {
    width: '72px', height: '72px', borderRadius: '50%',
    backgroundColor: theme.color.primaryLight,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: theme.font.size.title, fontWeight: theme.font.weight.bold,
    color: theme.color.textPrimary, margin: '0 0 12px 0',
  },
  description: {
    fontSize: theme.font.size.body, color: theme.color.textSecondary,
    lineHeight: theme.font.lineHeight.normal, margin: 0,
  },
  error: {
    fontSize: theme.font.size.caption, color: theme.color.error,
    marginTop: '16px',
  },
  ctaArea: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    padding: '12px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    backgroundColor: 'rgba(255, 251, 248, 0.9)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
  },
  loginButton: {
    ...primaryButton, width: '100%', maxWidth: '400px', padding: '16px',
    fontSize: theme.font.size.body, borderRadius: theme.radius.md,
  },
  backButton: {
    ...secondaryButton, width: '100%', maxWidth: '400px', padding: '12px',
    backgroundColor: 'transparent', color: theme.color.textTertiary,
    fontSize: theme.font.size.caption,
  },
};
