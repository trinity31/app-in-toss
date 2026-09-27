import { useState } from 'react'
import { createTarotLibrary } from '../lib/tarotLibrary'
import { createTossAccountHeaders } from '../lib/tossAccount'
import { tarotRuntime } from '../lib/tarotRuntime'
import { isSandbox } from '../lib/analytics'
import TarotCardArt from './TarotCardArt'
import { getCardImageUrl } from '../assets/images/cards'
import './TarotLibrary.css'

const buttonStyle = { font: 'inherit', padding: '12px 16px', borderRadius: 12, border: '1px solid #D8C8E4', background: '#FFF', color: '#64119F', cursor: 'pointer' }
// Preserve the saved words while giving existing paragraph breaks real spacing.
function Prose({ text }) {
  return <div className="tarot-saved-prose">{text.split(/\n+/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
}

function SavedReading({ session }) {
  const { reading, clarifier } = session
  return <article className="tarot-saved-reading">
    <header className="tarot-saved-intro">
      <h3>{session.question}</h3>
      <p className="tarot-saved-label">상담 요약</p>
      <Prose text={session.plan.summary} />
    </header>
    {reading.positions.map((position, index) => <section key={position.card_id}>
      <h4>{position.position} · {session.cards[index].name_ko}</h4>
      <div className="tarot-saved-art"><TarotCardArt zoomable size="lg" image={getCardImageUrl(position.card_id)} nameEn={session.cards[index].name_ko} /></div>
      <Prose text={position.interpretation} />
      {position.comparison && <dl>{[['possibility', '가능성'], ['caution', '주의점'], ['condition', '확인할 조건']].map(([key, label]) => <div key={key}><dt>{label}</dt><dd><Prose text={position.comparison[key]} /></dd></div>)}</dl>}
    </section>)}
    <section><h4>고민에 대한 복냥이의 이야기</h4><Prose text={reading.answer} />
      {session.plan.limitations && <div className="tarot-saved-limitations"><Prose text={session.plan.limitations} /></div>}
    </section>
    <section><h4>카드를 함께 보면</h4><Prose text={reading.relationships} /></section>
    <section><h4>현실에서 확인해 볼 것</h4><ul>{reading.reality_checks.map((value, i) => <li key={i}>{value}</li>)}</ul></section>
    <section><h4>지금 해볼 수 있는 일</h4><ul>{reading.actions.map((value, i) => <li key={i}>{value}</li>)}</ul></section>
    {clarifier && <section><h4>확인 카드 · {clarifier.card.name_ko}</h4>
      <p>{session.plan.positions[clarifier.target_index]}의 의미를 보충해요.</p>
      <div className="tarot-saved-art"><TarotCardArt zoomable size="lg" image={getCardImageUrl(clarifier.card.id)} nameEn={clarifier.card.name_ko} /></div>
      {clarifier.reading ? <><Prose text={clarifier.reading.meaning} /><h4>현실에서 확인할 것</h4><Prose text={clarifier.reading.reality_check} /><h4>해볼 수 있는 일</h4><Prose text={clarifier.reading.action} /></> : <p>확인 카드 풀이는 아직 완료되지 않았어요.</p>}
    </section>}
    <details><summary>나눈 고민 다시 보기</summary>{session.answers.map((answer, i) => <div className="tarot-saved-exchange" key={i}><p>{answer.question}</p><p>{answer.answer}</p></div>)}</details>
    <p className="tarot-saved-notice">{session.notice}</p>
  </article>
}

export default function TarotLibrary() {
  const [{ client, sandbox }] = useState(() => {
    const runtime = tarotRuntime({ development: import.meta.env.DEV, sandbox: isSandbox(), baseUrl: import.meta.env.VITE_API_BASE_URL })
    return { sandbox: runtime.sandbox, client: createTarotLibrary({ baseUrl: runtime.baseUrl,
      accountHeaders: createTossAccountHeaders({ baseUrl: import.meta.env.VITE_API_BASE_URL, development: import.meta.env.DEV,
        appLogin: async () => (await import('@apps-in-toss/web-framework')).appLogin(),
      }),
    }) }
  })
  const [items, setItems] = useState(null)
  const [more, setMore] = useState(false)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  async function load(id, append = false) {
    if (busy) return
    setBusy(true); setError(null)
    try {
      if (id) setSelected(await client.detail(id))
      else {
        const data = await client.list(append ? items.length : 0)
        setItems(previous => append ? [...previous, ...data.items] : data.items)
        setMore(data.has_more)
      }
    } catch (error) { setError(error.message) }
    finally { setBusy(false) }
  }
  return <section aria-label="심화 타로 보관함" className="tarot-library">
    <h2 style={{ fontSize: 18 }}>심화 타로 상담{sandbox ? ' · 샌드박스' : ''}</h2>
    {error && <p role="alert">{error}</p>}
    {busy && <p role="status">타로 풀이를 불러오는 중...</p>}
    {selected ? <>
      <button style={buttonStyle} disabled={busy} onClick={() => setSelected(null)}>타로 목록으로 돌아가기</button>
      <SavedReading session={selected} />
      <button style={buttonStyle} onClick={() => setSelected(null)}>타로 목록으로 돌아가기</button>
    </> : <>
      {!items && <p>토스 로그인으로 이전 심화 타로 풀이를 다시 볼 수 있어요.</p>}
      <button style={buttonStyle} disabled={busy} onClick={() => load()}>{items ? '목록 새로고침' : '저장된 타로 풀이 불러오기'}</button>
      {items?.length === 0 && <p>아직 완료한 심화 타로 풀이가 없어요.</p>}
      {items?.map(item => <button key={item.id} style={{ ...buttonStyle, display: 'block', width: '100%', textAlign: 'left', marginTop: 12, overflowWrap: 'anywhere' }} disabled={busy} onClick={() => load(item.id)}>
        <strong>{item.question}</strong>{item.created_at && <span style={{ display: 'block', fontSize: 12, marginTop: 6 }}>{new Date(item.created_at).toLocaleDateString('ko-KR')}</span>}
      </button>)}
      {more && <button style={{ ...buttonStyle, marginTop: 12 }} disabled={busy} onClick={() => load(null, true)}>이전 타로 더 보기</button>}
    </>}
  </section>
}
