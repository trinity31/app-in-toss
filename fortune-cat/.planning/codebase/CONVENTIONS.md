# Coding Conventions

**Analysis Date:** 2026-04-29

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `BirthdateInput.jsx`, `Loading.jsx`, `UserInfoInput.jsx`)
- Utility/helper files: camelCase (e.g., `dataTransform.js`, `firebase.js`, `supabase.js`)
- Hooks: camelCase with `use` prefix (e.g., `useSession.jsx`, `useToast.jsx`, `useAnonymousKey.jsx`)
- Config files: camelCase (e.g., `ads.js`)
- Pages: PascalCase (e.g., `HomePage.jsx`, `SajuPage.jsx`, `AmuletPage.jsx`)

**Functions:**
- Named exports: camelCase (e.g., `formatBirthdate`, `logEvent`, `getMenuImageUrl`)
- Default exports for components: PascalCase function names (e.g., `export default function BirthdateInput`)
- Custom hooks: camelCase with `use` prefix (e.g., `useSession()`, `useToast()`)
- Utility functions: camelCase (e.g., `formatBirthtime`, `base64ToBlob`, `normalizeMarkdown`)

**Variables:**
- State variables: camelCase (e.g., `year`, `month`, `day`, `birthdayType`)
- Constants: UPPER_SNAKE_CASE (e.g., `SESSION_ID_KEY`, `TEST_AD_GROUP_ID`, `USER_INFO_STORAGE_KEY`)
- Boolean variables: prefix with `is` or `has` (e.g., `isValid`, `isLeapMonth`, `hasError`, `adLoaded`)
- Refs: suffix with `Ref` (e.g., `yearRef`, `monthRef`, `cleanupRef`)

**Types/Objects:**
- Context objects: PascalCase suffix Context (e.g., `SessionContext`, `ToastContext`, `AnonymousKeyContext`)
- Provider components: PascalCase suffix Provider (e.g., `SessionProvider`, `ToastProvider`, `AnonymousKeyProvider`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier config not found)
- Indentation: 2 spaces observed throughout codebase
- Line length: No strict limit observed
- Quotes: Single quotes for strings (e.g., `import { useState } from 'react'`)

**Linting:**
- Tool: ESLint (config: `eslint.config.js`)
- Parser: `@eslint/js` with React Hooks and React Refresh plugins
- Key rules enforced:
  - `no-unused-vars`: error with varsIgnorePattern `^[A-Z_]` (allows unused PascalCase/UPPER_CASE variables)
  - `react-refresh/only-export-components`: warn (allows constant exports with `allowConstantExport: true`)
  - All recommended rules from `react-hooks` plugin
  - All recommended rules from `react-refresh` plugin

## Import Organization

**Order:**
1. React core imports: `import { useState, useEffect, ... } from 'react'`
2. React Router: `import { useNavigate, Route, Routes, ... } from 'react-router-dom'`
3. External libraries: `import * as Sentry from '@sentry/react'`, `import { colors } from '@toss/tds-colors'`
4. Internal utilities and hooks: `import { formatBirthdate } from '../utils/dataTransform'`, `import { useSession } from '../hooks/useSession'`
5. Assets: `import heroBackground from '../assets/images/hero.png'`
6. Styles: `import './App.css'`, `import './index.css'`

**Path Aliases:**
- No path aliases configured; relative paths used throughout
- Relative imports use `../` pattern to traverse directory structure

## Error Handling

