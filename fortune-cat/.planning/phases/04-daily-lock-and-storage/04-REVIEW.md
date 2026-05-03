---
phase: 04-daily-lock-and-storage
reviewed: 2026-05-03T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - fortune-cat/src/utils/dateKST.js
  - fortune-cat/src/hooks/useTodayDrawStorage.js
  - fortune-cat/src/pages/TarotPage.jsx
findings:
  critical: 0
  warning: 2
  info: 5
  total: 7
status: issues_found
---

# Phase 4: Code Review Report

**Reviewed:** 2026-05-03T00:00:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 4 (데일리 lock + Toss Storage 영속 저장 + KST 자정 리셋) 구현 코드 검토. 3개 파일(헬퍼 1, 훅 1, 페이지 1) 총 약 470 라인.

**Strengths**
- v1.0 `useUserInfoStorage` 시그니처 미러 일관성 우수 (loading/load/save/clear/Sentry 패턴 동일).
- KST 처리는 `Intl.DateTimeFormat('en-CA', { timeZone })` 로 timezone-correct (디바이스 무관).
- Storage 미지원 환경 graceful degradation 명시적으로 구현 (D-15 catch 블록).
- 손상 데이터 검증 (`isValidTodayDraw`) 5단계 가드 + 자동 정리 (D-05).
- Phase 3 잠금 시그니처 모두 보존 (`useState` 7종, `pickThreeRandom`, `handleHome/handleShare/handleRetry/startShuffle`, `TarotIntro` 인라인).
- 이중 로딩 가드(Loader UI + lock useEffect 내부 가드)로 fetch/storage race 회피.

**Concerns**
- `handleHome` 후 `lock useEffect` 가 재실행되지 않아 자동 result 복귀가 차단됨 (의도된 설계지만 주석으로만 보강) — onResume 분기에 의존.
- `loadTodayDraw` 의 catch 블록이 "Storage 미지원"과 "실제 Storage 오류"를 구분하지 않아 진짜 장애 발생 시 Sentry 보고 누락 가능.
- `card_id` 범위 (0~21) hard-coded — 시드 변경 시 동기 부담.

전반적으로 production ship-ready 이며, 아래 Warning 2건은 추후 모니터링/개선 후보, Info 5건은 마이너 정리 항목.

## Warnings

### WR-01: `loadTodayDraw` catch 블록이 Sentry 보고를 생략 — 진짜 Storage 장애 누락 위험

**File:** `fortune-cat/src/hooks/useTodayDrawStorage.js:65-72`
**Issue:** `loadTodayDraw` 의 outer catch 는 D-15 (Storage 미지원 환경 graceful degradation) 의도로 `Sentry.captureException` 을 의도적으로 생략했다. 그러나 `Storage.getItem` 호출은 미지원 환경뿐 아니라 진짜 native bridge 장애(예: Toss SDK 버전 불일치, IPC 실패)에서도 throw 한다. 두 케이스가 구분되지 않아 production 에서 발생한 실제 장애가 console.warn 으로만 묻히고 Sentry 에 보고되지 않는다. `saveTodayDraw`/`clearTodayDraw` 는 모두 Sentry 보고하는데 load 만 누락되어 일관성도 깨진다.

**Fix:**
```javascript
} catch (error) {
  // D-15: Storage 미지원 환경 — graceful degradation. throw 하지 않고 null 반환.
  console.warn('[TarotStorage] todayDraw 로드 실패 (Storage 미지원 가능):', error);
  // 미지원 환경 시그니처(예: ReferenceError on Storage)와 진짜 장애를 구분하기 어려우므로
  // production 에서는 모두 Sentry 에 warning 레벨로 보고. 노이즈는 다음 phase 에서 필터링.
  Sentry.captureException(error, {
    level: 'warning',
    extra: { phase: 'tarot_storage_load' },
  });
  setTodayDraw(null);
  return null;
} finally {
  setLoading(false);
}
```

### WR-02: `handleHome` 후 lock useEffect 가 재실행되지 않아 자동 result 복귀가 onResume 버튼에만 의존

**File:** `fortune-cat/src/pages/TarotPage.jsx:82-105, 124-128, 218-229`
**Issue:** lock useEffect 의존성은 `[storageLoading, errorState, cardsData, todayDraw, clearTodayDraw]`. 사용자가 result 에서 `handleHome` 을 누르면 `currentPage='intro'` 로 가지만 `todayDraw` 는 변하지 않는다 → effect 가 재실행되지 않아 자동 result 복귀가 일어나지 않는다. 대신 `TarotIntro` 가 `hasTodayDraw` 를 받아 CTA 라벨이 "오늘의 카드 다시 보기 ✨" 로 바뀌고 `onResume` 클릭 시 명시적으로 `setCurrentPage('result')` 호출.

이 동작 자체는 의도된 설계로 보이며 주석(222~223)에 명시되어 있으나, lock useEffect 가 "intro 진입 직후 1회 분기"만 보장한다는 사실이 코드만 보면 미묘하다. 만약 향후 `currentPage` 가 의존성에 추가되면 무한 루프 위험.

또한 lock useEffect 가 same-day 분기 시 `setSelectedCardId` + `setCurrentPage('result')` 를 한 번 세팅한 뒤 `handleHome` 이 `setSelectedCardId(null)` 로 리셋하므로, `onResume` (224~227) 의 `setSelectedCardId(todayDraw.card_id)` 보강은 정확히 이 케이스를 위한 것 — 주석에도 명시되어 있어 의도적이다. OK.

**Fix:** 코드 변경 없음. 다만 Phase 5 가 `currentPage` 를 의존성에 추가할 경우 race 발생 위험이 있으므로 lock useEffect 상단에 다음 가드 주석 추가 권장:

