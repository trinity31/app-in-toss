// result 단계 — boknyang-tarot 프로토타입 매칭 (사용자 요청 2026-05-02).
// 흐름: mount 350ms 후 카드 0.9s rotateY 0→180 자동 플립. 헤드라인/메시지는 플립 완료 시점에 fade-in.
// CONTEXT D-02: motion 라이브러리 미사용. CSS transition 만 사용.
// CONTEXT D-05: 수직 흐름 (카드 → 헤드라인 → chip → 메시지 → fixed CTA).
// CONTEXT D-06: nameKo · nameEn (이모지 제거, 라벤더 nameEn).
// CONTEXT D-07: fixed CTA = 탭바 + safe-area + 8px 위.
// RESEARCH Pitfall 1: -webkit-backface-visibility vendor prefix 필수 (iOS Safari < 16).

import { useEffect, useState } from 'react';
import TarotCardArt from './TarotCardArt';
import { getCardImageUrl } from '../assets/images/cards';

const FRAMED_LG_W = 220; // lg(200) + matPad(10) * 2
const FRAMED_LG_H = 320; // lg(300) + matPad(10) * 2

export default function TarotResult({ card, onRedraw }) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 350);
    return () => clearTimeout(t);
  }, []);

  if (!card) return null;
  const keywords = (card.keywords || []).slice(0, 4);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF7FB',
        position: 'relative',
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 400,
          color: '#888194',
          letterSpacing: '0.02em',
        }}
      >
        오늘의 한 장
      </span>

      <div style={{ marginTop: 16, perspective: 1200 }}>
        <div
          style={{
            position: 'relative',
            width: FRAMED_LG_W,
            height: FRAMED_LG_H,
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <TarotCardArt faceUp={false} size="lg" framed />
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <TarotCardArt
              faceUp
              size="lg"
              framed
              image={getCardImageUrl(card.id)}
              emoji={card.emoji}
              nameEn={card.name_en}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          textAlign: 'center',
          opacity: flipped ? 1 : 0,
          transform: flipped ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.4s ease 0.6s, transform 0.4s ease 0.6s',
        }}
      >
        <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
          <span style={{ color: '#3F3754' }}>{card.name_ko}</span>
          <span style={{ color: '#888194' }}> · </span>
          <span style={{ color: '#A78BFA' }}>{card.name_en}</span>
        </h2>

        {keywords.length > 0 && (
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {keywords.map((k) => (
              <span
                key={k}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#3F3754',
                  background: 'oklch(0.94 0.04 350)',
                  borderRadius: 9999,
                }}
              >
                #{k}
              </span>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: 20,
          maxWidth: 320,
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 24,
          padding: '16px 20px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          opacity: flipped ? 1 : 0,
          transform: flipped ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.4s ease 0.8s, transform 0.4s ease 0.8s',
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.7,
            color: '#3F3754',
            margin: 0,
            whiteSpace: 'pre-wrap',
          }}
        >
          {card.message}
        </p>
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 8px)',
          left: 24,
          right: 24,
          zIndex: 15,
        }}
      >
        <button
          type="button"
          onClick={onRedraw}
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
            cursor: 'pointer',
          }}
        >
          다시 뽑기 ✨
        </button>
      </div>
    </div>
  );
}