**Patterns:**
- Try-catch blocks around async operations (e.g., `useUserInfoStorage.js` wraps `Storage.getItem()`)
- Console logging for errors: `console.error('[Module] Error message:', error)`
- Prefixed logging for context: `[Firebase]`, `[Storage]`, `[Supabase]`, `[AnonymousKey]`
- Graceful degradation: Errors caught but execution continues (e.g., Firebase analytics init failure doesn't block app)
- Error validation in hook initialization (e.g., `useAnonymousKey.jsx` validates SDK availability before calling)

**Error Recovery:**
```javascript
// From useUserInfoStorage.js
try {
  const parsed = JSON.parse(jsonString)
  if (!isValidUserInfo(parsed)) {
    await Storage.removeItem(USER_INFO_STORAGE_KEY)  // Clean up invalid data
    setStoredUserInfo(null)
    return null
  }
} catch (error) {
  console.error('사용자 정보 로드 실패:', error)
  try {
    await Storage.removeItem(USER_INFO_STORAGE_KEY)
  } catch (e) {
    console.error('손상된 데이터 삭제 실패:', e)
  }
}
```

## Logging

**Framework:** `console` object (no structured logging library)

**Patterns:**
- Context-prefixed logs: `console.log('[Module] message', data)`
- Severity levels: `console.log()`, `console.warn()`, `console.error()`
- Fire-and-forget async logging: Supabase debug logs don't await (see `logDebug()` in `supabase.js`)

**Examples from codebase:**
```javascript
// firebase.js
console.log(`[Firebase] Event logged: ${eventName}`, eventParams)
console.warn('[Firebase] setUserId 실패:', err)

// supabase.js
console.warn('[logDebug] 저장 실패:', error)
console.error('[supabase] app_config 조회 실패:', error)

// useUserInfoStorage.js
console.log('[Storage] 불러온 데이터:', jsonString)
console.warn('[Storage] 저장된 데이터가 유효하지 않습니다:', parsed)
```

## Comments

**When to Comment:**
- Complex data transformations (e.g., hour conversion in `BirthdateInput.jsx` lines 29-45)
- Workarounds and non-obvious logic: "CommonMark에서 **text** 뒤에 바로 한글이 오면 bold 파싱 실패"
- Firebase initialization conditions: "Sentry 초기화"
- Regulatory/business context: "fire-and-forget, await 하지 않음" (performance optimization)
- Debug notes: "한국 시간 기준 오늘 00:00:00 (UTC로 변환)"

**JSDoc/TSDoc:**
```javascript
/**
 * 생년월일 데이터를 API 형식(YYYY-MM-DD)으로 변환
 * @param {Object} birthdate - { year, month, day }
 * @returns {string} "YYYY-MM-DD" 형식의 날짜 문자열
 */
export function formatBirthdate(birthdate) { ... }
```
- JSDoc used for utility functions (all functions in `dataTransform.js` have JSDoc)
- Includes parameter types and return types
- Korean language comments for clarity in Korean codebase

## Function Design

**Size:** 
- Small utility functions: 20-50 lines (e.g., `formatBirthdate`, `formatGender`)
- Component functions: 100-700 lines (large components handle multi-step UI, see `BirthdateInput.jsx` 637 lines, `HomePage.jsx` 743 lines)
- Hooks: 40-100 lines for simple state management

**Parameters:**
- Use object destructuring for prop parameters: `function BirthdateInput({ name, onNext, onBack, initialBirthdate = {} })`
- Default values provided: `initialBirthdate = {}`
- Props passed down through callbacks: `onNext(data)`, `onBack()`

**Return Values:**
- JSX components return React elements
- Utility functions return primitives (strings, booleans) or Blob/data objects
- Hooks return context values or state tuple-like objects: `{ sessionId, startNewSession }`
- Async functions throw errors or return null/objects

**Validation Pattern:**
```javascript
// From dataTransform.js
export function formatBirthdate(birthdate) {
  if (!birthdate || !birthdate.year || !birthdate.month || !birthdate.day) {
    throw new Error('생년월일 정보가 올바르지 않습니다.')
  }
  // ... return validated data
}
```

## Module Design

**Exports:**
- Named exports for utilities: `export function formatBirthdate()`
- Default exports for components: `export default function HomePage() { }`
- Named exports for hooks: `export function SessionProvider()`, `export function useSession()`
- Mixed exports for lib files: Both named and default exports from `firebase.js`

**Barrel Files:**
- No explicit barrel files detected; imports directly from component/hook files

**Module Organization:**
- Components: Isolated in `src/components/` with internal state management
- Hooks: Custom hooks in `src/hooks/` for state and context management
- Utils: Pure functions in `src/utils/` for data transformation
- Libs: SDK wrappers in `src/lib/` (Supabase, Firebase)
- Pages: Route-level components in `src/pages/`
- Config: Application configuration in `src/config/`

---

*Convention analysis: 2026-04-29*
