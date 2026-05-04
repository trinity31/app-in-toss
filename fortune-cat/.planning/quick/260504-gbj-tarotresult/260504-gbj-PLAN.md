---
phase: quick-260504-gbj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/TarotResult.jsx
autonomous: true
requirements:
  - UAT-260504-GBJ-01  # 하단 버튼 여백 확대
  - UAT-260504-GBJ-02  # 카드 이미지 확대 모달

must_haves:
  truths:
    - "결과 화면 하단 fixed 버튼 영역과 탭바 사이 시각 여백이 확장되어 보라색 공유하기 버튼 그림자가 탭바 윗선과 닿지 않는다"
    - "결과 화면의 카드 이미지를 탭하면 큰 카드 이미지가 모달로 노출된다"
    - "모달은 우상단 x 버튼 클릭으로 닫힌다"
    - "모달은 백드롭(어두운 배경) 클릭으로 닫힌다"
    - "모달은 ESC 키 입력으로 닫힌다"
    - "모달이 열린 동안 카드 이름이 aria-labelledby로 연결된 dialog 로 인식된다"
    - "기존 결과 화면 자동 카드 플립(0.9s rotateY) 동작은 모달 추가 후에도 보존된다"
    - "처음으로 / 공유하기 버튼 동작은 모달 추가 후에도 그대로 동작한다"
  artifacts:
    - path: "src/components/TarotResult.jsx"
      provides: "하단 여백 20px + 카드 확대 모달 (state, 트리거, 백드롭, x버튼, ESC, 포커스 관리)"
      contains: "isZoomed"
  key_links:
    - from: "TarotResult 카드 이미지 컨테이너 (perspective wrapper 또는 그 내부)"
      to: "setIsZoomed(true)"
      via: "onClick 핸들러"
      pattern: "setIsZoomed\\(true\\)"
    - from: "모달 백드롭"
      to: "setIsZoomed(false)"
      via: "onClick (이벤트 타겟이 백드롭 자신일 때만)"
      pattern: "setIsZoomed\\(false\\)"
    - from: "ESC keyup"
      to: "setIsZoomed(false)"
      via: "useEffect window keydown listener (isZoomed=true 일 때만 등록)"
      pattern: "Escape"
---

<objective>
TarotResult 결과 화면 UAT 피드백 2건을 한 plan 안에서 atomic commit 2개로 처리한다.

Purpose:
- 4050 여성 사용자 hit area 안전성 + 시각 분리감 확보 (Task A)
- 카드 이미지를 더 크게 보고 싶다는 UX 요구 충족 + 접근성 보장 모달 패턴 정착 (Task B)

Output:
- src/components/TarotResult.jsx 1라인 수정 (Task A)
- src/components/TarotResult.jsx 인라인 모달 추가 (Task B, 100줄 미만 추가)
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@src/components/TarotResult.jsx
@src/components/TarotCardArt.jsx
@src/components/TabBar.jsx

<interfaces>
<!-- 재사용 컴포넌트 시그니처 — 코드 탐색 없이 그대로 사용 -->

From src/components/TarotCardArt.jsx:
```jsx
export default function TarotCardArt({
  emoji = '🌟',
  nameEn,
  image,        // webp 정적 import URL
  faceUp = true,
  size = 'md',  // 'sm' | 'md' | 'lg' — lg = 200x300, framed lg = 220x320
  framed = false,
});
```

From src/assets/images/cards (사용 패턴, TarotResult 기존 import):
```jsx
import { getCardImageUrl } from '../assets/images/cards';
const url = getCardImageUrl(card.id);
```

TarotResult 의 card prop 형태 (기존 코드에서 사용 중):
- card.id, card.name_ko, card.name_en, card.emoji, card.keywords[], card.message

TabBar 높이 (참고용 — Task A 산정 근거):
- minHeight 64px + paddingTop 4 + paddingBottom env(safe-area-inset-bottom)+8
- 기존 TarotResult 의 `bottom: calc(72px + safe + 8px)` 의 72px = TabBar 시각 높이 가정
- 8px → 20px 변경 시에도 TabBar 가정값(72)은 변경하지 않음 (회귀 위험 0)
</interfaces>

