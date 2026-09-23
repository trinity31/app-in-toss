# Existing validation issues

`npm run lint` reports 13 errors and 11 warnings in existing unrelated files: `reference/생년월일입력페이지.js`, `BirthdateInput.jsx`, `Intro.jsx`, `Loading.jsx`, `Result.jsx`, `UserInfoInput.jsx`, `useAnonymousKey.jsx`, `useSession.jsx`, `useToast.jsx`, `AmuletPage.jsx`, `HomePage.jsx`, `NewYearPage.jsx`, `SajuPage.jsx`, and `utils/markdown.jsx`. All files changed by this task pass targeted ESLint without warnings.

The installed existing lockfile reports dependency audit findings and an engine warning for `@apps-in-toss/ait-format` requiring Node >=24 while this environment runs Node 22.22.3. The AIT build nonetheless succeeds. Dependency upgrades are outside this task; no package manifests or lockfiles were changed.
