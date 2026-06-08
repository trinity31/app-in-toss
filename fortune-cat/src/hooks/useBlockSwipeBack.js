import { useEffect } from 'react'
import {
  setIosSwipeGestureEnabled,
  graniteEvent,
  getPlatformOS,
} from '@apps-in-toss/web-framework'

/**
 * 현재 실행 플랫폼('ios' | 'android')을 반환. 미지원 환경(개발 브라우저 등)에서는 null.
 */
function getPlatform() {
  try {
    return getPlatformOS()
  } catch {
    return null
  }
}

/**
 * iOS 좌측 엣지 스와이프 뒤로가기 제스처를 토글한다.
 * 미지원 환경에서는 조용히 무시한다 (graceful degradation).
 */
function setIosSwipeGesture(isEnabled) {
  if (setIosSwipeGestureEnabled.isSupported?.() === false) return
  try {
    const result = setIosSwipeGestureEnabled({ isEnabled })
    if (result && typeof result.catch === 'function') result.catch(() => {})
  } catch {
    // 미지원 환경 — 무시
  }
}

/**
 * Android 뒤로가기(시스템 제스처/버튼)를 차단한다.
 * backEvent 리스너를 등록하면 기본 뒤로가기가 차단되고 onEvent가 대신 호출된다(무동작 = 완전 차단).
 * @returns {(() => void) | undefined} 등록 해제 함수
 */
function addBackBlocker() {
  try {
    return graniteEvent.addEventListener('backEvent', {
      // 결과 화면 유지 — 기본 뒤로가기 차단. 화면 이탈은 인앱 버튼으로만.
      onEvent: () => {},
      onError: () => {},
    })
  } catch {
    // 미지원 환경 — 무시
    return undefined
  }
}

/**
 * 결과 화면 등에서 스와이프/뒤로가기로 화면이 이탈되는 것을 막는다.
 *
 * 결과 단계는 라우트가 아니라 페이지 내부 state(currentPage)로 관리되는데, 토스 WebView의
 * 스와이프 뒤로가기는 브라우저 history가 아닌 네이티브 동작이라 history 조작으로는 막을 수
 * 없다. 플랫폼별로 web-framework 브리지를 사용한다:
 *   - iOS: setIosSwipeGestureEnabled 로 좌측 엣지 스와이프 제스처만 비활성화 (백버튼은 유지)
 *   - Android: graniteEvent backEvent 리스너로 시스템 뒤로가기(제스처/버튼) 차단
 * 마운트 시 차단하고 언마운트 시 해제해, 결과 화면에서만 막고 다른 화면은 보존한다.
 *
 * @param {boolean} [enabled=true] 활성화 여부 (예: 결과 단계에서만 true)
 */
export function useBlockSwipeBack(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const platform = getPlatform()

    // iOS 좌측 엣지 스와이프 비활성화 (Android에서는 미지원이라 자동 무시)
    setIosSwipeGesture(false)

    // iOS는 백버튼 동작을 보존하기 위해 backEvent를 등록하지 않는다.
    // Android(및 플랫폼 판별 불가 시)에만 등록해 시스템 뒤로가기를 차단한다.
    const unsubscribe = platform === 'ios' ? undefined : addBackBlocker()

    return () => {
      setIosSwipeGesture(true)
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [enabled])
}
