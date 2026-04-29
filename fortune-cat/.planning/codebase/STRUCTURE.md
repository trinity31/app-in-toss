# STRUCTURE

복냥사주 (Fortune Cat) 프로젝트의 디렉토리 레이아웃과 파일 조직 가이드.

## Top-level Layout

```
fortune-cat/
├── src/                  # 모든 React 애플리케이션 소스
├── public/               # 정적 자산 (Vite가 그대로 서빙)
│   └── images/
├── scripts/              # Supabase 마이그레이션 SQL
├── reference/            # 과거 구현 참고용 코드 (사용 안 함, 보관용)
├── SAJU_API_GUIDE/       # 외부 사주 API 통합 문서
├── dist/                 # 빌드 산출물 (gitignored)
├── .granite/             # Granite/AIT 빌드 설정
├── .planning/            # GSD 플래닝 워크스페이스
├── granite.config.ts     # Apps-in-Toss 앱 메타데이터
├── vite.config.js        # Vite 빌드 설정
├── eslint.config.js      # ESLint Flat Config
├── index.html            # SPA 엔트리 HTML
├── package.json          # 의존성 및 스크립트
├── .env / .env.development / .env.production
└── fortune-cat.ait       # 빌드된 Apps-in-Toss 패키지
```

## src/ Layout

```
src/
├── main.jsx              # ReactDOM.createRoot 부트스트랩
├── App.jsx               # 라우터 + 전역 Provider 래핑
├── App.css               # 전역 컴포넌트 스타일
├── index.css             # 전역 리셋/유틸 스타일
├── pages/                # 라우트 페이지 컴포넌트 (4개)
│   ├── HomePage.jsx       # 메인 사주 입력/결과 흐름
│   ├── SajuPage.jsx       # 사주 단독 라우트
│   ├── NewYearPage.jsx    # 신년운세 라우트
│   └── AmuletPage.jsx     # 부적 구매 흐름
├── components/           # 재사용 UI/도메인 컴포넌트 (17개)
│   ├── Intro.jsx              # 시작 화면
│   ├── NameInput.jsx          # 이름 입력
│   ├── GenderSelect.jsx       # 성별 선택
│   ├── BirthdateInput.jsx     # 양력/음력 생년월일 입력
│   ├── UserInfoInput.jsx      # 통합 입력 폼
│   ├── FortuneTypeSelect.jsx  # 풀이 종류 선택
│   ├── PhotoUpload.jsx        # 사진 업로드 (룩북용)
│   ├── EmailInput.jsx         # 이메일 입력
│   ├── ContactInput.jsx       # 연락처 입력
│   ├── AmuletTypeSelect.jsx   # 부적 종류 선택
│   ├── AmuletPayment.jsx      # 토스 인앱결제
│   ├── AmuletResult.jsx       # 부적 결제 후 결과
│   ├── TossLogin.jsx          # 토스 로그인 연동
│   ├── Loading.jsx            # 일반 로딩
│   ├── DeepReadingLoading.jsx # 딥리딩 로딩 (광고 표시)
│   ├── Result.jsx             # 일반 풀이 결과
│   └── DeepReadingResult.jsx  # 딥리딩 결과
├── hooks/                # 커스텀 React 훅 (5개)
│   ├── useSession.jsx          # 세션 ID 발급/관리
│   ├── useAnonymousKey.jsx     # 토스 익명 식별키
│   ├── useToast.jsx            # 토스트 알림
│   ├── useUserInfoStorage.js   # 사용자 입력 로컬 저장
│   └── usePendingOrderStorage.js # 결제 진행 중 주문 저장
├── lib/                  # 외부 SDK 래퍼
│   ├── firebase.js            # Firebase Analytics 초기화
│   └── supabase.js            # Supabase 클라이언트
├── utils/                # 순수 변환/유틸
│   ├── dataTransform.js       # API 요청/응답 데이터 변환
│   └── markdown.jsx           # react-markdown 렌더 헬퍼
├── config/               # 런타임 설정
│   └── ads.js                 # 토스 광고 그룹 ID 매핑
└── assets/
    ├── images/                # 풀이 종류별 일러스트 (10+)
    └── react.svg
```

