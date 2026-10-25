import { useEffect, useRef, useState } from 'react'
import { getTossSession, loginTossAccount, restoreTossAccount, subscribeTossAccount } from '../lib/tossSession'
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets'
import styles from './TossAccountGate.module.css'

export default function TossAccountGate({ children, hasBottomNavigation = false }) {
  const insets = useSafeAreaInsets()
  const mounted = useRef(false)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const [session, setSession] = useState(getTossSession)
  const [busy, setBusy] = useState(() => !getTossSession())
  const [error, setError] = useState(null)
  useEffect(() => {
    const update = () => setSession(getTossSession())
    const unsubscribe = subscribeTossAccount(update)
    update()
    return unsubscribe
  }, [])
  useEffect(() => {
    if (session && session.expiresAt > Date.now()) return
    let active = true
    setBusy(true)
    restoreTossAccount().finally(() => {
      if (active) { setSession(getTossSession()); setBusy(false) }
    })
    return () => { active = false }
  }, [session])
  useEffect(() => {
    if (!session) return
    const timer = setTimeout(() => { setBusy(true); setSession(null) }, Math.max(0, session.expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [session])
  // A timer may be delayed while the WebView is suspended.
  if (session && session.expiresAt > Date.now()) return children
  const login = async () => {
    if (busy) return
    setBusy(true); setError(null)
    try { await loginTossAccount() }
    catch { if (mounted.current) setError('로그인을 완료하지 못했어요. 원하실 때 다시 시도해 주세요.') }
    finally { if (mounted.current) setBusy(false) }
  }
  return (
    <section
      className={`${styles.gate} ${hasBottomNavigation ? styles.withNavigation : ''}`}
      aria-labelledby={busy ? undefined : 'toss-account-title'}
      aria-label={busy ? '토스 계정 확인' : undefined}
      style={{ '--account-safe-bottom': `${insets.bottom}px` }}
    >
      {!busy && <div className={styles.content}>
        <h1 id="toss-account-title" className={styles.title}>
          로그인하고 풀이 받기
        </h1>
        <p className={styles.description}>
          무료 이용 횟수와 풀이 보관함을<br />토스 계정으로 관리해요.
        </p>
      </div>}
      <div className={styles.action}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.status} role="status">{busy ? '토스 계정을 확인하고 있어요.' : ''}</p>
        {!busy && <button
          className={styles.loginButton}
          type="button"
          onClick={login}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? '로그인 중...' : '토스로 로그인하기'}
        </button>}
      </div>
    </section>
  )
}
