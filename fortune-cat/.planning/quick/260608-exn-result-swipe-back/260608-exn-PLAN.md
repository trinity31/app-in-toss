---
phase: quick-260608-exn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/useBlockSwipeBack.js
  - src/components/Result.jsx
autonomous: true
requirements:
  - QUICK-EXN-01
user_setup: []
---

<objective>
사주풀이 결과 화면(Result.jsx)에서 좌측 엣지 스와이프(뒤로가기 제스처)를 하면 풀이가
유실되는 문제를 수정한다. 결과 단계는 라우트가 아니라 페이지 내부 state(currentPage)로
관리되는데, 토스 WebView의 좌측 엣지 스와이프가 브라우저 popstate(history back)를 일으키면
/saju 라우트 자체를 빠져나가 결과 화면이 사라진다. 결과 화면에서는 스와이프 뒤로가기
이벤트를 무력화해 풀이를 계속 볼 수 있게 한다.

Purpose: 결과 화면 이탈로 인한 풀이 유실 방지 (Core Value "편하게 보는 정확한 사주" 보호).
Output: 재사용 가능한 useBlockSwipeBack 훅 + Result.jsx 적용.
</objective>

<context>
- 앱에는 스와이프/popstate를 처리하는 코드가 없었음 (main.jsx에서 init state 1개만 push).
- 결과 화면들(Result/DeepReadingResult/AmuletResult)이 동일한 잠재 이슈를 가지나, 이번 작업은
  명시된 "사주풀이 결과 화면"(Result.jsx)에 한정한다. 훅은 재사용 가능하게 작성해 다른
  결과 화면도 필요 시 동일하게 적용 가능.
</context>

<tasks>

<task type="auto">
  <name>Task 1: useBlockSwipeBack 훅 추가</name>
  <files>src/hooks/useBlockSwipeBack.js</files>
  <action>
마운트 시 더미 history 엔트리를 push 하고, popstate 발생 시마다 같은 화면을 다시 push 해
스와이프 뒤로가기를 무력화하는 재사용 훅을 추가한다. enabled 인자로 활성 제어.
언마운트 시 popstate 리스너 제거.
  </action>
  <done>훅이 popstate를 가로채 현재 화면을 다시 push 하고, 리스너를 정리한다.</done>
</task>

<task type="auto">
  <name>Task 2: Result.jsx에 훅 적용</name>
  <files>src/components/Result.jsx</files>
  <action>
useBlockSwipeBack 를 import 하고 컴포넌트 상단에서 호출한다. Result는 currentPage==='result'
일 때만 마운트되므로 결과 화면에서만 자연히 활성화된다.
  </action>
  <done>결과 화면에서 스와이프 뒤로가기가 더 이상 라우트를 이탈시키지 않는다.</done>
</task>

</tasks>

<success_criteria>
- 결과 화면에서 좌측 엣지 스와이프 시 풀이가 유지된다.
- vite build 통과, 신규 의존성 0.
- "처음부터 다시하기" 버튼(onRestart)으로 정상적으로 화면을 벗어날 수 있다.
</success_criteria>

<output>
Create `.planning/quick/260608-exn-result-swipe-back/260608-exn-SUMMARY.md` when done
</output>
