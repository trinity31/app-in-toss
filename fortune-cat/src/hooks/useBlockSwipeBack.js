import { useEffect } from 'react'
import { setIosSwipeGestureEnabled } from '@apps-in-toss/web-framework'

/**
 * 토스 WebView에서 화면 스와이프 뒤로가기(iOS 좌측 엣지 제스처)를 토글한다.
 * 미지원 환경(일반 브라우저/개발)에서는 조용히 무시한다 (graceful degradation).
 */
function setSwipeGesture(isEnabled) {
  if (setIosSwipeGestureEnabled.isSupported?.() === false) return
  try {
    const result = setIosSwipeGestureEnabled({ isEnabled })
    if (result && typeof result.catch === 'function') result.catch(() => {})
  } catch {
    // 미지원 환경 — 무시
  }
}

/**
 * 결과 화면 등에서 스와이프 뒤로가기로 화면이 이탈되는 것을 막는다.
 *
 * 결과 단계는 라우트가 아니라 페이지 내부 state(currentPage)로 관리되는데, 토스 WebView의
 * 스와이프 뒤로가기는 브라우저 history가 아닌 네이티브 제스처라 history 조작으로는 막을 수
 * 없다. web-framework의 setIosSwipeGestureEnabled 브리지로만 제어된다. 마운트 시 제스처를
 * 끄고 언마운트 시 다시 켜서, 결과 화면에서만 차단하고 다른 화면의 스와이프 뒤로가기는
 * 보존한다.
 *
 * @param {boolean} [enabled=true] 활성화 여부 (예: 결과 단계에서만 true)
 */
export function useBlockSwipeBack(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    setSwipeGesture(false)
    return () => setSwipeGesture(true)
  }, [enabled])
}
