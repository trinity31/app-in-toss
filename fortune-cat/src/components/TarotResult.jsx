// result 단계 — boknyang-tarot 프로토타입 매칭 (사용자 요청 2026-05-02).
// 흐름: mount 350ms 후 카드 0.9s rotateY 0→180 자동 플립. 헤드라인/메시지는 플립 완료 시점에 fade-in.
// CONTEXT D-02: motion 라이브러리 미사용. CSS transition 만 사용.
// CONTEXT D-05: 수직 흐름 (카드 → 헤드라인 → chip → 메시지 → fixed CTA).
// CONTEXT D-06: nameKo · nameEn (이모지 제거, 라벤더 nameEn).
// CONTEXT D-07: fixed 액션 영역 = 탭바 + safe-area + 8px 위. 두 버튼 가로 배치(처음으로 + 공유하기).
// RESEARCH Pitfall 1: -webkit-backface-visibility vendor prefix 필수 (iOS Safari < 16).

import { useEffect, useRef, useState } from 'react';
import TarotCardArt from './TarotCardArt';
import { getCardImageUrl } from '../assets/images/cards';

const FRAMED_LG_W = 220; // lg(200) + matPad(10) * 2
const FRAMED_LG_H = 320; // lg(300) + matPad(10) * 2

export default function TarotResult({ card, onHome, onShare }) {
  const [flipped, setFlipped] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setFlipped(true), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isZoomed) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [isZoomed]);

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
        paddingBottom: 'calc(196px + env(safe-area-inset-bottom))',
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

      <div
        role="button"
        tabIndex={0}
        aria-label="카드 확대 보기"
        onClick={() => setIsZoomed(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsZoomed(true);
          }
        }}
        style={{ marginTop: 16, perspective: 1200, cursor: 'pointer' }}
      >
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
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 20px)',
          left: 24,
          right: 24,
          zIndex: 15,
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={onHome}
          className="tap-card"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 56,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 700,
            color: '#3F3754',
            background: 'oklch(0.94 0.04 350)',
            border: 0,
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
          }}
        >
          처음으로
        </button>
        <button
          type="button"
          onClick={onShare}
          className="tap-card"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            minHeight: 56,
            padding: '12px 16px',
            fontSize: 15,
            fontWeight: 700,
            color: '#FFFFFF',
            backgroundImage: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
            border: 0,
            borderRadius: 20,
            boxShadow: '0 6px 18px rgba(124, 58, 237, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
            cursor: 'pointer',
          }}
        >
          공유하기 ✨
        </button>
      </div>

      {isZoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tarot-zoom-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsZoomed(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <h2
            id="tarot-zoom-title"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {card.name_ko} 카드 확대 보기
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsZoomed(false)}
            aria-label="닫기"
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 12px)',
              right: 16,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 0,
              borderRadius: 22,
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 400,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
          <div
            style={{
              width: '90vw',
              maxWidth: 360,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <TarotCardArt
              faceUp
              size="xl"
              framed
              image={getCardImageUrl(card.id)}
              emoji={card.emoji}
              nameEn={card.name_en}
            />
          </div>
        </div>
      )}
    </div>
  );
}
