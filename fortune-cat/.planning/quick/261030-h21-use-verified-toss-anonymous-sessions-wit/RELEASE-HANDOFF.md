# 최신 토스 앱 빌드 인계

신규 사용자를 포함해 **기존 계정 연결 버튼은 기본으로 표시하지 않습니다.** 연결되지 않은 빈 보관함에서 사용자가 **보관함 도움말**을 직접 열었을 때만 복구 기능을 표시합니다. 기존 기록이 있거나 이미 연결된 계정은 도움말도 숨깁니다. 로딩·오류·소유자 변경 중에는 복구 기능을 표시하지 않으며, 자동 로그인/OAuth 호출은 추가하지 않았습니다.

- 업로드할 파일: `/Users/trinity/Projects/app-in-toss/fortune-cat/fortune-cat.ait`
- SHA256: `86a3b29f866792fbc7b4d9ed403608371d21f913f1f9331ac75f3e8cf6b4f476`
- 크기: 3,662,294 bytes
- 이전 파일 백업: `/Users/trinity/Downloads/catbot-release-backups/fortune-cat-before-anonymous-8eefc1530e2d.ait`
- Manifest/검사 결과: `/Users/trinity/Downloads/catbot-release-backups/anonymous-release-86a3b29f8667-SOURCE-MANIFEST.json`, 같은 이름의 `ARTIFACT-VERIFICATION.json`

Node174개, 실제 사주·타로·복구 도움말 컴포넌트 Chromium/WebKit46개 통과. 신규 기본 화면에서 복구 UI 없음, 도움말 키보드 열기/닫기, 명시적 복구, 기록·연결 여부·오류·소유자 전환 및 같은 계정 갱신을 확인했습니다. 도움말 자동 열기 변형 테스트는 회귀를 잡았고 원래 접힌 상태로 복원했습니다.

실제 공개 운영 설정으로 깨끗한 Node24 Vite+AIT 빌드 성공. 원래 사용자 Tarot runtime 미커밋 변경은 보존하고 빌드에서 제외했습니다. 공식 AIT reader20개 파일을 검사해 native 인증과 도움말 코드 포함, 비밀정보/MOCK 실행 코드0건을 확인했습니다. 업로드·배포·커밋·키 변경·운영 호출은 하지 않았습니다.

이번 수정은 앱 UI만 바꿉니다. 추가 SQL/서버 환경변수는 없습니다. 기존 익명 인증 백엔드의 resolver SQL·전용 secret·백엔드 배포 준비는 그대로 필요하며, 이미 적용했다면 반복할 필요 없습니다. 이 작업에서 운영 적용 상태를 재확인하지 않았습니다.

다음 수동 확인: 새 AIT를 토스에 직접 업로드해 신규 계정의 기본 보관함에 연결 버튼/로그인 안내가 없고, 필요한 사람이 도움말을 직접 열어 복구할 수 있는지 확인하세요.
