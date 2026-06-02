---
phase: quick-260602-mou
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/TabBar.jsx
  - src/pages/HomePage.jsx
autonomous: false
requirements:
  - QUICK-MOU-01
user_setup: []

must_haves:
  truths:
    - "탭바가 화면 좌우 가장자리에서 떨어진 둥근 알약(pill) 형태로 떠 있다 (엣지-투-엣지 풀폭 아님)"
    - "탭바는 하단 safe-area 위에 떠 있고 바닥에 밀착되지 않는다"
    - "borderTop이 제거되고 사방 그림자(elevation)로 분리된다"
    - "사주/타로 2탭, SajuIcon/TarotIcon, active(#64119F)/inactive(grey500), NEW 배지, 코치마크, D-05 라우트별 표시, D-10 즉시 전환이 그대로 동작한다"
    - "HomePage 콘텐츠 하단이 플로팅 바에 가리지 않을 만큼 패딩이 보정된다"
    - "코치마크(타로 탭 지시)와 NEW 배지가 좁아진 플로팅 바에서도 타로 탭을 정확히 가리킨다"
  artifacts:
    - path: "src/components/TabBar.jsx"
      provides: "플로팅 알약 형태의 하단 탭바"
      contains: "borderRadius"
    - path: "src/pages/HomePage.jsx"
      provides: "플로팅 바 높이 보정된 하단 패딩"
  key_links:
    - from: "src/components/TabBar.jsx navStyle"
      to: "토스 미니앱 브랜딩 가이드 플로팅 형태"
      via: "inset margin + borderRadius + box-shadow, borderTop 제거"
      pattern: "borderRadius"
---

<objective>
TabBar.jsx를 토스 미니앱 브랜딩 가이드가 요구하는 "플로팅 알약(pill)" 형태로 전환한다. 현재 풀폭 엣지-투-엣지 + borderTop 구성은 토스 기본 하단 탭과 형태가 겹쳐 가이드 위반이다. 좌우 가장자리에서 떨어진 둥근 카드로 하단 safe-area 위에 띄우고, borderTop을 제거하고 사방 그림자로 분리한다. 플로팅 바가 콘텐츠 위에 떠서 가리므로 HomePage 하단 패딩을 보정한다.

Purpose: 토스 인앱 디자인 일관성/심사 준수 + 기본 하단 탭과의 형태 충돌 제거.
Output: 플로팅 형태 TabBar.jsx + 하단 패딩 보정된 HomePage.jsx.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/TabBar.jsx
@src/pages/HomePage.jsx
@src/pages/TarotPage.jsx

