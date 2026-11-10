import { useState } from 'react'
import LegacyAccountRecovery from './LegacyAccountRecovery'
import styles from './LibraryRecoveryHelp.module.css'

export default function LibraryRecoveryHelp() {
  const [open, setOpen] = useState(false)
  return <details className={styles.help} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary className={styles.summary}>보관함 도움말</summary>
    {open && <div className={styles.content}>
      <p>이전에 토스 로그인으로 저장한 풀이가 보이지 않을 때 기존 기록을 연결할 수 있어요.</p>
      <LegacyAccountRecovery />
    </div>}
  </details>
}
