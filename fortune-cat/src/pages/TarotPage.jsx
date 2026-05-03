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

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@toss/tds-mobile';
import * as Sentry from '@sentry/react';
import {
  getTossShareLink,
  share,
  getOperationalEnvironment,
  env,
} from '@apps-in-toss/web-framework';
import { fetchTarotCards, getOgImageUrl } from '../lib/supabase';
// eslint-disable-next-line no-unused-vars -- getCardImageUrl는 plan acceptance criteria에 명시된 import (TarotShuffle/TarotResult가 직접 사용; Wave 3 import 시그니처 잠금).
import { getCardImageUrl, prefetchAllCardImages } from '../assets/images/cards';
import TarotShuffle from '../components/TarotShuffle';
import TarotResult from '../components/TarotResult';
import { useTodayDrawStorage } from '../hooks/useTodayDrawStorage';
import { todayKST } from '../utils/dateKST';
import { logEvent } from '../lib/firebase';
import tarotCatImage from '../assets/images/tarot_cat.png';

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

  // Phase 4 (CONTEXT D-04): todayDraw 영속 저장 훅. mount 시 자동 load + KST 자정 비교 분기는 별도 useEffect.
  const { loading: storageLoading, todayDraw, saveTodayDraw, clearTodayDraw } = useTodayDrawStorage();

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

  // Phase 4 (CONTEXT D-10): storage 로드 완료 + cardsData 준비 → todayDraw 와 KST 자정 비교 후 분기.
  // - todayDraw 존재 + date 일치 → result 직진 (intro/shuffle 건너뜀)
  // - todayDraw 존재 + date 불일치 (자정 지남) → clearTodayDraw + intro 유지
  // - todayDraw 없음 → intro 유지 (기본)
  // 의존: storageLoading 종료 + cardsData 준비. cardsData 길이 검증은 fetch effect 가 errorState 로 처리.
  useEffect(() => {
    if (storageLoading) return;          // storage 로드 진행 중
    if (errorState) return;              // fetch 에러 화면 표시 중
    if (!cardsData || cardsData.length === 0) return; // fetch 미완료
    if (!todayDraw) return;              // 저장된 카드 없음 → 기본 intro

    const today = todayKST();
    if (todayDraw.date === today) {
      // D-10 케이스 1: 같은 날 재진입 → result 직진
      const card = cardsData.find((c) => c.id === todayDraw.card_id);
      if (card) {
        setSelectedCardId(todayDraw.card_id);
        setCurrentPage('result');
      } else {
        // 저장된 card_id 가 22장 안에 없음 (시드 변경 또는 손상) → 정리 후 intro
        console.warn('[TarotPage] todayDraw.card_id 가 cardsData 에 없음, 정리:', todayDraw.card_id);
        clearTodayDraw();
      }
    } else {
      // D-10 케이스 2: 자정 지남 → clear 후 intro
      console.log('[TarotPage] KST 자정 지남, todayDraw 정리:', todayDraw.date, '->', today);
      clearTodayDraw();
    }
  }, [storageLoading, errorState, cardsData, todayDraw, clearTodayDraw]);

  // CONTEXT D-06 (ANL-01): tarot_view 이벤트 — storage + cardsData 준비 완료 후 마운트당 1회 발화.
  // already_drawn = Boolean(todayDraw && todayDraw.date === todayKST())
  // Phase 4 의 hasTodayDraw 계산식 그대로 재사용 (04-02-SUMMARY "hasTodayDraw 계산식 잠금").
  // tarotViewLoggedRef: 같은 마운트 내 saveTodayDraw 후 todayDraw reference 변경으로 인한 중복 발화 차단 (REVIEW WR-01).
  const tarotViewLoggedRef = useRef(false);
  useEffect(() => {
    if (tarotViewLoggedRef.current) return;
    if (storageLoading) return;
    if (errorState) return;
    if (!cardsData || cardsData.length === 0) return;

    tarotViewLoggedRef.current = true;
    const alreadyDrawn = Boolean(todayDraw && todayDraw.date === todayKST());
    logEvent('tarot_view', { already_drawn: alreadyDrawn });
  }, [storageLoading, errorState, cardsData, todayDraw]);

  const startShuffle = () => {
    // Pitfall 6 회피: 매번 새 pickThreeRandom 호출
    setShuffledThree(pickThreeRandom(cardsData));
    setSelectedCardId(null);
    setCurrentPage('shuffle');
  };

  const handleSelectCard = (id, slot) => {
    setSelectedCardId(id);
    // CONTEXT D-11: shuffle 확정 시 todayDraw 영속 저장 (fire-and-forget — await 하지 않음).
    // 저장 실패해도 result 화면은 메모리 기반으로 표시됨 (D-16 graceful).
    saveTodayDraw({ date: todayKST(), card_id: id });
    // CONTEXT D-07 (ANL-02): card_drawn 이벤트 — saveTodayDraw 와 동일 라인에 발화 (둘 다 fire-and-forget OK).
    logEvent('card_drawn', { card_id: id, slot });
    setCurrentPage('result');
  };

  // 처음으로 = intro 단계로 복귀. v1.1 수익 모델 전환(2026-05-03)으로 '다시 뽑기'에서 변경됨.
  // Phase 4가 daily lock 추가 시: cardsData 캐시는 유지, 자정 전이면 todayDraw 보고 result 로 직진.
  const handleHome = () => {
    setSelectedCardId(null);
    setShuffledThree([]);
    setCurrentPage('intro');
  };

  // CONTEXT D-01/D-02/D-08/D-09 (SHARE-01 + ANL-03): handleShare 실구현.
  // - D-01: 메시지 = 헤드라인 + 80자 트림 + 토스 링크
  // - D-02: deeplink = sandbox/production 분기
  // - D-08: card_shared 이벤트 = share() 성공 후 1회
  // - D-09: 실패 silent (try/catch + console.error 만, 사용자 알림 없음, HomePage 패턴 동일)
  const handleShare = async () => {
    if (!selectedCard) return; // result 단계 외 호출 방지 (defensive)

    // D-01 헤드라인 + 본문(80자 트림)
    const headline = `[복냥타로] 오늘의 카드 — ${selectedCard.name_ko} · ${selectedCard.name_en}`;
    const snippet = selectedCard.message.length > 80
      ? selectedCard.message.slice(0, 80) + '…'
      : selectedCard.message;

    // D-02 deeplink + getTossShareLink — 실패 시 link = undefined 로 두고 메시지만 공유
    let link;
    try {
      const isSandbox = getOperationalEnvironment() === 'sandbox';
      const deepLink = isSandbox
        ? `intoss-private://appsintoss?_deploymentId=${env.getDeploymentId()}`
        : 'intoss://fortune-cat/tarot';
      link = await getTossShareLink(deepLink, getOgImageUrl());
    } catch (error) {
      console.error('[TarotPage] getTossShareLink 실패:', error);
      // link = undefined — D-09: 헤드라인 + 본문만 공유 시도
    }

    const message = link
      ? `${headline}\n${snippet}\n${link}`
      : `${headline}\n${snippet}`;

    try {
      await share({ message });
      // D-08 (ANL-03): share() 성공 후에만 발화. 사용자 취소·실패 catch 에서는 발화 X.
      logEvent('card_shared', {
        card_id: selectedCard.id,
        with_link: Boolean(link),
      });
    } catch (error) {
      // D-09: silent — 사용자 알림 없음, HomePage 패턴
      console.error('[TarotPage] 공유 실패:', error);
    }
  };

  const handleRetry = () => {
    setRetryNonce((n) => n + 1);
  };

  const selectedCard = selectedCardId !== null
    ? cardsData.find((c) => c.id === selectedCardId)
    : null;

  // 로딩 상태 (UI-SPEC Loading & Error States)
  // storage 로드 + cardsData fetch 둘 다 완료해야 분기 가능 — 둘 중 하나라도 진행 중이면 Loader 노출.
  if (isLoading || storageLoading) {
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
        <TarotIntro
          hasTodayDraw={Boolean(todayDraw && todayDraw.date === todayKST())}
          onStart={startShuffle}
          onResume={() => {
            // CONTEXT D-14: todayDraw 존재 시 result 진입. selectedCardId 는 lock useEffect 가 이미 세팅했지만
            // 사용자가 result 에서 처음으로(handleHome) 누른 뒤 다시 intro 진입한 케이스를 위해 명시적으로 보강.
            if (todayDraw) {
              setSelectedCardId(todayDraw.card_id);
              setCurrentPage('result');
            }
          }}
        />
      )}
      {currentPage === 'shuffle' && (
        <TarotShuffle cards={shuffledThree} onSelect={handleSelectCard} />
      )}
      {currentPage === 'result' && selectedCard && (
        <TarotResult card={selectedCard} onHome={handleHome} onShare={handleShare} />
      )}
    </div>
  );
}

// intro 단계 — boknyang-tarot 프로토타입 디자인에 맞춤 (사용자 요청 2026-05-02).
// 레이아웃: ✨ 복냥타로 ✨ 로고 + 마스코트 200px + "복냥이가 뽑아주는 / 오늘의 운세" + 부제 + CTA + 자정 안내.
function TarotIntro({ hasTodayDraw, onStart, onResume }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFF7FB',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 24px calc(96px + env(safe-area-inset-bottom))',
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
          <img
            src={tarotCatImage}
            alt="복냥타로 마스코트"
            width={200}
            height={200}
            draggable={false}
            style={{ display: 'block', userSelect: 'none' }}
          />
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
          onClick={hasTodayDraw ? onResume : onStart}
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
          {hasTodayDraw ? '오늘의 카드 다시 보기 ✨' : '오늘의 카드 뽑기 ✨'}
        </button>
        <p style={{ marginTop: 24, fontSize: 12, fontWeight: 400, lineHeight: 1.6, color: '#888194', margin: 0, textAlign: 'center' }}>
          하루 한 번, 자정에 초기화돼요 🌙
        </p>
      </div>
    </div>
  );
}
