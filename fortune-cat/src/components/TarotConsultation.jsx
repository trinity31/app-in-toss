import { useEffect, useRef, useState } from 'react'
import TarotCardArt from './TarotCardArt'
import { getCardImageUrl } from '../assets/images/cards'
import { useSafeAreaInsets } from '../hooks/useSafeAreaInsets'
import { useTarotConsultation } from '../hooks/useTarotConsultation'
import { continuation } from '../lib/tarotConsultation'
import tarotCatImage from '../assets/images/tarot_cat.png'
import './TarotConsultation.css'

const textStyle = { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.8 }
const headingStyle = { fontSize: 19, lineHeight: 1.5, marginBottom: 12, color: '#3F3754' }
const sectionStyle = { marginTop: 28, paddingTop: 24, borderTop: '1px solid #E6DCEC' }
const inputStyle = { width: '100%', padding: 16, font: 'inherit', fontSize: 16, lineHeight: 1.7, color: '#3F3754', background: '#FFFFFF', border: '1px solid #BBAAC9', borderRadius: 16, resize: 'vertical', minHeight: 130, boxSizing: 'border-box' }

function BusyIndicator() {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return <dialog ref={dialogRef} className="tarot-consultation-busy" aria-labelledby="tarot-busy-label" onCancel={event => event.preventDefault()}>
    <div role="status" aria-live="polite" aria-atomic="true">
      <span className="tarot-consultation-busy__spinner" aria-hidden="true" />
      <p id="tarot-busy-label">잠시만 기다려 주세요</p>
    </div>
  </dialog>
}

function Action({ children, secondary = false, disabled, style, ...props }) {
  return <button type="button" {...props} disabled={disabled} className="tap-card" style={{ width: '100%', minHeight: 52, border: secondary ? '1px solid #D8C8E4' : 0, borderRadius: 16, padding: '13px 16px', font: 'inherit', fontWeight: 700, fontSize: 16, background: secondary ? '#FFFFFF' : 'var(--color-primary)', color: secondary ? '#64119F' : '#FFFFFF', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>{children}</button>
}

function ConcernForm({ title, initialValue = '', options = [], busy, submitLabel, onSubmit, onCancel, examples = false }) {
  const [value, setValue] = useState(initialValue)
  return <form onSubmit={event => { event.preventDefault(); if (value.trim() && !busy) onSubmit(value.trim()) }}>
    <label htmlFor="tarot-concern" style={{ display: 'block', ...headingStyle, fontSize: 24, fontWeight: 700 }}>{title}</label>
    {options.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0' }}>
      {options.map(option => <button type="button" key={option} disabled={busy} aria-pressed={value === option} onClick={() => setValue(option)} style={{ border: value === option ? '1px solid #64119F' : '1px solid #D8C8E4', borderRadius: 14, padding: '11px 14px', font: 'inherit', fontSize: 15, color: '#4A0A78', background: value === option ? '#F4E6FF' : '#FFFFFF', textAlign: 'left', overflowWrap: 'anywhere' }}>{option}</button>)}
    </div>}
    <textarea id="tarot-concern" value={value} onChange={event => setValue(event.target.value)} disabled={busy} maxLength={3000} rows={4} placeholder={options.length ? '선택하거나 편하게 직접 적어 주세요' : '지금 가장 마음에 걸리는 고민 하나를 적어 주세요'} style={inputStyle} required />
    <p style={{ textAlign: 'right', fontSize: 12, color: '#71617F', margin: '4px 0 18px' }}>{value.length} / 3,000</p>
    {examples && <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 13, color: '#71617F', marginBottom: 8 }}>이런 고민도 괜찮아요</p>
      {['요즘 마음이 복잡한 이유를 이해하고 싶어요', '새로운 일을 시작하면 어떤 흐름이 될까요?'].map(example => <button type="button" key={example} disabled={busy} onClick={() => setValue(example)} style={{ display: 'block', textAlign: 'left', background: 'none', color: '#64119F', border: 0, font: 'inherit', fontSize: 14, padding: '8px 0', minHeight: 44 }}>{example}</button>)}
    </div>}
    <Action type="submit" disabled={busy || !value.trim()}>{submitLabel}</Action>
    {onCancel && <Action secondary disabled={busy} onClick={onCancel} style={{ marginTop: 10 }}>수정 취소</Action>}
  </form>
}

