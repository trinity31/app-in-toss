import { useEffect, useState } from 'react'
import { getTossSession, loginTossAccount, subscribeTossAccount } from '../lib/tossSession'
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets'
import styles from './TossAccountGate.module.css'

export default function TossAccountGate({ children, hasBottomNavigation = false }) {
  const insets = useSafeAreaInsets()
  const [session, setSession] = useState(getTossSession)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  useEffect(() => subscribeTossAccount(() => setSession(getTossSession())), [])
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [session])
  if (session) return children
  const login = async () => {
    if (busy) return
    setBusy(true); setError(null)
    try { setSession(await loginTossAccount()) }
    catch { setError('로그인을 완료하지 못했어요. 원하실 때 다시 시도해 주세요.') }
    finally { setBusy(false) }
  }
  return (
    <section
      className={`${styles.gate} ${hasBottomNavigation ? styles.withNavigation : ''}`}
      aria-labelledby="toss-account-title"
      style={{ '--account-safe-bottom': `${insets.bottom}px` }}
    >
      <div className={styles.content}>
        <h1 id="toss-account-title" className={styles.title}>
          로그인하고 안전하게<br />이용해 주세요
        </h1>
        <p className={styles.description}>
          무료 이용 횟수와 풀이 보관함을<br />토스 계정으로 관리해요.
        </p>
        <aside className={styles.notice} aria-label="이전 풀이 안내">
          <p className={styles.noticeTitle}>이전 풀이를 확인해 주세요</p>
          <p>로그인 전에 익명으로 저장한 풀이는 자동으로 연결되지 않아요.</p>
        </aside>
      </div>
      <div className={styles.action}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.status} role="status">{busy ? '토스 계정을 확인하고 있어요.' : ''}</p>
        <button
          className={styles.loginButton}
          type="button"
          onClick={login}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? '로그인 중...' : '토스로 로그인하기'}
        </button>
      </div>
    </section>
  )
}
