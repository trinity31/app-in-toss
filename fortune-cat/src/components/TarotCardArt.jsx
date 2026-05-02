// 타로 카드 시각 컴포넌트 — 앞/뒷면 + framed 매트 + size sm/md/lg.
// Source: boknyang-tarot/src/components/TarotCardArt.tsx 포팅 + UI-SPEC Layout/Color 적용.
// CONTEXT D-02: motion library 미사용 (신규 의존성 0). CSS transition만 사용.
// CONTEXT D-11: 앞면 이미지는 webp 정적 import URL을 image prop으로 받음.

const SIZES = {
  sm: { w: 64,  h: 96,  fs: 28, label: 7,  pad: 4,  radius: 10 },
  md: { w: 120, h: 180, fs: 56, label: 10, pad: 6,  radius: 14 },
  lg: { w: 200, h: 300, fs: 96, label: 14, pad: 10, radius: 18 },
};

export default function TarotCardArt({
  emoji = '🌟',
  nameEn,
  image,
  faceUp = true,
  size = 'md',
  framed = false,
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
        ? (image ? <CardImage src={image} alt={nameEn} /> : <CardFront s={s} emoji={emoji} nameEn={nameEn} />)
        : <CardBack s={s} />}
    </div>
  );

  if (!framed) return card;

  const matPad = size === 'lg' ? 10 : size === 'md' ? 8 : 5;
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

function CardImage({ src, alt }) {
  return (
    <img
      src={src}
      alt={alt ?? 'tarot card'}
      draggable={false}
      style={{
        height: '100%',
        width: '100%',
        userSelect: 'none',
        display: 'block',
        objectFit: 'cover',
      }}
    />
  );
}

function CardBack({ s }) {
  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        background: 'linear-gradient(135deg, #64119F, #4A0A78)',
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: 'absolute',
          top: s.pad,
          right: s.pad,
          bottom: s.pad,
          left: s.pad,
          borderRadius: s.radius,
          border: '1.5px solid #D4A537',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: Math.max(36, s.w * 0.36), lineHeight: 1 }}>🌙</span>
      </div>
      {[
        { top: s.pad + 4, left: s.pad + 4 },
        { top: s.pad + 4, right: s.pad + 4 },
        { bottom: s.pad + 4, left: s.pad + 4 },
        { bottom: s.pad + 4, right: s.pad + 4 },
      ].map((pos, i) => (
        <span
          key={i}
          style={{ position: 'absolute', ...pos, color: '#D4A537', fontSize: s.w * 0.07, pointerEvents: 'none' }}
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