function Card({ card, position, interpretation, comparison }) {
  return <details style={{ padding: '18px 0', borderBottom: '1px solid #E6DCEC' }}>
    <summary style={{ cursor: 'pointer', color: '#3F3754' }}>
      <span style={{ display: 'inline-flex', gap: 14, alignItems: 'center', verticalAlign: 'middle', width: 'calc(100% - 22px)' }}>
        <TarotCardArt size="sm" image={getCardImageUrl(card.id)} nameEn={card.name_ko} />
        <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontSize: 13, color: '#71617F', lineHeight: 1.6 }}>{position}</span><strong style={{ display: 'block', margin: '5px 0', fontSize: 18 }}>{card.name_ko}</strong><span style={{ fontSize: 12, color: '#64119F' }}>풀이 펼쳐 보기</span></span>
      </span>
    </summary>
    <p style={{ ...textStyle, marginTop: 18 }}>{interpretation}</p>
    {comparison && <dl style={{ marginTop: 16 }}>
      {[['가능성', comparison.possibility], ['주의점', comparison.caution], ['확인할 조건', comparison.condition]].map(([label, value]) => <div key={label} style={{ marginTop: 12 }}><dt style={{ fontSize: 14, fontWeight: 700, color: '#64119F' }}>{label}</dt><dd style={textStyle}>{value}</dd></div>)}
    </dl>}
  </details>
}

function Items({ values }) {
  return <ul style={{ paddingLeft: 22 }}>{values.map((value, index) => <li key={index} style={{ ...textStyle, paddingLeft: 3, marginBottom: 10 }}>{value}</li>)}</ul>
}

