// shuffle 단계 — boknyang-tarot 프로토타입 모델로 재구성 (사용자 요청 2026-05-02).
// 흐름: 탭으로 카드 1장 선택(하이라이트) → 확정 버튼으로 commit → onSelect(id) 호출.
// CONTEXT D-02: CSS transition 만 사용. motion 라이브러리 금지.
// UI-SPEC Layout 재정의: 좌 -16° / 중앙 0° / 우 +16°, translateX -78/0/+78 (프로토타입 spread).
// 선택 시: translateY +60px + scale 1.35 + brightness/saturation 필터 + 미선택은 opacity 0.3.

import { useState } from 'react';
import TarotCardArt from './TarotCardArt';

const POSITIONS = [
  { x: -78, rot: -16 },
  { x: 0,   rot: 0   },
  { x: 78,  rot: 16  },
];

export default function TarotShuffle({ cards, onSelect }) {
  const [selectedSlot, setSelectedSlot] = useState(null);

  if (!Array.isArray(cards) || cards.length < 3) return null;

  const handleTap = (slotIdx) => {
    if (selectedSlot === slotIdx) return;
    setSelectedSlot(slotIdx);
  };

  const handleConfirm = () => {
    if (selectedSlot === null) return;
    // CONTEXT D-07: card_drawn 이벤트의 slot 파라미터(0/1/2) 를 TarotPage 로 전달.
    onSelect(cards[selectedSlot].id, selectedSlot);
  };

  const isReady = selectedSlot !== null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF7FB',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
      }}
    >
      <p style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.4, color: '#3F3754', margin: 0, textAlign: 'center' }}>
        마음에 드는 카드를 톡! 골라보라냥
      </p>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 32,
          paddingBottom: 8,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 320,
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
                aria-pressed={isSel}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  marginLeft: -60,
                  transform: `translate(${isSel ? 0 : pos.x}px, ${isSel ? 60 : 0}px) rotate(${isSel ? 0 : pos.rot}deg) scale(${isSel ? 1.35 : 1})`,
                  opacity: isOther ? 0.3 : 1,
                  filter: isSel ? 'brightness(0.92) saturate(1.15)' : 'none',
                  transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out, filter 0.3s ease-out',
                  transitionDelay: selectedSlot === null ? `${i * 0.08}s` : '0s',
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 0,
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  outline: 'none',
                }}
              >
                <TarotCardArt faceUp={false} size="md" />
              </button>
            );
          })}
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.5, color: '#3F3754', margin: 0 }}>
            {isReady ? '이 카드로 결정할까냥?' : '세 장의 카드 중 한 장을 골라달라냥 🐾'}
          </p>
          <p style={{ marginTop: 8, fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: '#888194', margin: 0 }}>
            한 번 선택하면 오늘 자정까지 같은 카드가 보여져요
          </p>
        </div>

        <button
          type="button"
          disabled={!isReady}
          onClick={handleConfirm}
          className="tap-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            minHeight: 56,
            padding: '16px 24px',
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
            backgroundImage: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
            border: 0,
            borderRadius: 24,
            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            opacity: isReady ? 1 : 0.4,
            cursor: isReady ? 'pointer' : 'not-allowed',
            pointerEvents: isReady ? 'auto' : 'none',
            transition: 'opacity 0.2s ease-out',
          }}
        >
          이 카드로 결정할래요 ✨
        </button>
      </div>
    </div>
  );
}