<constraints>
- 신규 npm 의존성 0 (D-02 carry — 모달 라이브러리 미사용, 인라인 React 구현)
- TarotCardArt.jsx 수정 금지 (UAT 범위 밖)
- 처음으로/공유하기 버튼, 카드 chip, message 영역, 자동 카드 플립 로직 수정 금지
- 토스 디자인 시스템 컬러 토큰(@toss/tds-colors) import 추가는 허용하되, 기존 인라인 hex 패턴이면 그대로 유지 가능 (TarotResult.jsx 는 현재 토큰 import 없음 → 인라인 hex 유지)
- 모달은 별도 파일 분리 금지 — TarotResult.jsx 내부 인라인 (Phase 03 TarotIntro 패턴)
- daily lock 진입 (storage 로드 후 result 직진) 시에도 모달 트리거 정상 동작해야 함
</constraints>
</context>

<tasks>

<task type="auto">
  <name>Task A: 하단 fixed 버튼 영역 여백 8px → 20px</name>
  <files>src/components/TarotResult.jsx</files>
  <action>
TarotResult.jsx:181 의 `bottom: 'calc(72px + env(safe-area-inset-bottom) + 8px)'` 를
`bottom: 'calc(72px + env(safe-area-inset-bottom) + 20px)'` 로 변경한다.