export default function TarotConsultation({ onBack }) {
  const { session, busy, error, initialized, hasSaved, restoreFailed, invalidSaved, client } = useTarotConsultation()
  const insets = useSafeAreaInsets()
  const [editing, setEditing] = useState(false)
  const [target, setTarget] = useState('')
  const reading = session?.reading
  const clarifier = session?.clarifier
  const retryAction = continuation(session)
  const failure = error || session?.error

  useEffect(() => {
    if (!clarifier) window.scrollTo({ top: 0 })
  }, [session?.status, session?.pending_question?.question, clarifier])

  const revise = async question => {
    await client.command('revise', { question })
    const next = client.getSnapshot()
    if (!next.error && next.session?.question === question) setEditing(false)
  }

  return <>
    {(!initialized || busy) && <BusyIndicator />}
    <main aria-busy={!initialized || busy} style={{ background: 'var(--color-bg-soft)', minHeight: '100vh', padding: `${insets.top + 20}px 22px ${insets.bottom + 140}px`, color: '#3F3754', overflowWrap: 'anywhere' }}>
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
        <button type="button" onClick={onBack} style={{ minHeight: 44, padding: '8px 0', background: 'none', border: 0, font: 'inherit', color: '#64119F', fontWeight: 700 }}>‹ 타로</button>
        <span style={{ fontSize: 14, color: '#71617F' }}>복냥이와 깊이 나누는 고민</span>
      </header>

      {failure && <div role="alert" style={{ padding: 16, background: '#FFF5EF', borderRadius: 16, color: '#7C3A21', marginBottom: 24 }}>
        <p style={{ ...textStyle, marginBottom: 12 }}>{failure}</p>
        <Action secondary disabled={busy} onClick={() => client.retry()}>저장된 상담으로 다시 시도</Action>
      </div>}

      {initialized && !session && !hasSaved && !restoreFailed && <>
        <img src={tarotCatImage} alt="" width="88" height="88" style={{ display: 'block', objectFit: 'contain', marginBottom: 20 }} />
        <ConcernForm title="어떤 고민이 있나요?" busy={busy} submitLabel="고민 이야기하기" onSubmit={question => client.start(question)} examples />
        <p style={{ marginTop: 18, fontSize: 14, color: '#71617F' }}>계정당 심화 상담 1회 무료이며, 이후 새 상담은 유료예요. 상담마다 확인 카드 1회도 포함돼요. 필요한 내용만 두 번까지 여쭤볼게요. 고민에 맞는 카드와 관점을 함께 살펴봐요.</p>
      </>}

      {initialized && !session && hasSaved && !busy && (invalidSaved ? <div>
        <p style={{ ...textStyle, marginBottom: 16 }}>이 기기에 저장된 상담 접근 정보를 읽을 수 없어요. 새로 시작하면 이전 상담에 다시 연결할 수 없어요.</p>
        <Action secondary onClick={() => client.reset()}>새 상담 시작</Action>
      </div> : <p style={textStyle}>위의 버튼으로 저장된 상담에 다시 연결해 주세요.</p>)}

      {session && <>
        {editing ? <ConcernForm title="고민을 다시 적어 주세요" initialValue={session.question} busy={busy} submitLabel="수정한 고민으로 살펴보기" onSubmit={revise} onCancel={() => setEditing(false)} /> : <>
          {!reading && <p style={{ ...textStyle, marginBottom: 24, color: '#71617F', fontSize: 14 }}>“{session.question}”</p>}

          {session.status === 'question' && <ConcernForm key={session.pending_question.question} title={session.pending_question.question} options={session.pending_question.options} busy={busy} submitLabel="답변 보내기" onSubmit={answer => client.command('answer', { answer })} />}

          {session.plan && !session.cards.length && <section>
            <h1 style={{ ...headingStyle, fontSize: 24 }}>이렇게 살펴볼게요</h1>
            <p style={{ ...textStyle, fontSize: 18, fontWeight: 600 }}>{session.plan.summary}</p>
            <p style={{ margin: '14px 0', color: '#64119F', fontWeight: 700 }}>카드 {session.plan.positions.length}장으로 살펴볼 관점</p>
            <ol style={{ paddingLeft: 22 }}>{session.plan.positions.map(position => <li key={position} style={{ marginBottom: 10, paddingLeft: 3 }}>{position}</li>)}</ol>
            {session.plan.conditions.length > 0 && <p style={{ ...textStyle, marginTop: 16, fontSize: 14, color: '#71617F' }}>함께 생각할 조건: {session.plan.conditions.join(' · ')}</p>}
            {session.plan.limitations && <p style={{ ...textStyle, marginTop: 16, fontSize: 14, color: '#71617F' }}>{session.plan.limitations}</p>}
            <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '28px 0' }}>{session.plan.positions.map(position => <TarotCardArt key={position} faceUp={false} size="sm" framed />)}</div>
            {session.payment_required && <p style={{ ...textStyle, fontSize: 14, marginBottom: 12 }}>무료 상담 1회를 모두 사용했어요. 이번 심화풀이 1회와 확인 카드가 포함되며, 결제창에서 금액을 확인할 수 있어요.</p>}
            <Action disabled={busy} onClick={() => session.payment_required ? client.pay() : client.command('draw')}>{session.payment_required ? '결제하고 카드 뽑기 · 구매 복구' : '카드 뽑기'}</Action>
            <Action secondary disabled={busy} onClick={() => setEditing(true)} style={{ marginTop: 10 }}>고민 수정</Action>
          </section>}

          {!reading && session.cards.length > 0 && <section>
            <h1 style={{ ...headingStyle, fontSize: 24 }}>함께 살펴볼 카드예요</h1>
            {session.cards.map((card, index) => <div key={card.id} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0' }}>
              <TarotCardArt size="sm" image={getCardImageUrl(card.id)} nameEn={card.name_ko} />
              <div><p style={{ fontSize: 14, color: '#71617F' }}>{session.plan.positions[index]}</p><strong>{card.name_ko}</strong></div>
            </div>)}
            <p style={{ fontSize: 14, color: '#71617F', marginTop: 14 }}>풀이를 다시 불러와도 이 카드들은 바뀌지 않아요.</p>
          </section>}

          {!failure && retryAction && !busy && <Action onClick={() => client.retry()} style={{ marginTop: 24 }}>{retryAction === 'plan' ? '상담 방향 살펴보기' : retryAction === 'interpret-clarifier' ? '확인 카드 풀이 이어보기' : '카드 풀이 이어보기'}</Action>}

          {reading && <>
            <section>
              <h2 style={headingStyle}>각 카드가 들려주는 이야기</h2>
              {reading.positions.map((position, index) => <Card key={position.card_id} card={session.cards[index]} position={position.position} interpretation={position.interpretation} comparison={position.comparison} />)}
            </section>
            <section style={sectionStyle}>
              <p style={{ fontSize: 13, color: '#71617F', marginBottom: 10 }}>고민에 대한 복냥이의 이야기</p>
              <h1 style={{ ...headingStyle, fontSize: 24 }}>{session.plan.summary}</h1>
              <p style={{ ...textStyle, fontSize: 18 }}>{reading.answer}</p>
              {session.plan.limitations && <p style={{ ...textStyle, marginTop: 16, fontSize: 14, color: '#71617F' }}>{session.plan.limitations}</p>}
            </section>
            <section style={sectionStyle}><h2 style={headingStyle}>카드를 함께 보면</h2><p style={textStyle}>{reading.relationships}</p></section>
            <section style={sectionStyle}><h2 style={headingStyle}>현실에서 확인해 볼 것</h2><Items values={reading.reality_checks} /></section>
            <section style={sectionStyle}><h2 style={headingStyle}>지금 해볼 수 있는 일</h2><Items values={reading.actions} /></section>

            <section style={sectionStyle}>
              <h2 style={headingStyle}>{clarifier ? '확인 카드가 보충하는 이야기' : '조금 더 살펴보고 싶은 부분이 있나요?'}</h2>
              {clarifier ? <>
                <p style={{ marginBottom: 18, color: '#71617F', fontSize: 14 }}>{session.plan.positions[clarifier.target_index]}의 의미를 보충해요.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}><TarotCardArt size="sm" image={getCardImageUrl(clarifier.card.id)} nameEn={clarifier.card.name_ko} /><strong>{clarifier.card.name_ko}</strong></div>
                {clarifier.reading && <><p style={textStyle}>{clarifier.reading.meaning}</p><p style={{ ...textStyle, marginTop: 16 }}><strong>현실에서 확인할 것</strong><br />{clarifier.reading.reality_check}</p><p style={{ ...textStyle, marginTop: 16 }}><strong>해볼 수 있는 일</strong><br />{clarifier.reading.action}</p></>}
                <p style={{ fontSize: 13, color: '#71617F', marginTop: 16 }}>확인 카드는 한 상담에 한 번만 뽑아요. 처음 풀이와 함께 읽어 주세요.</p>
              </> : <>
                <p style={{ ...textStyle, fontSize: 14, color: '#71617F', marginBottom: 16 }}>뜻이 흐릿하게 느껴지는 부분을 골라 주세요. 새 카드 한 장으로 의미를 보충하며, 기존 결과를 바꾸지는 않아요.</p>
                <label htmlFor="tarot-clarifier" style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>더 알아보고 싶은 부분</label>
                <select id="tarot-clarifier" value={target} disabled={busy} onChange={event => setTarget(event.target.value)} style={{ ...inputStyle, minHeight: 52, padding: '12px 10px', marginBottom: 12 }}>
                  <option value="">카드의 관점을 골라 주세요</option>
                  {session.plan.positions.map((position, index) => <option key={position} value={index}>{position}</option>)}
                </select>
                <Action secondary disabled={busy || target === ''} onClick={() => client.command('clarify', { target_index: Number(target) })}>확인 카드 한 장 뽑기</Action>
              </>}
            </section>
            <details style={{ ...sectionStyle, fontSize: 14 }}><summary style={{ cursor: 'pointer' }}>나눈 고민 다시 보기</summary><p style={{ ...textStyle, marginTop: 12 }}>{session.question}</p>{session.answers.map((answer, index) => <div key={index} style={{ marginTop: 12 }}><p style={textStyle}>{answer.question}</p><p style={{ ...textStyle, fontWeight: 600 }}>{answer.answer}</p></div>)}</details>
            <Action secondary disabled={busy} onClick={async () => { await client.reset(); setTarget(''); setEditing(false) }} style={{ marginTop: 28 }}>새 고민으로 상담하기</Action>
          </>}
        </>}
      </>}

      <p style={{ ...textStyle, fontSize: 12, color: '#71617F', marginTop: 30 }}>{session?.notice || '타로는 자기 성찰과 선택을 돕는 참고예요. 상대의 마음이나 미래를 확정하지 않으며, 중요한 의료·법률·재정 판단은 사실 확인과 전문가 상담을 함께해 주세요.'}</p>
    </div>
  </main>
  </>
}
