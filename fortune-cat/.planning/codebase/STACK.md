# Technology Stack

**Analysis Date:** 2026-04-29

## Languages

**Primary:**
- JavaScript - Used for build and utility scripts
- JSX - React component files (`.jsx`)

**Secondary:**
- TypeScript - Configuration files (`.ts`)

## Runtime

**Environment:**
- Node.js (inferred from package.json, no specific version locked)

**Package Manager:**
- npm - Primary (package.json and package-lock.json present)
- pnpm - Also used (pnpm-lock.yaml present)

**Lockfile:**
- package-lock.json
- pnpm-lock.yaml

## Frameworks

**Core:**
- React 18.2.0 - UI framework
- React DOM 18.2.0 - React rendering
- React Router DOM 7.9.5 - Client-side routing

**UI/Design System:**
- @toss/tds-mobile 2.1.2 - Toss design system for mobile
- @toss/tds-mobile-ait 2.1.2 - Toss design system apps-in-toss variant
- @toss/tds-colors 0.1.0 - Color palette
- @emotion/react 11.14.0 - CSS-in-JS styling

**Build/Dev:**
- Vite 5.0.8 - Build tool and dev server
- @vitejs/plugin-react 4.2.1 - Vite React plugin

**Apps-in-Toss Framework:**
- @apps-in-toss/web-framework 2.4.5 - Bridge to native Toss features (IAP, GoogleAdMob, Analytics, Camera, Album)

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.86.0 - Database, storage, and debug logging
- firebase 12.8.0 - Analytics and crash reporting
- @sentry/react 10.33.0 - Error tracking and performance monitoring
- react-markdown 10.1.0 - Markdown rendering for results

**Infrastructure:**
- eslint 9.25.0 - Code linting
- eslint-plugin-react-hooks 5.2.0 - React hooks linting
- eslint-plugin-react-refresh 0.4.19 - React Fast Refresh linting
- @eslint/js 9.25.0 - JavaScript linting rules
- globals 16.0.0 - ESLint globals

## Configuration

**Environment:**
- Vite environment variables with `VITE_` prefix (required by Vite to expose to client)
- Separate `.env.development` and `.env.production` files
- Environment-specific API base URLs:
  - Development: `http://192.168.0.28:8000`
  - Production: `https://saju.trinity-apps.net`

**Required Environment Variables:**
- `VITE_API_BASE_URL` - Backend API endpoint
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `VITE_FIREBASE_MEASUREMENT_ID` - Firebase analytics measurement ID
- `VITE_SENTRY_DSN` - Sentry error tracking endpoint (optional, conditionally initialized)
- `VITE_AD_GROUP_ID` - Google AdMob ad group identifier
- `VITE_AMULET_PRODUCT_SKU` - In-app purchase product SKU (referenced but not visible in main config)
- `VITE_SAJU_AI_API_KEY` - External AI API key for deep reading

**Build:**
- `vite.config.js` - Vite configuration with React plugin, terser minification, console removal
- `granite.config.ts` - Apps-in-Toss framework configuration (app metadata, permissions, dev server)
- `eslint.config.js` - ESLint configuration for JavaScript/JSX linting

## Platform Requirements

**Development:**
- Node.js runtime
- npm or pnpm package manager
- Camera and photo album permissions (configured in `granite.config.ts`)

**Production:**
- Deployed as Toss in-app web view (Apps-in-Toss platform)
- Browser environment with ES2020+ support
- Access to native APIs: IAP (in-app purchase), GoogleAdMob, Camera, Album, Analytics

**Build Output:**
- Location: `dist/` directory
- Artifact: Static JavaScript bundle minified with Terser (console/debugger removed)
- Built to: `fortune-cat.ait` (Apps-in-Toss format)

---

*Stack analysis: 2026-04-29*
