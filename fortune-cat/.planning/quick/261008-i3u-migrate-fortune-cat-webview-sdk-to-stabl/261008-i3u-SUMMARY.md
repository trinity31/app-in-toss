---
status: complete
---
# Quick Task 261008-i3u

- Migrated with the official v3 CLI to SDK 3.7.0, TDS mobile/mobile-ait 2.4.1, and devtools 3.7.0.
- Replaced granite.config.ts with apps-in-toss.config.ts; preserved navigation buttons, primary color, camera and photo permissions. Migrated dev/build scripts and Vite devtools plugin.
- Node >=24 is required by ait-format; updated .nvmrc and engines. Build used Node 24.21.0.
- npm and pnpm locks updated. Unrelated direct dependency versions unchanged within each lock.
- Code commit: 4078b0e.

## Validation

- 38 scoped login, purchase recovery, and deep-reading message tests passed.
- Production Vite + AIT build passed. Artifact fortune-cat.ait: 3,213,374 bytes; SDK metadata and bundle.json both 3.7.0.
- Artifact includes https://saju.trinity-apps.net, excludes http://192.168.35.64:8000.
- No persistent dev server, deployment, or push. Console QR/native-device validation remains before release.
- Existing production audit findings: 2 moderate, 4 high, 2 critical. All high/critical packages retain pre-migration versions; no broad dependency upgrades attempted.

## Release prerequisites

Deploy the backend CORS change for fortune-cat.web.tossmini.com and fortune-cat.private-web.tossmini.com before SDK 3 release. SDK 3 cannot roll back to SDK 2 after release. SDK >=3.1.1 preserves prior localStorage origin; selected 3.7.0 meets this requirement.

Official guide: https://developers-apps-in-toss.toss.im/documentation/integration/sdk-3.x
