import { useEffect } from 'react'

/**
 * 결과 화면 등에서 좌측 엣지 스와이프(또는 뒤로가기 제스처)로 화면이 이탈되는 것을 막는다.
 *
 * 결과 단계는 라우트가 아니라 페이지 내부 state(currentPage)로 관리되는데, 토스 WebView의
 * 좌측 엣지 스와이프는 브라우저 popstate(history back)를 발생시켜 라우트 자체를 빠져나가
 * 풀이가 유실된다. 이 훅은 마운트 시 더미 history 엔트리를 쌓고 popstate가 발생할 때마다
 * 같은 엔트리를 다시 push 하여, 스와이프 뒤로가기를 무력화하고 현재 화면에 머무르게 한다.
 *
 * @param {boolean} [enabled=true] 활성화 여부 (예: 결과 단계에서만 true)
 */
export function useBlockSwipeBack(enabled = true) {
  useEffect(() => {
    if (!enabled) return

    // 현재 화면에 더미 history 엔트리를 쌓아 뒤로가기 시 되돌릴 수 있게 함
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      // 스와이프/뒤로가기로 한 칸 빠져나가면 즉시 같은 화면을 다시 push 해 복구
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [enabled])
}
