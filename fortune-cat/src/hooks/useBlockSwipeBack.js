import { useEffect, useRef } from 'react'
import {
  setIosSwipeGestureEnabled,
  graniteEvent,
  getPlatformOS,
} from '@apps-in-toss/web-framework'

const DEFAULT_CONFIRM_MESSAGE = '뒤로가기 시 결과를 다시 생성해야 해요. 나가시겠어요?'

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
 * 결과 화면 등에서 뒤로가기로 결과가 유실되는 것을 막는다. 토스 WebView의 스와이프/뒤로가기는
 * 브라우저 history가 아닌 네이티브 동작이라 history 조작으로는 막을 수 없고, 플랫폼별로 다르게
 * 처리한다:
 *   - iOS: setIosSwipeGestureEnabled 로 좌측 엣지 스와이프 제스처만 비활성화(백버튼은 유지).
 *     iOS 스와이프는 backEvent로 가로챌 수 없어 확인 다이얼로그를 띄울 수 없다(on/off만 가능).
 *   - Android: 시스템 뒤로가기(제스처/버튼)가 동일한 backEvent라 둘을 구분할 수 없다.
 *     backEvent 리스너를 등록하면 기본 뒤로가기가 차단되고 onEvent가 호출되므로, 확인
 *     다이얼로그를 띄워 사용자가 '나가기'를 택하면 onLeave를 실행한다(취소 시 화면 유지).
 * 마운트 시 차단하고 언마운트 시 해제해, 결과 화면에서만 막고 다른 화면은 보존한다.
 *
 * @param {() => void} [onLeave] 사용자가 확인 다이얼로그에서 '나가기'를 선택했을 때 실행할 이탈 동작
 * @param {string} [message] 확인 다이얼로그 문구 (기본값 제공)
 */
export function useBlockSwipeBack(onLeave, message = DEFAULT_CONFIRM_MESSAGE) {
  // 최신 onLeave/message를 ref로 유지해, 리렌더마다 backEvent를 재등록하지 않는다.
  const onLeaveRef = useRef(onLeave)
  onLeaveRef.current = onLeave
  const messageRef = useRef(message)
  messageRef.current = message

  useEffect(() => {
    const platform = getPlatform()

    // iOS 좌측 엣지 스와이프 비활성화 (Android에서는 미지원이라 자동 무시)
    setIosSwipeGesture(false)

    // iOS는 백버튼 동작을 보존하기 위해 backEvent를 등록하지 않는다.
    // Android(및 플랫폼 판별 불가 시)에만 등록해 시스템 뒤로가기에 확인 다이얼로그를 띄운다.
    let unsubscribe
    if (platform !== 'ios') {
      try {
        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: () => {
            // backEvent 등록 시 기본 뒤로가기는 차단됨 → 확인 후에만 이탈
            const shouldLeave = window.confirm(messageRef.current)
            if (shouldLeave) onLeaveRef.current?.()
          },
          onError: () => {},
        })
      } catch {
        // 미지원 환경 — 무시
      }
    }

    return () => {
      setIosSwipeGesture(true)
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])
}