## Naming Conventions

### 파일명
- **컴포넌트:** `PascalCase.jsx` (예: `BirthdateInput.jsx`, `AmuletResult.jsx`)
- **훅:** `useXxx.jsx` 또는 `useXxx.js` — JSX를 반환하는 훅(Provider 포함)은 `.jsx`, 순수 로직은 `.js`
  - JSX 반환 예시: `src/hooks/useSession.jsx`, `src/hooks/useToast.jsx`
  - 로직 전용 예시: `src/hooks/useUserInfoStorage.js`, `src/hooks/usePendingOrderStorage.js`
- **유틸/라이브러리:** `camelCase.js` (예: `dataTransform.js`, `firebase.js`)
- **설정:** `camelCase.js` (예: `ads.js`)

### 변수/함수 (코드 내)
- **컴포넌트:** PascalCase
- **훅:** `use` 접두사 + camelCase
- **상수:** `UPPER_SNAKE_CASE` (광고 그룹 ID, fortune type key 등)
- **이벤트 핸들러:** `handleXxx` 또는 `onXxx`

## Page → Component Mapping

| 라우트 | 페이지 파일 | 주요 컴포넌트 |
|--------|-------------|----------------|
| `/` | `src/pages/HomePage.jsx` | `Intro`, `UserInfoInput`, `FortuneTypeSelect`, `Loading`, `DeepReadingLoading`, `Result`, `DeepReadingResult` |
| `/saju` | `src/pages/SajuPage.jsx` | (HomePage 변형) |
| `/new-year` | `src/pages/NewYearPage.jsx` | (신년운세 전용 흐름) |
| `/amulet` | `src/pages/AmuletPage.jsx` | `AmuletTypeSelect`, `AmuletPayment`, `AmuletResult`, `EmailInput`, `ContactInput` |

라우트 정의는 `src/App.jsx`에서 `react-router-dom` `<BrowserRouter>` + `<Routes>` 형태로 선언.

## Key Locations 빠른 참조

| 알고 싶은 것 | 보러 갈 곳 |
|--------------|-----------|
| 라우트 추가 | `src/App.jsx` |
| 사주 API 호출 | `src/utils/dataTransform.js`, `SAJU_API_GUIDE/DEEP_READING_API_GUIDE.md` |
| Supabase 쿼리 | `src/lib/supabase.js` 및 `src/components/AmuletPayment.jsx` |
| Firebase Analytics 이벤트 | `src/lib/firebase.js`, 컴포넌트에서 `logEvent` 호출 |
| 토스 인앱결제 | `src/components/AmuletPayment.jsx` |
| 광고 그룹 ID | `src/config/ads.js` |
| 사용자 식별 | `src/hooks/useAnonymousKey.jsx` (`getAnonymousKey`) |
| 결제 진행 중 상태 복구 | `src/hooks/usePendingOrderStorage.js` |
| Supabase 스키마 | `scripts/*.sql` |
| 환경 변수 | `.env`, `.env.development`, `.env.production` (모두 `VITE_` 접두사) |

## File Naming Notes

- 일부 파일 권한이 600 (예: `src/components/BirthdateInput.jsx`, `GenderSelect.jsx`, `NameInput.jsx`, `UserInfoInput.jsx`, `src/utils/dataTransform.js`) — 다른 사용자 읽기 차단. macOS 작업환경에서 발생한 우연으로 보이며, 기능에는 영향 없음.
- `.DS_Store` 파일이 일부 디렉토리에 존재 (macOS 산물). `.gitignore`에 등재 권장.
- `pnpm-lock.yaml`과 `package-lock.json`이 동시에 존재 — 패키지 매니저가 혼재되어 있어 통일 필요.

## Granite/AIT 산출물

- `granite.config.ts`: Apps-in-Toss 앱 메타 (앱 ID, 권한 등)
- `.granite/app.json`: Granite 빌드 캐시
- `fortune-cat.ait`: `ait build`로 생성되는 배포 패키지
- `dist/`: Vite 빌드 산출물 (AIT 빌드의 입력)
