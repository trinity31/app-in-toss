// result 단계 — 카드 이미지 + 헤더 + 키워드 chip + 메시지 카드 + fixed 다시 뽑기 버튼.
// CONTEXT D-05: 수직 흐름. D-06: 이모지+한국어명+영문명/chip 2-4개/메시지 ~300자.
// CONTEXT D-07: fixed 버튼 = 탭바 + safe-area + 8px 위.
// UI-SPEC Color: --color-primary-light 메시지 카드 + chip 배경, --color-primary 영문명/chip 텍스트/CTA.
// UI-SPEC Typography: Display 24/700, Body 16/400 line-height 1.6, Body Strong 16/700 CTA, Label 14/700.
// UI-SPEC Spacing: 카드↔헤더 24px, 헤더↔chip 16px, chip↔메시지 24px, 메시지↔fixed 96px spacer.

import TarotCardArt from './TarotCardArt';
import { getCardImageUrl } from '../assets/images/cards';

export default function TarotResult({ card, onRedraw }) {
  if (!card) return null;
  const keywords = (card.keywords || []).slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', position: 'relative' }}>
      <div
        style={{
          paddingTop: 32,
          paddingLeft: 16,
          paddingRight: 16,
          paddingBottom: 96,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#6B7684',
            marginBottom: 8,
          }}
        >
          오늘의 한 장
        </span>

        <TarotCardArt
          faceUp
          framed
          size="lg"
          image={getCardImageUrl(card.id)}
          emoji={card.emoji}
          nameEn={card.name_en}
        />

        <h2
          style={{
            marginTop: 24,
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1.3,
            margin: 0,
            textAlign: 'center',
          }}
        >
          <span style={{ color: '#191F28' }}>{card.emoji} {card.name_ko} </span>
          <span style={{ color: '#64119F' }}>({card.name_en})</span>
        </h2>

        {keywords.length > 0 && (
          <div
            style={{
              marginTop: 16,
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
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  color: '#64119F',
                  background: '#F4E6FF',
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                #{k}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            background: '#F4E6FF',
            borderRadius: 16,
            padding: 20,
            maxWidth: 360,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 400,
              lineHeight: 1.6,
              color: '#191F28',
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {card.message}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onRedraw}
        className="tap-card"
        style={{
          position: 'fixed',
          bottom: 'calc(72px + env(safe-area-inset-bottom) + 8px)',
          left: 16,
          right: 16,
          height: 56,
          fontSize: 16,
          fontWeight: 700,
          color: '#FFFFFF',
          background: '#64119F',
          border: 0,
          borderRadius: 12,
          cursor: 'pointer',
          zIndex: 15,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
        }}
      >
        다시 뽑기
      </button>
    </div>
  );
}
