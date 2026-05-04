---
type: seed
created: 2026-05-04
trigger: v1.2 마일스톤 시작 시점 (또는 v1.1 출시 후 share/저장 사용자 요청 누적 시)
status: parked
related_requirements: [TAROT-SAVE-01 (신규 후보)]
priority: medium (UX 보강 — 핵심 가치 외)
---

# 타로 카드 이미지 디바이스 저장

## 아이디어 (한 줄)
데일리 원카드 결과 화면(또는 확대 모달)에서 "저장" 버튼으로 카드 이미지를 사용자 디바이스 갤러리에 저장한다.

## 사용자 가치
- **소장 욕구:** 4050 여성 사용자가 마음에 드는 카드/해석을 캡처하지 않고 한 번에 저장
- **외부 공유 보강:** 토스 공유 시트(SHARE-01)는 텍스트 + 토스 링크 위주 — 이미지 자체를 카카오톡/인스타에 직접 올리고 싶을 때 디바이스 저장이 한 단계 더 자연스러움
- **22장 컬렉션 메타게임(seed: 22-card-collection-meta-game.md)과 시너지:** 수집한 카드를 디바이스에도 보존

## v1.1 에 포함시키지 않은 이유
1. **핵심 가치는 공유**: PROJECT.md "편하게 보는 정확한 사주" + v1.1 milestone goal "재방문·체류" 에 직접 기여 도가 SHARE-01 대비 낮음. 디바이스 스크린샷으로 대체 가능.
2. **출시 속도 우선**: v1.1은 "정착 우선" 기조. SHARE-01 까지가 출시 게이트.
3. **데이터 보고 결정**: card_drawn vs card_shared 비율, 사용자 피드백(저장 요청 빈도)을 v1.1 출시 후 측정해서 v1.2 우선순위 결정.

## 사용자 가치 vs v1.0 패턴 차이

v1.0 사주 결과(`Result.jsx:37 handleSaveImage`) 는 AI가 생성한 룩북형 결과 이미지를 `image_base64` 로 직접 받아 `saveBase64Data` 로 저장. 타로는 Supabase Storage 의 정적 webp URL이라 한 단계 변환 필요.

## 구현 영향 범위 (대략)

### 옵션 A: URL → fetch → Blob → base64 변환 (v1.0 패턴 재사용)
```js
async function saveTarotCardImage(cardId, cardName) {
  const url = getCardImageUrl(cardId);
  const blob = await fetch(url).then((r) => r.blob());
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
  await saveBase64Data({
    data: base64,
    fileName: `boknyang-tarot-${cardName}-${Date.now()}.webp`,
    mimeType: 'image/webp',
  });
}
```
- 장점: v1.0 패턴 재사용, 새 의존성 0
- 단점: webp 포맷이 일부 갤러리 앱에서 표시 미지원 가능 → png 변환 검토 (canvas 렌더링)

### 옵션 B: 카드 + 해석 텍스트 합성 이미지 (Canvas)
- 카드 이미지 + 카드 이름 + 해석 본문 + "복냥타로" 워터마크 합성 → png base64 → saveBase64Data
- 장점: 공유 가치 높음 (이미지 한 장으로 컨텍스트 완결)
- 단점: Canvas 렌더링 분량 증가, 신규 의존성 후보 (html2canvas vs raw canvas API)

### UI
- 확대 모달 (260504-gbj 추가분) 우하단에 "저장" 버튼 추가 — 카드 이미지에 시각적으로 인접
- 또는 결과 화면 하단 액션 영역에 "저장" 추가 (처음으로 / 공유하기 / 저장 3-버튼)
- 4050 사용자: 명확한 라벨 + 큰 hit area + 저장 완료 토스트

### 분석
- `card_saved` 이벤트 (card_id) — share 비율과 비교해 retention 후크로서의 가치 측정
- ANL-04 후보로 추가

### 권한 / 플랫폼
- AIT WebView: `saveBase64Data` 가 토스 web-framework에서 디바이스 갤러리 권한 처리. v1.0 흐름에서 검증됨
- dev 일반 브라우저: graceful degradation (다운로드 링크 또는 toast 안내)

## 결정 보류 사항 (v1.2 시점 재검토)
- **포맷:** webp 그대로 vs png 변환 vs Canvas 합성 (이미지+텍스트)
- **위치:** 결과 화면 액션 vs 확대 모달 액션 vs 둘 다
- **분석 이벤트:** card_saved 추가 여부 + 메타 (card_id, format, source: result|modal)
- **22장 컬렉션 시드와의 통합:** 컬렉션 미완성 카드는 "수집 후 저장 가능" gating?

## 메모 (2026-05-04 사용자 질의)
- 사용자가 quick-260504-gbj (확대 모달 추가) 작업 중 이미지 저장 기능 부재를 인지하고 v1.1 vs v1.2 배치 선택 요청. **결정: B 옵션 — v1.2 후보로 parking, v1.1 출시 후 사용자 행동 데이터 보고 우선순위 재검토.**
