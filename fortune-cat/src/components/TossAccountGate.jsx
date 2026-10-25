import { useEffect, useState } from 'react'
import { getTossSession, loginTossAccount, subscribeTossAccount } from '../lib/tossSession'
export default function TossAccountGate({ children }) {
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
  return <section style={{ padding: '32px 24px 120px' }}>
    <h2>로그인하고 안전하게 이용해 주세요</h2>
    <p>무료 이용 횟수와 풀이 보관함을 토스 계정으로 관리해요.</p>
    <p>로그인 전에 익명으로 저장한 풀이는 자동으로 연결되지 않아요.</p>
    {error && <p role="alert">{error}</p>}
    <button type="button" onClick={login} disabled={busy}>{busy ? '로그인 중...' : '토스로 로그인하기'}</button>
  </section>
}
