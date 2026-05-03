---
phase: 05-share-and-analytics
reviewed: 2026-05-03T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - fortune-cat/granite.config.ts
  - fortune-cat/src/pages/TarotPage.jsx
  - fortune-cat/src/components/TarotShuffle.jsx
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 5: Code Review Report

**Reviewed:** 2026-05-03
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 5(공유 + Analytics 마무리) 구현은 전반적으로 잠금된 시그니처(useState 7종, `useTodayDrawStorage`, `pickThreeRandom`, `handleHome/handleRetry/startShuffle/handleSelectCard`, `TarotIntro` 인라인)를 잘 보존했고 `card_shared` 의 발화 위치(`share()` 성공 후, `with_link` 정확)와 sandbox/production deeplink 분기는 의도대로 구현되어 있다. HomePage의 try/catch silent 패턴과도 일관성 있게 맞춰져 있다.

다만 다음 두 가지가 v1.1 Analytics 신호 품질에 영향을 줄 수 있어 Warning으로 분류한다.

1. **`tarot_view` 이벤트가 동일 마운트 사이클에서 여러 번 발화**될 수 있다. deps에 `todayDraw` 가 들어 있어, `handleSelectCard` → `saveTodayDraw` 후 `todayDraw` reference 변경 시 또 한 번 발화된다. "ANL-01: tarot_view 1회/마운트" 의도와 어긋난다.
2. **`getTossShareLink` / `share` graceful degradation 가드가 빠져 있다.** Phase 5 검토 포인트 5번에서 명시한 `typeof getTossShareLink === 'function'` 가드가 없어, web 빌드(브라우저)에서는 `share`가 throw하면 silent로 잡히지만 분석/디버깅 노이즈가 발생할 수 있다.

Critical 이슈는 없고 코드는 머지 가능 수준이다.

## Warnings

### WR-01: `tarot_view` 이벤트 중복 발화 가능 — `todayDraw` deps

**File:** `fortune-cat/src/pages/TarotPage.jsx:118-131`
**Issue:**
`tarot_view` useEffect deps에 `todayDraw` 가 포함되어 있다. 그런데 `handleSelectCard`(140) → `saveTodayDraw({ date, card_id })` (144) 가 호출되면 storage hook 내부에서 `todayDraw` state 가 새 reference 로 바뀌고, 같은 마운트 안에서 `tarot_view` useEffect 가 한 번 더 트리거된다. 결과적으로:

- 케이스 A (오늘 첫 진입 → 카드 뽑기): `tarot_view{already_drawn:false}` 발화 → 카드 뽑은 직후 `tarot_view{already_drawn:true}` 한 번 더 발화
- 케이스 B (자정 지남 → `clearTodayDraw()`): `clearTodayDraw` 직후 `todayDraw` reference 변동으로 또 발화

이는 `04-02-SUMMARY` 의 "tarot_view 1회/마운트" 의도와 어긋나며, Funnel 분석에서 `card_drawn / tarot_view` 비율이 1을 넘는 등 신호가 왜곡된다.

**Fix:**
한 마운트 사이클에서 1회만 발화하도록 ref 가드를 추가한다 (`already_drawn` 값은 첫 발화 시점 기준으로 고정).

```jsx
// 상단에 useRef 추가
import { useEffect, useRef, useState } from 'react';

// 컴포넌트 본체에 ref 선언
const tarotViewLoggedRef = useRef(false);

// CONTEXT D-06 (ANL-01): tarot_view 이벤트 — 마운트당 1회만 발화.
useEffect(() => {
  if (storageLoading) return;
  if (errorState) return;
  if (!cardsData || cardsData.length === 0) return;
  if (tarotViewLoggedRef.current) return; // 이미 발화됨

  let cancelled = false;
  Promise.resolve().then(() => {
    if (cancelled) return;
    if (tarotViewLoggedRef.current) return;
    const alreadyDrawn = Boolean(todayDraw && todayDraw.date === todayKST());
    logEvent('tarot_view', { already_drawn: alreadyDrawn });
    tarotViewLoggedRef.current = true;
  });
  return () => { cancelled = true; };
}, [storageLoading, errorState, cardsData, todayDraw]);
```

또는 단순히 deps에서 `todayDraw` 만 제거하고 effect 내부에서 첫 평가 시점의 값으로만 분기하는 방법도 가능하나, ref 가드가 의도가 더 명시적이다.

---

### WR-02: `getTossShareLink` / `share` graceful degradation 가드 누락

**File:** `fortune-cat/src/pages/TarotPage.jsx:163-200`
**Issue:**
Phase 5 검토 포인트 5("graceful degradation: `typeof getTossShareLink === 'function'` 가드")가 적용되지 않았다. 일반 브라우저 빌드(개발 환경)에서 `@apps-in-toss/web-framework` 의 `share` / `getTossShareLink` 가 미구현이거나 stub일 경우 매번 try/catch 로 잡히지만:

