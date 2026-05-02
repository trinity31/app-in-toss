// shuffle 단계 — 부채꼴 3장 + 1장 탭 시 그 자리에서 CSS 3D rotateY 뒤집기 → onSelect(id) 호출.
// CONTEXT D-01: 부채꼴 3장 중 1장 선택 (confirm 단계 없음).
// CONTEXT D-02: CSS keyframes/transition만 사용. motion library 금지.
// UI-SPEC Animation: 카드 뒤집기 0.5s ease-out spec(line 120), 부채꼴 stagger 0.08s.
// UI-SPEC Layout: 좌 -15° / 중앙 0° / 우 +15°, translateX -64/0/+64.
// RESEARCH Pitfall 1: -webkit-backface-visibility vendor prefix 필수 (iOS Safari < 16).

import { useState } from 'react';
import TarotCardArt from './TarotCardArt';
import { getCardImageUrl } from '../assets/images/cards';

const POSITIONS = [
  { x: -64, rot: -15 },
  { x: 0,   rot: 0   },
  { x: 64,  rot: 15  },
];

export default function TarotShuffle({ cards, onSelect }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [flipping, setFlipping] = useState(false);

  if (!Array.isArray(cards) || cards.length < 3) return null;

  const handleTap = (slotIdx) => {
    if (selectedSlot !== null) return;
    setSelectedSlot(slotIdx);
    setFlipping(true);
    // UI-SPEC Animation: 0.5s flip + 0.2s scale → 약 0.7s 뒤 result로 진입
    setTimeout(() => onSelect(cards[slotIdx].id), 700);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 48,
        paddingLeft: 16,
        paddingRight: 16,
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
      }}
    >
      <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: '#191F28', margin: 0, textAlign: 'center' }}>
        세 장 중 한 장을 골라보세요
      </h2>
      <p style={{ marginTop: 16, fontSize: 16, fontWeight: 400, lineHeight: 1.6, color: '#6B7684', textAlign: 'center' }}>
        탭하면 그 자리에서 뒤집혀요
      </p>

      <div
        style={{
          marginTop: 48,
          position: 'relative',
          width: '100%',
          height: 240,
        }}
      >
        {cards.slice(0, 3).map((card, i) => {
          const isSel = selectedSlot === i;
          const isOther = selectedSlot !== null && !isSel;
          const pos = POSITIONS[i];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleTap(i)}
              aria-label={`카드 ${i + 1}번 선택`}
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                marginLeft: -60,
                transform: `translateX(${isSel ? 0 : pos.x}px) rotate(${isSel ? 0 : pos.rot}deg) scale(${isSel ? 1.15 : 1})`,
                opacity: isOther ? 0.3 : 1,
                transition: 'transform 0.4s ease-out, opacity 0.3s ease-out',
                transitionDelay: selectedSlot === null ? `${i * 0.08}s` : '0s',
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {isSel && flipping ? (
                <FlipCard card={card} />
              ) : (
                <TarotCardArt faceUp={false} size="md" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 선택된 카드 1장만 그 자리에서 0.5s rotateY 뒤집기. 진입 직후 flipped=true로 트랜지션 시작.
function FlipCard({ card }) {
  const [flipped, setFlipped] = useState(false);

  // mount 직후 다음 프레임에 flipped=true → CSS transition 0 → 180deg 시작
  if (!flipped) {
    requestAnimationFrame(() => setFlipped(true));
  }

  return (
    <div style={{ perspective: 1200 }}>
      <div
        style={{
          position: 'relative',
          width: 120,
          height: 180,
          transformStyle: 'preserve-3d',
          WebkitTransformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          willChange: 'transform',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <TarotCardArt faceUp={false} size="md" />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0, right: 0, bottom: 0, left: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <TarotCardArt
            faceUp
            size="md"
            image={getCardImageUrl(card.id)}
            emoji={card.emoji}
            nameEn={card.name_en}
          />
        </div>
      </div>
    </div>
  );
}