<notes>
- 신규 의존성 금지 (D-08): 아이콘/CSS-in-JS/애니메이션 라이브러리 추가 금지. 기존 React inline style 유지.
- D-05 라우트별 표시(/, /tarot에서만 렌더), D-09 active 컬러(#64119F)/inactive(grey500) + 아이콘 fill/stroke, D-10 즉시 전환(CSS transition·애니메이션 미사용)은 그대로 보존.
- 현재 코치마크 컨테이너는 `<nav>`(곧 pill)에 대해 absolute, `left:75%`. NEW 배지는 아이콘 래퍼에 대해 absolute. 둘 다 탭 레이아웃(`<ul>` 내부 2개 균등 flex:1)에 묶여 있어 pill 폭이 줄어도 75% = 타로 탭 중심은 유지된다 — 코드 변경 불필요하나 시각 검증으로 재확인.
- TarotPage TarotIntro(line 326)는 이미 `calc(110px + env(safe-area-inset-bottom))` 하단 패딩 보유 → 플로팅 전환 후 시각 점검만(이번 작업에서 코드 수정 대상 아님). TarotPage 로딩/에러 상태는 중앙 정렬이라 가림 무관.
</notes>

<floating_spec>
가이드 이미지 기준 시각 스펙(직접 구현):
- 좌우 inset: 화면 가장자리에서 떨어뜨림 (예: left/right 16px 여백).
- 바닥에서 띄움: bottom = `calc(env(safe-area-inset-bottom) + 12px)` 수준 (바닥 밀착 아님).
- 큰 border-radius: 알약 느낌 (예: 24px 이상).
- 사방 elevation: `box-shadow: 0 4px 20px rgba(0,0,0,0.12)` 수준의 부드러운 그림자.
- borderTop 제거.
- 배경 흰색 유지, zIndex 유지(20).
- 좌우 inset이 생겼으므로 기존 `paddingBottom` 안의 safe-area 처리는 bottom 위치 계산으로 이동. pill 내부 상하 패딩은 적당히(예: paddingTop 8, paddingBottom 8) — safe-area는 더 이상 pill 내부가 아닌 bottom offset이 흡수.
</floating_spec>
</context>

<tasks>

<task type="auto">
  <name>Task 1: TabBar navStyle을 플로팅 알약 형태로 전환</name>
  <files>src/components/TabBar.jsx</files>
  <action>
navStyle을 풀폭 고정 바에서 플로팅 pill로 변경한다 (가이드 준수, QUICK-MOU-01):
- `left: 0; right: 0; bottom: 0` 제거하고, 좌우 inset 여백(예: left/right 16px)과 바닥 띄움(`bottom: 'calc(env(safe-area-inset-bottom) + 12px)'`)으로 교체.
- `borderTop` 제거.
- `borderRadius` 추가(알약 느낌, 예 24px 이상).
- `boxShadow`를 사방 elevation으로 교체(예 `0 4px 20px rgba(0,0,0,0.12)`).
- `position: 'fixed'`, `zIndex: 20`, `background: '#ffffff'` 유지.
- 기존 `paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)'`는 bottom offset으로 옮겼으므로 pill 내부는 일반 상하 패딩(예 paddingTop 8, paddingBottom 8)으로 조정 — safe-area를 pill 내부에서 중복 적용하지 말 것.
- TABS/아이콘/active·inactive 컬러/NEW 배지/코치마크/D-05 라우트 가드/D-10(transition 미사용) 로직은 일절 변경하지 않는다.
- 코치마크 `left: '75%'`와 NEW 배지 배치는 탭 레이아웃에 묶여 있어 pill 폭 축소와 무관하게 타로 탭 중심을 유지하므로 그대로 둔다(시각 검증은 Task 3).
신규 import·라이브러리 추가 금지(D-08). colors 토큰은 기존대로 사용 가능.
  </action>
  <verify>
    <automated>cd /Users/trinity/Projects/app-in-toss/fortune-cat && node -e "const s=require('fs').readFileSync('src/components/TabBar.jsx','utf8'); const i=s.indexOf('const navStyle'); const body=s.slice(i, s.indexOf('}', i)); if(!/borderRadius/.test(body)) throw new Error('no borderRadius'); if(/borderTop/.test(body)) throw new Error('borderTop still present'); if(/left:\s*0/.test(body)||/right:\s*0/.test(body)) throw new Error('still edge-to-edge'); console.log('OK')"</automated>
  </verify>
  <done>navStyle에 borderRadius·사방 box-shadow·좌우 inset·바닥 띄움이 적용되고 borderTop과 left:0/right:0이 제거됨. TABS·아이콘·컬러·NEW·코치마크·라우트 가드 로직 미변경.</done>
</task>

<task type="auto">
  <name>Task 2: HomePage 하단 패딩을 플로팅 바 높이만큼 보정</name>
  <files>src/pages/HomePage.jsx</files>
  <action>
styles.container의 `padding: "0 20px 20px"`에서 하단 값을 플로팅 바가 콘텐츠를 가리지 않도록 보정한다 (QUICK-MOU-01):
- 하단 패딩을 `calc(96px + env(safe-area-inset-bottom))` 수준으로 변경 (좌우 20px·상단 0은 유지). 즉 `padding: "0 20px calc(96px + env(safe-area-inset-bottom))"`.
- 96px는 pill 높이(약 70~74px hit area) + 바닥 띄움(약 12px) + 여유의 합산 근사치 — 정확한 수치는 Task 3 시각 검증에서 미세 조정.
- 다른 styles 항목은 수정하지 않는다.
  </action>
  <verify>
    <automated>cd /Users/trinity/Projects/app-in-toss/fortune-cat && node -e "const s=require('fs').readFileSync('src/pages/HomePage.jsx','utf8'); if(!/padding:\s*[\"'\x60]0 20px calc\([^)]*safe-area-inset-bottom/.test(s)) throw new Error('container bottom padding not corrected'); console.log('OK')"</automated>
  </verify>
  <done>styles.container 하단 패딩이 `calc(96px + env(safe-area-inset-bottom))`로 보정됨. 좌우 20px·상단 0 유지, 다른 styles 미변경.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
TabBar.jsx를 플로팅 알약(pill) 형태로 전환(좌우 inset·바닥 띄움·둥근 모서리·사방 그림자·borderTop 제거)하고, HomePage 콘텐츠 하단 패딩을 플로팅 바 높이만큼 보정했다.
  </what-built>
  <how-to-verify>
토스 인앱(또는 dev WebView)에서 다음을 확인:
1. 사주 탭(`/`)에서 탭바가 화면 좌우 가장자리에서 떨어진 둥근 알약으로 바닥 위에 떠 있는가? (풀폭·바닥 밀착·상단 분리선이 없어야 함)
2. 타로 탭(`/tarot`)에서도 동일한 플로팅 형태이고, TarotIntro 콘텐츠가 바에 가리지 않는가?
3. 사주 탭 콘텐츠(HomePage) 최하단 요소가 플로팅 바에 가리지 않는가? 가린다면 Task 2의 96px를 키워 재확인.
4. 사주↔타로 전환이 즉시(애니메이션 없이) 되는가? (D-10)
5. active 탭은 보라색(#64119F)+아이콘 채움, inactive는 회색인가? (D-09)
6. NEW 배지가 여전히 타로 탭 아이콘 우상단에 정확히 붙는가?
7. NEW 윈도우(첫 진입 3일) 안이면 사주 탭에서 뜨는 코치마크 풍선·화살표가 좁아진 pill에서도 타로 탭(우측 탭)을 정확히 가리키는가? 어긋나면 보고.
8. /saju·/newyear·/amulet 진입 시 탭바가 보이지 않는가? (D-05)
  </how-to-verify>
  <resume-signal>"approved" 입력 또는 어긋난 항목(특히 3·7) 보고</resume-signal>
</task>

</tasks>

<verification>
- Task 1·2 automated grep 게이트 통과.
- 코치마크 left:75% / NEW 배지 위치는 코드 미변경 → 시각 검증(Task 3 항목 6·7)으로 회귀 없음 확인.
- 기존 기능(2탭·아이콘·컬러·라우트 가드·즉시 전환) 보존 — Task 3 항목 1·4·5·8.
</verification>

<success_criteria>
- 탭바가 좌우 inset·바닥 띄움·둥근 모서리·사방 그림자의 플로팅 pill로 렌더되고 borderTop·풀폭이 제거됨.
- HomePage 콘텐츠가 플로팅 바에 가리지 않음.
- 사주/타로 2탭, active/inactive 컬러, NEW 배지, 코치마크 위치, D-05 라우트 표시, D-10 즉시 전환이 회귀 없이 동작.
- 신규 의존성 0 (D-08 준수).
</success_criteria>

<output>
Create `.planning/quick/260602-mou-tabbar-jsx/260602-mou-SUMMARY.md` when done
</output>
