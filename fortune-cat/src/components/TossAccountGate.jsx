import { useEffect, useRef, useState } from 'react'
import { getTossSession, loginTossAccount, restoreTossAccount, subscribeTossAccount } from '../lib/tossSession'
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets'
import hero from '../assets/images/hero.png'
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
      style={{ '--account-safe-bottom': `${insets.bottom}px` }}
    >
      {busy && <div className={styles.loading} role="status">
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.status}>토스 계정을 확인하고 있어요.</p>
      </div>}
      {!busy && <div className={styles.content}>
        <img className={styles.illustration} src={hero} alt="" width="600" height="332" />
        <p className={styles.eyebrow}>복냥사주 · 타로</p>
        <h1 id="toss-account-title" className={styles.title}>
          복냥이와 나를<br />알아보는 시간
        </h1>
        <p className={styles.description}>
          생년월일과 태어난 시간을 바탕으로<br />AI가 나만의 사주를 풀어드려요.
        </p>
        <ul className={styles.benefits} aria-label="이렇게 이용해요">
          <li><strong>나에게 맞는 풀이</strong><span>성향부터 연애, 일과 재물까지 살펴봐요.</span></li>
          <li><strong>궁금한 건 더 물어보기</strong><span>풀이를 읽고 궁금한 점을 이어서 질문해요.</span></li>
          <li><strong>언제든 다시 보는 보관함</strong><span>내 계정에 저장된 풀이를 다시 읽어요.</span></li>
        </ul>
      </div>}
      {!busy && <div className={styles.action}>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <p className={styles.notice}>시작하면 토스 로그인으로 이어져요.<br />일부 풀이와 추가 이용은 결제가 필요해요.</p>
        <button
          className={styles.loginButton}
          type="button"
          onClick={login}
          disabled={busy}
          aria-busy={busy}
        >
          시작하기
        </button>
      </div>}
    </section>
  )
}
