import { useState } from 'react'
import { recoverLegacyTossAccount } from '../lib/tossSession'
import styles from './LegacyAccountRecovery.module.css'

export default function LegacyAccountRecovery() {
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const recover = async () => {
    if (busy) return
    setBusy(true); setMessage(null)
    try { await recoverLegacyTossAccount(); setConfirm(false); setMessage('기존 계정의 기록을 연결했어요.') }
    catch { setMessage('기록을 연결하지 못했어요. 잠시 후 다시 시도해 주세요.') }
    finally { setBusy(false) }
  }
  return <aside className={styles.recovery} aria-label="기존 계정 연결">
    {!confirm && <button type="button" className={styles.link} onClick={() => setConfirm(true)}>이전 토스 로그인 계정의 기록 연결</button>}
    {confirm && <>
      <p>예전에 토스 로그인으로 저장한 풀이가 보이지 않나요? 기록을 연결할 때만 토스 로그인을 진행해요.</p>
      <button type="button" className={styles.link} disabled={busy} onClick={recover}>{busy ? '기록을 연결하고 있어요…' : '토스 로그인으로 기록 연결'}</button>
      <button type="button" className={styles.link} disabled={busy} onClick={() => setConfirm(false)}>취소</button>
    </>}
    {message && <p role="status">{message}</p>}
  </aside>
}