```javascript
// Phase 4 lock useEffect — intro 마운트 직후 1회 분기 전용.
// currentPage 를 의존성에 추가하지 말 것 (handleHome → intro 복귀 시 자동 result 복귀 트리거 위험).
// 'handleHome 후 재진입' 케이스는 TarotIntro.onResume 이 명시적으로 처리.
useEffect(() => {
  if (storageLoading) return;
  // ... 기존 코드
}, [storageLoading, errorState, cardsData, todayDraw, clearTodayDraw]);
```

## Info

### IN-01: 디버그 `console.log` 다수 — production terser 제거에 의존

**File:** `fortune-cat/src/hooks/useTodayDrawStorage.js:38, 62, 77, 86`
**Issue:** `[TarotStorage] 불러온 데이터:`, `유효한 데이터 로드 성공:`, `저장 시도:`, `저장 완료` 등 정상 흐름 로그가 4건 있다. CLAUDE.md 에 따르면 `vite.config.js` 가 terser 로 production 에서 console 을 제거하므로 기능적 문제는 없다. 다만 v1.0 `useUserInfoStorage` 패턴이 console.log 를 어디까지 사용하는지 확인 후 일관화 권장.

**Fix:** v1.0 `useUserInfoStorage` 와 비교하여 동일 빈도면 유지, 더 적으면 `console.log` → 제거 또는 `console.debug` 로 강등.

### IN-02: `card_id` 범위 (0~21) hard-coded — 시드 변경 시 동기 부담

**File:** `fortune-cat/src/hooks/useTodayDrawStorage.js:15`
**Issue:** `if (card_id < 0 || card_id > 21) return false;` 가 메이저 아르카나 22장 가정에 묶여 있다. 향후 마이너 아르카나 56장이 추가되거나 시드가 재배포되면 이 검증을 별도로 업데이트해야 하고, 잊으면 정상 카드가 손상으로 판정되어 자동 삭제된다.

**Fix:** 상수 분리 + 주석 강화:
```javascript
// Phase 3 D-08: 메이저 아르카나 22장 (id 0~21). 시드 변경 시 이 상수 동기 필수.
const MAX_CARD_ID = 21;
// ...
if (card_id < 0 || card_id > MAX_CARD_ID) return false;
```
또는 더 견고하게는 `cardsData` fetch 후 ID set 으로 검증을 이관 (단, 훅 시그니처 확장 필요 → Phase 5+ 결정).

### IN-03: `loadTodayDraw` 내부 중복 `Storage.removeItem` 패턴

**File:** `fortune-cat/src/hooks/useTodayDrawStorage.js:50, 57`
**Issue:** JSON 파싱 실패 분기와 `isValidTodayDraw` 실패 분기가 동일한 `try { await Storage.removeItem(...) } catch (e) { console.error(...) }` 블록을 두 번 반복한다 (DRY 위반). 두 분기 모두 동일하게 `setTodayDraw(null); return null;` 도 반복.

**Fix:** 헬퍼로 추출:
```javascript
const purgeCorrupted = async (reason, payload) => {
  console.warn(`[TarotStorage] ${reason}:`, payload);
  try { await Storage.removeItem(TODAY_DRAW_STORAGE_KEY); }
  catch (e) { console.error('[TarotStorage] 손상 데이터 삭제 실패:', e); }
  setTodayDraw(null);
  return null;
};

// ...
} catch (parseErr) {
  return purgeCorrupted('JSON 파싱 실패, 손상 데이터 정리', parseErr);
}
if (!isValidTodayDraw(parsed)) {
  return purgeCorrupted('저장된 데이터가 유효하지 않습니다', parsed);
}
```

### IN-04: lock useEffect 의 `card not found` 분기 메시지 정보 부족

**File:** `fortune-cat/src/pages/TarotPage.jsx:96-99`
**Issue:** `cardsData.find((c) => c.id === todayDraw.card_id)` 가 undefined 반환 시 `console.warn` 만 찍고 `clearTodayDraw()` 호출. 이 케이스는 (1) 시드 변경, (2) Storage 데이터 손상, (3) `id` 타입 불일치(number vs string from Supabase) 셋 다 가능하다. Sentry 보고 없이 silent 정리되므로 production 에서 자주 발생해도 모를 위험.

**Fix:** Sentry 보고 추가:
```javascript
} else {
  console.warn('[TarotPage] todayDraw.card_id 가 cardsData 에 없음, 정리:', todayDraw.card_id);
  Sentry.captureMessage('todayDraw.card_id not found in cardsData', {
    level: 'warning',
    extra: {
      phase: 'tarot_lock_resolve',
      card_id: todayDraw.card_id,
      cardsCount: cardsData.length,
      cardIdType: typeof todayDraw.card_id,
    },
  });
  clearTodayDraw();
}
```

### IN-05: `handleSelectCard` 의 `saveTodayDraw` fire-and-forget 결과 미사용

**File:** `fortune-cat/src/pages/TarotPage.jsx:114-120`
**Issue:** `saveTodayDraw({ date: todayKST(), card_id: id })` 가 Promise 를 반환하지만 await 도 안 하고 결과도 무시한다. 의도된 graceful (D-11/D-16) 이므로 기능적 문제는 없다. 다만 ESLint `no-floating-promises` 류 룰을 추후 도입 시 경고 대상이 될 수 있다.

**Fix:** void 명시로 의도 표현:
```javascript
const handleSelectCard = (id) => {
  setSelectedCardId(id);
  // CONTEXT D-11/D-16: fire-and-forget. 저장 실패해도 result 화면 차단 안 함.
  void saveTodayDraw({ date: todayKST(), card_id: id });
  setCurrentPage('result');
};
```

---

_Reviewed: 2026-05-03T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
