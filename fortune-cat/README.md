## 앱인토스 SDK 3 빌드

Node.js 24 이상이 필요합니다. `.nvmrc`를 적용한 뒤 빌드하세요.

```sh
nvm install
nvm use
npm ci
npm run build
```

빌드는 `fortune-cat.ait`를 생성하며 배포하지 않습니다. 설정 파일은 `apps-in-toss.config.ts`입니다.
SDK 3 출시 전 백엔드에서 `https://fortune-cat.web.tossmini.com`과 `https://fortune-cat.private-web.tossmini.com`을 허용해야 합니다. 콘솔 QR 테스트를 마친 뒤 출시하세요. SDK 3으로 출시하면 SDK 2로 롤백할 수 없습니다.
[공식 마이그레이션 안내](https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x)

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



## 토스 인앱결제 테스트
### 자동 복원 비활성화
window.skipAutoRestore()