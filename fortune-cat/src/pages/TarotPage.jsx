// /tarot 라우트 — 데일리 원카드 코어 화면 (Phase 3).
// 상태 머신: 'intro' → 'shuffle' → 'result' → '다시 뽑기' → 'shuffle' (D-04 무제한, Phase 4가 광고로 wrap).
//
// CONTEXT D-09: intro 진입 시 22장 fetch 1회 → cardsData state 캐시 → shuffle/result 0 latency.
// CONTEXT D-03: 매 shuffle 진입 시 22장 중 새 랜덤 3장 (중복 없음).
// CONTEXT D-10: fetch 실패 → Loader → 에러 헤드라인 + 재시도 버튼 + Sentry.captureException.
// RESEARCH Pitfall 2: intro 마운트 직후 prefetchAllCardImages() 1회 — 첫 result 깜빡임 회피.
// RESEARCH Pitfall 6: handleRedraw가 startShuffle 호출 → pickThreeRandom 매번 재실행 (같은 3장 재현 회피).
// RESEARCH Pitfall 7: useEffect cleanup cancelled 플래그 — unmount 후 setState 차단.
// RESEARCH Pitfall 5: 본 페이즈는 useState 4종 유지. Phase 4·5 진입 시점에 Context 승격 결정.

import { useEffect, useState } from 'react';
import { Loader } from '@toss/tds-mobile';
import * as Sentry from '@sentry/react';
import { fetchTarotCards } from '../lib/supabase';
// eslint-disable-next-line no-unused-vars -- getCardImageUrl는 plan acceptance criteria에 명시된 import (TarotShuffle/TarotResult가 직접 사용; Wave 3 import 시그니처 잠금).
import { getCardImageUrl, prefetchAllCardImages } from '../assets/images/cards';
import Boknyang from '../components/Boknyang';
import TarotShuffle from '../components/TarotShuffle';
import TarotResult from '../components/TarotResult';

// Fisher-Yates 셔플 + 상위 3장 (RESEARCH Pattern 4).
// 22장 중복 없는 랜덤 3장. 원본 cardsData 변경 금지 (slice() shallow copy).
function pickThreeRandom(cards) {
  if (!Array.isArray(cards) || cards.length < 3) return [];
  const arr = cards.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 3);
}

