import { useState, useEffect } from 'react'
import { SafeAreaInsets } from '@apps-in-toss/web-framework'

const ZERO = { top: 0, bottom: 0, left: 0, right: 0 }

/**
 * 현재 기기의 Safe Area Insets(px)를 읽는다. 미지원 환경(개발 브라우저 등)에서는 0.
 *
 * 이 앱은 viewport-fit=cover를 쓰지 않아 CSS `env(safe-area-inset-*)`가 신뢰할 수 없으므로,
 * Apps-in-Toss 공식 API `SafeAreaInsets.get()`로 정확한 픽셀 인셋을 얻는다.
 */
function readInsets() {
  try {
    return SafeAreaInsets.get?.() ?? ZERO
  } catch {
    return ZERO
  }
}

/**
 * Safe Area Insets를 구독해 반환하는 훅. 화면 모드 변경(회전 등) 시 자동 갱신된다.
 * @returns {{ top: number, bottom: number, left: number, right: number }}
 */
export function useSafeAreaInsets() {
  const [insets, setInsets] = useState(readInsets)

  useEffect(() => {
    let cleanup
    try {
      cleanup = SafeAreaInsets.subscribe?.({
        onEvent: (next) => setInsets(next || ZERO),
      })
    } catch {
      // 미지원 환경 — 무시
    }
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [])

  return insets
}