변경 범위 단 1라인. 다른 어떤 코드도 수정하지 않는다 (CLAUDE.md 규칙 #2).

이유 주석은 추가하지 않는다 — git blame 으로 commit message 추적 가능 + 기존 컴포넌트 상단의 CONTEXT D-07 주석이 이미 영역 의미를 설명하고 있어 라인 노이즈만 늘어남.

변경 후 atomic commit:
```
git add src/components/TarotResult.jsx
git commit -m "fix(quick-260504-gbj): TarotResult 하단 버튼 여백 8px → 20px

UAT 피드백 — 보라색 공유하기 버튼 그림자가 탭바 윗선과 거의 닿아
시각 분리감 부족. 4050 사용자 hit area 안전성 + 분리감 확보."
```
  </action>
  <verify>
    <automated>grep -n "calc(72px + env(safe-area-inset-bottom) + 20px)" src/components/TarotResult.jsx | head -1</automated>
    <automated>grep -c "calc(72px + env(safe-area-inset-bottom) + 8px)" src/components/TarotResult.jsx | grep -q "^0$" && echo OK || echo "old value still present"</automated>
  </verify>
  <done>
- TarotResult.jsx:181 (또는 동일 의미 라인) 의 bottom 값이 +20px 로 변경됨
- 기존 +8px 값이 파일 내에 더 이상 존재하지 않음
- atomic commit 1개 생성 (`fix(quick-260504-gbj): ...`)
- 다른 파일/라인 변경 없음 (`git diff HEAD~1 --stat` → TarotResult.jsx 1 file, 1 insertion(+), 1 deletion(-))
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task B: 카드 이미지 확대 모달 추가 (트리거 + 백드롭/x버튼/ESC 닫기 + 접근성)</name>
  <files>src/components/TarotResult.jsx</files>
  <behavior>
- 카드 이미지 영역 클릭 → isZoomed=true → 모달 노출
- x 버튼 클릭 → isZoomed=false → 모달 사라짐
- 백드롭(모달 컨텐츠 외부) 클릭 → isZoomed=false
- 모달 열린 상태에서 ESC keydown → isZoomed=false
- 모달 열림 시 x 버튼에 focus
- 모달 열림 시 body scroll lock (`document.body.style.overflow = 'hidden'`), 닫힘 시 복원
- 카드 자동 플립 (350ms 후 setFlipped(true)) 은 영향 없이 동작
  </behavior>
  <action>
TarotResult.jsx 에 다음을 추가한다 (한 파일 안 인라인 — Phase 03 TarotIntro 패턴 따름):

1. import 보강:
   - `useEffect, useState` → `useEffect, useRef, useState` 로 확장 (모달 x 버튼 ref 용)

2. 컴포넌트 상단 state 추가:
   ```jsx
   const [isZoomed, setIsZoomed] = useState(false);
   const closeButtonRef = useRef(null);
   ```

3. 카드 이미지 컨테이너에 트리거 부착:
   - 기존 `<div style={{ marginTop: 16, perspective: 1200 }}>` 래퍼 또는 그 내부 transform wrapper 중,
     **사용자가 시각적으로 인지하는 카드 영역** 을 커버하는 가장 바깥(perspective 래퍼)에
     `role="button"`, `tabIndex={0}`, `aria-label="카드 확대 보기"`,
     `onClick={() => setIsZoomed(true)}`,
     `onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsZoomed(true); } }}`,
     `style` 에 `cursor: 'pointer'` 추가.
   - 자동 플립 transform 은 그대로 보존 — 트리거 핸들러는 외곽 래퍼에 두어 transform 충돌 회피.

4. ESC 닫기 + body scroll lock useEffect 추가:
   ```jsx
   useEffect(() => {
     if (!isZoomed) return;
     const onKey = (e) => { if (e.key === 'Escape') setIsZoomed(false); };
     window.addEventListener('keydown', onKey);
     const prevOverflow = document.body.style.overflow;
     document.body.style.overflow = 'hidden';
     // 다음 프레임에 x 버튼 포커스 (mount 직후 ref 보장)
     const t = setTimeout(() => closeButtonRef.current?.focus(), 0);
     return () => {
       window.removeEventListener('keydown', onKey);
       document.body.style.overflow = prevOverflow;
       clearTimeout(t);
     };
   }, [isZoomed]);
   ```

5. 모달 JSX 를 컴포넌트 return 의 최상위 div 닫기 직전(또는 fixed 액션 영역 다음)에 조건부 렌더:
   ```jsx
   {isZoomed && (
     <div
       role="dialog"
       aria-modal="true"
       aria-labelledby="tarot-zoom-title"
       onClick={(e) => { if (e.target === e.currentTarget) setIsZoomed(false); }}
       style={{
         position: 'fixed',
         inset: 0,
         zIndex: 100,
         background: 'rgba(0, 0, 0, 0.72)',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         padding: 24,
         animation: 'tarotZoomFade 200ms ease-out',
       }}
     >
       <h2 id="tarot-zoom-title" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
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
           maxWidth: 480,
           display: 'flex',
           justifyContent: 'center',
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
   )}
   ```

6. fade-in 200ms keyframe — TarotResult.jsx 내부에 `<style>` 태그를 두지 않고,
   기존 inline-style 컨벤션 유지를 위해 keyframe 대신 mount 시 opacity 전환을 inline 으로 처리한다.
   대안: isZoomed 가 true 가 된 직후 다음 frame 에 opacity 0 → 1 로 전환.
   간단화 — 별도 mounted state 없이, animation 속성을 빼고 즉시 표시 + 백드롭 자체가 충분히 어두워 fade 없이도 OK.
   → 최종 결정: animation 속성 제거. 200ms fade 는 nice-to-have, 필수 아님 (인라인 keyframe 추가 시 컨벤션 노이즈).

7. atomic commit:
   ```
   git add src/components/TarotResult.jsx
   git commit -m "feat(quick-260504-gbj): TarotResult 카드 이미지 확대 모달 추가

   카드 이미지 클릭 → 모달 노출. 닫기 트리거 3종(x 버튼/백드롭/ESC),
   role=dialog + aria-modal + aria-labelledby + body scroll lock + x 버튼 포커스.
   TarotCardArt 재사용 (size=lg framed). 신규 의존성 0, 별도 파일 분리 없이 인라인 구현."
   ```
  </action>
  <verify>
    <automated>grep -q "useState(false)" src/components/TarotResult.jsx && grep -q "isZoomed" src/components/TarotResult.jsx && echo OK</automated>
    <automated>grep -q 'role="dialog"' src/components/TarotResult.jsx && grep -q 'aria-modal="true"' src/components/TarotResult.jsx && grep -q 'aria-labelledby' src/components/TarotResult.jsx && echo OK</automated>
    <automated>grep -q 'aria-label="닫기"' src/components/TarotResult.jsx && grep -q 'aria-label="카드 확대 보기"' src/components/TarotResult.jsx && echo OK</automated>
    <automated>grep -q "Escape" src/components/TarotResult.jsx && grep -q "document.body.style.overflow" src/components/TarotResult.jsx && echo OK</automated>
    <automated>grep -q "closeButtonRef" src/components/TarotResult.jsx && grep -q "useRef" src/components/TarotResult.jsx && echo OK</automated>
    <automated>npm run lint 2>&1 | tail -20</automated>
    <automated>npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>
- isZoomed state + closeButtonRef + ESC/scroll lock useEffect 가 TarotResult.jsx 안에 존재
- 카드 이미지 외곽 래퍼에 onClick → setIsZoomed(true) + role/tabIndex/aria-label 부착
- 모달 JSX 가 role=dialog + aria-modal + aria-labelledby + 닫기 x 버튼 + 백드롭 클릭 닫기 패턴으로 구현됨
- TarotCardArt 가 size=lg framed 로 모달 안에서 재사용됨 (TarotCardArt 무수정)
- npm run lint, npm run build 통과
- atomic commit 1개 생성 (`feat(quick-260504-gbj): ...`)
- 변경된 파일은 TarotResult.jsx 단 1개 (`git diff HEAD~1 --stat` 확인)
  </done>
</task>

</tasks>

<verification>
- 수동 검증 (UAT):
  1. `/tarot` 진입 → 카드 뽑기 → 결과 화면 도달
  2. 화면 하단 처음으로/공유하기 버튼 그림자가 탭바 윗선과 명확히 분리되어 보임 (Task A)
  3. 결과 화면 카드 이미지 탭 → 큰 카드 이미지 모달 노출
  4. 우상단 x 버튼 탭 → 모달 닫힘
  5. 모달 다시 열기 → 카드 외곽(검은 배경) 탭 → 모달 닫힘
  6. (개발 환경 한정) 모달 다시 열기 → ESC 키 → 모달 닫힘
  7. 처음으로 / 공유하기 버튼 정상 동작 확인 (회귀 없음)
  8. 카드 자동 플립 (0.9s rotateY) 정상 동작 확인 (회귀 없음)
- 자동 검증: 위 task 별 grep + npm run lint + npm run build 통과

회귀 위험:
- Task A: 0 (1라인 시각 spacer 변경)
- Task B: 모달 z-index 100 — TabBar(z-index 20) 위, 다른 모달/오버레이가 결과 화면 동시 노출되지 않으므로 충돌 가능성 낮음. body scroll lock 은 닫힘 시 prevOverflow 로 정확히 복원.
</verification>

<success_criteria>
- [ ] TarotResult.jsx 의 fixed 액션 영역 bottom 값이 +20px 로 확장됨
- [ ] 카드 이미지 클릭 시 모달이 열리고 카드 큰 이미지가 노출됨
- [ ] x 버튼 / 백드롭 / ESC 3가지 방법으로 모달이 닫힘
- [ ] role="dialog" + aria-modal + aria-labelledby 가 모달 root 에 부착됨
- [ ] 모달 열림 시 x 버튼에 focus 이동, body scroll lock 적용, 닫힘 시 모두 복원
- [ ] TarotCardArt.jsx 무수정 (재사용만)
- [ ] 처음으로/공유하기 버튼, 카드 자동 플립, chip/message 영역 모두 회귀 없음
- [ ] atomic commit 2개 생성 (Task A → fix:, Task B → feat:)
- [ ] npm run lint, npm run build 통과
</success_criteria>

<output>
After completion:
- 2개의 atomic commit 이 main 에 추가됨
- STATE.md 의 "Quick Tasks Completed" 표에 새 행 추가:
  | 260504-gbj | TarotResult 하단 여백 확대 + 카드 확대 모달 | 2026-05-04 | (commit hash) | [260504-gbj-tarotresult](./quick/260504-gbj-tarotresult/) |
</output>
