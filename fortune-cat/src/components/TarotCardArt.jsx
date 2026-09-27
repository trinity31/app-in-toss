import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './TarotCardArt.css';

// 타로 카드 시각 컴포넌트 — 앞/뒷면 + framed 매트 + size sm/md/lg.
// Source: boknyang-tarot/src/components/TarotCardArt.tsx 포팅 + UI-SPEC Layout/Color 적용.
// CONTEXT D-02: motion library 미사용 (신규 의존성 0). CSS transition만 사용.
// 앞면 이미지는 버전이 고정된 HTTPS WebP URL을 image prop으로 받는다.

const SIZES = {
  sm: { w: 64,  h: 96,  fs: 28,  label: 7,  pad: 4,  radius: 10 },
  md: { w: 120, h: 180, fs: 56,  label: 10, pad: 6,  radius: 14 },
  lg: { w: 200, h: 300, fs: 96,  label: 14, pad: 10, radius: 18 },
  xl: { w: 320, h: 480, fs: 152, label: 22, pad: 14, radius: 24 },
};

export default function TarotCardArt({
  emoji = '🌟',
  nameEn,
  image,
  faceUp = true,
  size = 'md',
  framed = false,
  zoomable = false,
}) {
  const s = SIZES[size];

  const card = (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        overflow: 'hidden',
        width: s.w,
        height: s.h,
        borderRadius: s.radius + 6,
        boxShadow: '0 8px 24px rgba(100, 17, 159, 0.12)',
      }}
    >
      {faceUp
        ? (image === null
          ? <div
              role="img"
              aria-label="카드 이미지 사용 불가"
              style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 12, background: '#F4E6FF' }}
            >이미지 준비 중</div>
          : image ? <CardImage key={image} src={image} alt={nameEn} zoomable={zoomable} /> : <CardFront s={s} emoji={emoji} nameEn={nameEn} />)
        : <CardBack s={s} />}
    </div>
  );

  if (!framed) return card;

  const matPad = size === 'xl' ? 14 : size === 'lg' ? 10 : size === 'md' ? 8 : 5;
  return (
    <div
      style={{
        position: 'relative',
        flexShrink: 0,
        padding: matPad,
        borderRadius: s.radius + 14,
        background: 'linear-gradient(160deg, #FFF8E6, #F4E6FF)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      }}
    >
      {card}
    </div>
  );
}

function CardImage({ src, alt, zoomable = false }) {
  const [expanded, setExpanded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const url = attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src;
  if (failed) return <button type="button" aria-label="다시 불러오기"
    onClick={() => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); }}
    style={{ height: '100%', width: '100%', padding: 4, border: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, textAlign: 'center', fontSize: 11, lineHeight: 1.4, background: '#F4E6FF', color: '#64119F', cursor: 'pointer' }}>
    <span>이미지 오류</span><span>다시 불러오기</span>
  </button>;
  const artwork = <img key={url} src={url} alt={alt ?? 'tarot card'} draggable={false}
    onLoad={() => setLoaded(true)} onError={() => setFailed(true)}
    style={{ height: '100%', width: '100%', userSelect: 'none', display: 'block', objectFit: 'contain' }} />;
  return <>
    {!loaded && <span role="status" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: '#F4E6FF' }}>이미지 로딩 중</span>}
    {zoomable ? <button type="button" className="tarot-art-trigger" disabled={!loaded}
      aria-label={`${alt ?? '타로 카드'} 크게 보기`} aria-haspopup="dialog" onClick={() => setExpanded(true)}>{artwork}</button> : artwork}
    {expanded && <CardViewer src={url} alt={alt} onClose={() => setExpanded(false)} />}
  </>;
}

function CardViewer({ src, alt, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return createPortal(<dialog ref={dialogRef} className="tarot-art-viewer" aria-label={`${alt ?? '타로 카드'} 크게 보기`}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="tarot-art-viewer__toolbar">
      <span>{alt ?? '타로 카드'}</span>
      <button type="button" aria-label="카드 크게 보기 닫기" onClick={onClose}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
    </div>
    <div className="tarot-art-viewer__image"><CardImage src={src} alt={alt} /></div>
  </dialog>, document.body);
}

function CardBack({ s }) {
  // boknyang-tarot 프로토타입 매칭: 라벤더→크림 라디얼 + 골드 별 점 + 이중 골드 프레임 + 중앙 골드 원형 디스크 + 코너 ✦.
  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        background: [
          'radial-gradient(circle at 22% 22%, oklch(0.78 0.14 85 / 0.55) 0 1.5px, transparent 2.5px)',
          'radial-gradient(circle at 72% 28%, oklch(0.78 0.14 85 / 0.5) 0 1.2px, transparent 2px)',
          'radial-gradient(circle at 35% 72%, oklch(0.78 0.14 85 / 0.5) 0 1.4px, transparent 2.2px)',
          'radial-gradient(circle at 80% 78%, oklch(0.78 0.14 85 / 0.5) 0 1.2px, transparent 2px)',
          'radial-gradient(circle at 50% 50%, oklch(0.95 0.04 85) 0%, oklch(0.9 0.07 320) 55%, oklch(0.82 0.1 295) 100%)',
        ].join(', '),
      }}
      aria-hidden="true"
    >
      {/* 외곽 골드 프레임 (2px solid + inset 1px) */}
      <div
        style={{
          position: 'absolute',
          top: s.pad,
          right: s.pad,
          bottom: s.pad,
          left: s.pad,
          borderRadius: s.radius,
          border: '2px solid oklch(0.82 0.13 85)',
          boxShadow: 'inset 0 0 0 1px oklch(0.65 0.12 75 / 0.6)',
          pointerEvents: 'none',
        }}
      />
      {/* 내부 얇은 골드 라인 */}
      <div
        style={{
          position: 'absolute',
          top: s.pad + 4,
          right: s.pad + 4,
          bottom: s.pad + 4,
          left: s.pad + 4,
          borderRadius: Math.max(s.radius - 4, 4),
          border: '1px solid oklch(0.82 0.13 85 / 0.5)',
          pointerEvents: 'none',
        }}
      />

      {/* 중앙 골드 원형 디스크 + 🌙 */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: s.w * 0.36,
            height: s.w * 0.36,
            borderRadius: '9999px',
            background: 'radial-gradient(circle, oklch(0.92 0.1 85) 0%, oklch(0.78 0.13 75) 70%, oklch(0.62 0.13 65) 100%)',
            boxShadow: '0 0 12px oklch(0.82 0.13 85 / 0.5), inset 0 0 0 1.5px oklch(0.45 0.1 60 / 0.6)',
          }}
        >
          <span style={{ fontSize: s.w * 0.18, lineHeight: 1 }}>🌙</span>
        </div>
      </div>

      {/* 코너 ✦ */}
      {[
        { top: s.pad + 6, left: s.pad + 6 },
        { top: s.pad + 6, right: s.pad + 6 },
        { bottom: s.pad + 6, left: s.pad + 6 },
        { bottom: s.pad + 6, right: s.pad + 6 },
      ].map((pos, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            color: 'oklch(0.82 0.13 85)',
            fontSize: s.w * 0.07,
            opacity: 0.85,
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function CardFront({ s, emoji, nameEn }) {
  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #FFF8E6, #F4E6FF)',
      }}
    >
      <span style={{ fontSize: s.fs }}>{emoji}</span>
      {nameEn && (
        <div
          style={{
            position: 'absolute',
            bottom: s.pad + 4,
            fontSize: s.label,
            fontWeight: 700,
            color: '#191F28',
          }}
        >
          {nameEn}
        </div>
      )}
    </div>
  );
}