- `console.error` 노이즈가 정상 흐름인 dev 환경에서 발생
- Sentry breadcrumb 에 의도되지 않은 에러로 누적될 가능성
- CLAUDE.md "Platform: Apps-in-Toss WebView — 일반 브라우저에서는 광고/IAP/GetAnonymousKey 가 동작하지 않음, dev 에서는 graceful degradation 필요" 원칙 위배

**Fix:**
share API 가용성을 사전에 점검하고, 사용 불가능하면 dev 콘솔 안내만 남긴 뒤 조용히 종료한다 (`card_shared` 도 발화하지 않음 — 실 사용자 행동이 아니므로).

```jsx
const handleShare = async () => {
  if (!selectedCard) return;

  // graceful degradation: WebView 외 환경(브라우저 dev)에서는 share API 미존재
  if (typeof share !== 'function') {
    console.warn('[TarotPage] share API 미지원 환경 (skip)');
    return;
  }

  const headline = `[복냥타로] 오늘의 카드 — ${selectedCard.name_ko} · ${selectedCard.name_en}`;
  const snippet = selectedCard.message.length > 80
    ? selectedCard.message.slice(0, 80) + '…'
    : selectedCard.message;

  let link;
  if (typeof getTossShareLink === 'function') {
    try {
      const isSandbox = getOperationalEnvironment() === 'sandbox';
      const deepLink = isSandbox
        ? `intoss-private://appsintoss?_deploymentId=${env.getDeploymentId()}`
        : 'intoss://fortune-cat/tarot';
      link = await getTossShareLink(deepLink, getOgImageUrl());
    } catch (error) {
      console.error('[TarotPage] getTossShareLink 실패:', error);
    }
  }

  const message = link
    ? `${headline}\n${snippet}\n${link}`
    : `${headline}\n${snippet}`;

  try {
    await share({ message });
    logEvent('card_shared', {
      card_id: selectedCard.id,
      with_link: Boolean(link),
    });
  } catch (error) {
    console.error('[TarotPage] 공유 실패:', error);
  }
};
```

## Info

### IN-01: `handleShare` 가 `selectedCard` 선언보다 위에서 정의됨 (가독성)

**File:** `fortune-cat/src/pages/TarotPage.jsx:163-208`
**Issue:**
`handleShare` (163) 가 `selectedCard` 변수 (206) 보다 위에 선언되어 있다. JS 클로저 캡처 덕분에 호출 시점에는 선언이 완료되어 정상 동작하지만, 코드 가독성/리뷰 효율 측면에서는 `selectedCard` 계산을 핸들러보다 먼저 두는 편이 일반적이다 (`selectedCard` 가 핸들러 의존성이라는 점이 시각적으로 드러남).

**Fix:** `selectedCard` 선언을 `useEffect` 들 직후, 핸들러들(handleHome / handleSelectCard / handleShare / handleRetry) 위로 이동한다. 동작 변화 없음, 의도 전달이 명확해진다.

---

### IN-02: `handleSelectCard` 의 `slot` 파라미터 타입 가드 부재

**File:** `fortune-cat/src/pages/TarotPage.jsx:140-148`
**Issue:**
`handleSelectCard(id, slot)` 가 `slot` 의 유효성 (0 | 1 | 2) 을 검증하지 않는다. 현재 호출처(`TarotShuffle.handleConfirm`)에서는 `selectedSlot !== null` 가드가 있어 안전하지만, 향후 다른 호출처가 추가되거나 시그니처 변경 시 `slot=undefined` 가 그대로 `logEvent('card_drawn', { slot: undefined })` 로 흘러간다 (Firebase 는 undefined 값을 무시하지만 분석 측면에서는 이벤트 손실).

**Fix:**
방어적으로 한 줄 가드만 추가한다.

```jsx
const handleSelectCard = (id, slot) => {
  setSelectedCardId(id);
  saveTodayDraw({ date: todayKST(), card_id: id });
  // slot 이 0/1/2 가 아니면 분석 신호 손실 — 명시적 fallback
  const safeSlot = (slot === 0 || slot === 1 || slot === 2) ? slot : -1;
  logEvent('card_drawn', { card_id: id, slot: safeSlot });
  setCurrentPage('result');
};
```

---

### IN-03: `getCardImageUrl` eslint-disable 주석의 장기 부담

**File:** `fortune-cat/src/pages/TarotPage.jsx:22-23`
**Issue:**
`getCardImageUrl` 가 TarotPage 내부에서 사용되지 않아 `// eslint-disable-next-line no-unused-vars` 로 묶어두었다. plan acceptance criteria 의 import 시그니처 잠금을 위한 의도임은 주석에 명시되어 있으나, Phase 5 종료 후에는 잠금이 해제되므로 다음 마일스톤에서 제거하거나, 실제로 TarotPage 가 카드 이미지 URL 을 필요로 하지 않는다면 import 자체를 제거해 트리쉐이킹 부담을 줄이는 편이 깔끔하다.

**Fix (다음 phase 후속 정리):** Phase 5 종료 직후 별도 cleanup 커밋에서 `getCardImageUrl` import 제거. `prefetchAllCardImages` 만 남긴다.

---

_Reviewed: 2026-05-03_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
