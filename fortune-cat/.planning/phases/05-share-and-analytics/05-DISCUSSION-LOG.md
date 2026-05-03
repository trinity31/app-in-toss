# Phase 05: 공유 + Analytics 마무리 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-03
**Phase:** 05-share-and-analytics
**Areas discussed:** 공유 메시지 포맷, 공유 deeplink 도착 페이지, OG 이미지, Analytics 이벤트 명명/파라미터

---

## 공유 메시지 포맷

| Option | Description | Selected |
|--------|-------------|----------|
| (A) 헤드라인 + 메시지 80자 트림 + 토스 링크 | 프로토타입 동일 패턴 | ✓ |
| (B) 헤드라인 + 전체 메시지 + 토스 링크 | 길지만 풍부 | |
| (C) 헤드라인 + 토스 링크만 | 미니멀, OG 이미지에 맡김 | |

**User's choice:** A
**Notes:** 프로토타입(boknyang-tarot result.tsx)과 동일하게 — `[복냥타로] 오늘의 카드 — {nameKo} · {nameEn}` + `card.message.length > 80 ? slice + '…' : message` + 링크.

---

## 공유 deeplink 도착 페이지

| Option | Description | Selected |
|--------|-------------|----------|
| (A) `intoss://fortune-cat/tarot` — 타로 탭 intro | 받은 사람도 자기 카드 뽑게 | ✓ |
| (B) `intoss://fortune-cat/` — HomePage (사주 탭) | 일반 진입 | |
| (C) 보낸 사람의 카드 결과 미리보기 | 복잡 (저장 키 공유 필요) | |

**User's choice:** A
**Notes:** Sandbox 환경에서는 `intoss-private://appsintoss?_deploymentId=${env.getDeploymentId()}` (HomePage 패턴 동일).

---

## OG 이미지

| Option | Description | Selected |
|--------|-------------|----------|
| (A) 정적 1장 (모든 카드 동일, 복냥타로 브랜드 이미지) | 단순, 호스팅 1회 | ✓ |
| (B) 카드별 22종 다른 이미지 | 풍부하지만 호스팅·동기화 부담 | |
| (C) 이미지 없음 | 텍스트만 | |

**User's choice:** A (with addendum)
**Notes:** 사용자 추가 — "이미 A 타입으로 구현되어 있으나 '복냥사주' 이미지로 되어 있어서, 앱 이름과 이미지를 '복냥사주&타로'로 변경 필요". 따라서 코드 변경 없음 (`getOgImageUrl()` 헬퍼 그대로) + Supabase Storage 의 `menu_images/og_image.png` 를 사용자가 직접 교체 + `granite.config.ts` 의 `brand.displayName` `'복냥사주' → '복냥사주&타로'` 변경 필요.

---

## Analytics 이벤트 명명 + 파라미터

| Option | Description | Selected |
|--------|-------------|----------|
| (A) v1.0 컨벤션 동일 (`tarot_view`, `card_drawn`, `card_shared`) | 일관성 | ✓ |
| (B) 명시적 prefix (`tarot.view`, `tarot.card_drawn`, ...) | 점 구분 | |
| (C) 짧은 이름 (`view`, `draw`, `share`) | 간결 | |

**User's choice:** A
**Notes:** v1.0 의 `logEvent("share_click")`, `logEvent("follow_up_question", {...})` 패턴과 일치. 파라미터: `tarot_view: { already_drawn }`, `card_drawn: { card_id, slot }`, `card_shared: { card_id, with_link }`.

---

## Claude's Discretion

- `tarot_view` 이벤트 발화 위치 (Loader 표시 중 vs intro 표시 후) — useEffect 마지막 단계가 자연스러움
- `share_attempted` 사전 이벤트 추가 여부 — 본 페이즈 미포함, ANL-03 1종만
- 헤드라인 마커 (`[복냥타로]` 대괄호 vs 다른 마커)

## Deferred Ideas

- 카드별 22종 다른 OG 이미지 → v1.2 후보
- 공유받은 사람에게 보낸 사람 카드 미리보기 표시 → v1.2 후보
- `share_attempted` 사전 이벤트 → 출시 후 데이터 보고 결정
- `navigator.share` / clipboard 폴백 → v1.0 패턴(silent)과 일관성 유지
- 공유 후 토스트 노출 → v1.0 패턴 일관성 유지
- Toss 콘솔 등록명/아이콘 변경 → 코드 외 사용자 작업 (출시 게이팅)