export default function TarotPage() {
  const [currentPage, setCurrentPage] = useState('intro');     // 'intro' | 'shuffle' | 'result'
  const [cardsData, setCardsData] = useState([]);              // 22장 전체 (intro fetch 결과)
  const [shuffledThree, setShuffledThree] = useState([]);      // 매 shuffle 진입 시 3장
  const [selectedCardId, setSelectedCardId] = useState(null);  // result 단계 카드 id
  const [isLoading, setIsLoading] = useState(true);            // intro fetch 진행 상태
  const [errorState, setErrorState] = useState(null);          // 'fetch_failed' | null
  const [retryNonce, setRetryNonce] = useState(0);             // 재시도 트리거 (deps에 포함)

  // intro fetch — D-09 1회 호출. retryNonce 변경 시 재시도. cleanup cancelled flag (Pitfall 7).
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        setErrorState(null);
        const data = await fetchTarotCards();
        if (cancelled) return;
        if (!Array.isArray(data) || data.length < 3) {
          // RLS 정책 누락 또는 시드 미적용 케이스 (Pitfall 3) — 에러로 취급
          throw new Error(`tarot_cards 데이터 부족: ${data?.length ?? 0}행`);
        }
        setCardsData(data);
        // Pitfall 2 회피: 22장 webp prefetch (intro 단계 사용자 헤드라인 읽는 시간 동안 다운로드)
        prefetchAllCardImages();
      } catch (err) {
        if (cancelled) return;
        console.error('[TarotPage] tarot_cards fetch 실패:', err);
        Sentry.captureException(err, { extra: { phase: 'tarot_intro_fetch' } });
        setErrorState('fetch_failed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [retryNonce]);

  const startShuffle = () => {
    // Pitfall 6 회피: 매번 새 pickThreeRandom 호출
    setShuffledThree(pickThreeRandom(cardsData));
    setSelectedCardId(null);
    setCurrentPage('shuffle');
  };

  const handleSelectCard = (id) => {
    setSelectedCardId(id);
    setCurrentPage('result');
  };

  // D-04: 다시 뽑기 = intro 건너뛰고 즉시 새 셔플. Phase 4가 본 핸들러 안쪽에 광고 wrap.
  const handleRedraw = () => {
    startShuffle();
  };

  const handleRetry = () => {
    setRetryNonce((n) => n + 1);
  };

  const selectedCard = selectedCardId !== null
    ? cardsData.find((c) => c.id === selectedCardId)
    : null;

  // 로딩 상태 (UI-SPEC Loading & Error States)
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          minHeight: '100vh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          gap: 16,
        }}
        data-current-page={currentPage}
      >
        <Loader />
        <p style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4, color: '#6B7684', margin: 0 }}>
          카드를 준비하고 있어요
        </p>
      </div>
    );
  }

  // 에러 상태 (UI-SPEC Loading & Error States + D-10)
  if (errorState === 'fetch_failed') {
    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
        data-current-page={currentPage}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, color: '#191F28', margin: 0, textAlign: 'center' }}>
          카드 데이터를<br />불러오지 못했어요
        </h2>
        <p style={{ marginTop: 8, fontSize: 16, fontWeight: 400, lineHeight: 1.6, color: '#6B7684', margin: 0, textAlign: 'center' }}>
          잠시 후 다시 시도해주세요
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="tap-card"
          style={{
            marginTop: 24,
            padding: '14px 24px',
            fontSize: 16,
            fontWeight: 700,
            color: '#FFFFFF',
            background: '#64119F',
            border: 0,
            borderRadius: 12,
            cursor: 'pointer',
          }}
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  // 정상 흐름 — currentPage 라우팅
  return (
    <div data-current-page={currentPage}>
      {currentPage === 'intro' && (
        <TarotIntro onStart={startShuffle} />
      )}
      {currentPage === 'shuffle' && (
        <TarotShuffle cards={shuffledThree} onSelect={handleSelectCard} />
      )}
      {currentPage === 'result' && selectedCard && (
        <TarotResult card={selectedCard} onRedraw={handleRedraw} />
      )}
    </div>
  );
}

// intro 단계 — boknyang-tarot 프로토타입 디자인에 맞춤 (사용자 요청 2026-05-02).
// 레이아웃: ✨ 복냥타로 ✨ 로고 + 마스코트 200px + "복냥이가 뽑아주는 / 오늘의 운세" + 부제 + CTA + 자정 안내.
function TarotIntro({ onStart }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF7FB',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px calc(32px + env(safe-area-inset-bottom))',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22, lineHeight: 1, color: '#C8B6FF' }} aria-hidden="true">✦</span>
          <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: '#3F3754', margin: 0, letterSpacing: '-0.02em' }}>
            복냥타로
          </h1>
          <span style={{ fontSize: 22, lineHeight: 1, color: '#C8B6FF' }} aria-hidden="true">✦</span>
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <Boknyang size={200} />
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.7, color: '#3F3754', margin: 0 }}>
            복냥이가 뽑아주는<br />
            <span style={{ color: '#A78BFA' }}>오늘의 운세</span>
          </p>
          <p style={{ marginTop: 16, fontSize: 14, fontWeight: 400, lineHeight: 1.6, color: '#888194', margin: 0 }}>
            하루 한 번, 메이저 아르카나 한 장으로 마음을 톡 두드려요 🐾
          </p>
        </div>
      </div>

      <div style={{ paddingTop: 16 }}>
        <button
          type="button"
          onClick={onStart}
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
          오늘의 카드 뽑기 ✨
        </button>
        <p style={{ marginTop: 24, fontSize: 12, fontWeight: 400, lineHeight: 1.6, color: '#888194', margin: 0, textAlign: 'center' }}>
          하루 한 번, 자정에 초기화돼요 🌙
        </p>
      </div>
    </div>
  );
}
