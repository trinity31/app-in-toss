# TESTING

복냥사주 (Fortune Cat) 프로젝트의 테스트 전략 및 현재 상태.

## 현재 상태: 자동화 테스트 없음

이 프로젝트에는 **자동화된 테스트 코드가 존재하지 않습니다.**

### 검증 결과
- `*.test.*` / `*.spec.*` 파일: **0개**
- `__tests__` / `tests` / `test` 디렉토리: **없음**
- Jest, Vitest, Mocha, Playwright, Cypress 등 테스트 러너 의존성: `package.json`에 없음
- CI 파이프라인 (`.github/workflows`, `.gitlab-ci.yml`, etc.): **없음**

### `package.json` 테스트 스크립트
```json
"scripts": {
  "dev": "granite dev",
  "build": "ait build",
  "lint": "eslint .",
  "preview": "vite preview",
  "deploy": "ait deploy"
}
```
`test` 스크립트가 정의되어 있지 않습니다.

## 현재 활용 가능한 정적 검증

### ESLint
- 설정 파일: `eslint.config.js` (Flat Config)
- 룰셋: `@eslint/js` recommended + `eslint-plugin-react-hooks` recommended + `eslint-plugin-react-refresh`
- 실행: `pnpm lint` 또는 `npm run lint`
- 주요 룰:
  - `no-unused-vars` (대문자/언더스코어 시작 변수는 예외)
  - `react-hooks/rules-of-hooks`
  - `react-hooks/exhaustive-deps`
  - `react-refresh/only-export-components`

### Vite/Granite 빌드 검증
- `granite dev` — 개발 서버 (HMR + Apps-in-Toss 시뮬레이터)
- `ait build` — 프로덕션 빌드 (실패하면 타입/import 오류 노출)

### TypeScript
- 프로젝트는 **JavaScript/JSX**로 작성됨 (`.js`, `.jsx`)
- `@types/react`, `@types/react-dom`은 devDependency로 존재하지만 `tsconfig.json` 없음
- 컴파일 타임 타입 체크 없음

## 수동 QA 워크플로우

테스트 자동화가 부재하므로 다음 채널을 통해 검증이 이루어지는 것으로 추정:

1. **Granite Dev Server (`pnpm dev`)** — 로컬 개발 중 동작 확인
2. **AIT 시뮬레이터** — Apps-in-Toss 환경에서의 동작 검증
3. **Sentry (`@sentry/react`)** — 프로덕션 런타임 에러 모니터링 (`src/lib/`에 초기화 코드 위치 가능)
4. **Firebase Analytics** — 사용자 플로우 도달률 추적 (`src/lib/firebase.js`)
5. **딥리딩 사용자 행동 분석** — 최근 커밋 `976c7ec`에서 추가됨

## 권장 테스트 전략 (현재 미구현)

만약 테스트를 도입한다면 우선순위 제안:

### 1순위: 순수 로직 단위 테스트
- `src/utils/dataTransform.js` — 사주 API 요청/응답 변환 (가장 회귀 위험 높음)
- `src/utils/markdown.jsx` — 마크다운 렌더 헬퍼
- `src/config/ads.js` — 광고 그룹 ID 해석 로직

추천 도구: **Vitest** (Vite 프로젝트와 자연스럽게 통합)

### 2순위: 훅 테스트
- `src/hooks/useUserInfoStorage.js` — localStorage 직렬화/역직렬화
- `src/hooks/usePendingOrderStorage.js` — 결제 진행 중 주문 복구 로직 (실패 시 결제 분실 위험)

추천 도구: **Vitest + @testing-library/react** + happy-dom/jsdom

### 3순위: 결정적인 컴포넌트 통합 테스트
- `src/components/AmuletPayment.jsx` — 토스 인앱결제 플로우 (가장 비즈니스 임팩트 큼)
- `src/components/BirthdateInput.jsx` — 양력/음력 평달/윤달 변환 (최근 커밋 `dc48f57`에서 추가)

이들은 외부 SDK(`@apps-in-toss/web-framework`, Supabase) 의존도가 높아 mock 전략이 필요.

### 모킹이 필요한 외부 의존성
- `@apps-in-toss/web-framework` — 토스 인앱결제, 익명키, 광고
- `@supabase/supabase-js` — 부적 주문/조회
- `firebase` — Analytics 이벤트
- `@sentry/react` — 에러 리포트

## 테스트가 도입되어야 할 임계 영역

다음 영역은 회귀 시 사용자 영향이 크므로 테스트 부재가 큰 리스크:

| 영역 | 위치 | 리스크 |
|------|------|--------|
| 인앱결제 콜백 | `src/components/AmuletPayment.jsx` | 결제 완료 후 부적 미발급 |
| 음력→양력 변환 | `src/components/BirthdateInput.jsx` | 잘못된 사주 결과 |
| 결제 진행 중 복구 | `src/hooks/usePendingOrderStorage.js` | 결제 후 앱 재시작 시 주문 분실 |
| 사주 API 데이터 변환 | `src/utils/dataTransform.js` | API 응답 포맷 변경 시 결과 깨짐 |
| 익명키 발급 | `src/hooks/useAnonymousKey.jsx` | 사용자 식별 실패 → 분석/광고 측정 오류 |

## 요약

현 시점 테스트 전략은 **"빌드 + ESLint + Sentry 런타임 모니터링 + 수동 QA"** 조합. 자동화 테스트 도입은 미래 과제이며, 가장 먼저 손댈 영역은 `src/utils/dataTransform.js`와 `src/components/AmuletPayment.jsx` 인앱결제 흐름.
