// 22장 메이저 아르카나 카드 webp 정적 import + id 기반 lookup 헬퍼.
// CONTEXT D-11: webp 형식 그대로, Vite 정적 import로 빌드 타임 fingerprint URL 생성.
// RESEARCH Pattern 6 + Pitfall 2 (intro 진입 직후 prefetch로 첫 result 깜빡임 회피).

import card00 from './00.webp';
import card01 from './01.webp';
import card02 from './02.webp';
import card03 from './03.webp';
import card04 from './04.webp';
import card05 from './05.webp';
import card06 from './06.webp';
import card07 from './07.webp';
import card08 from './08.webp';
import card09 from './09.webp';
import card10 from './10.webp';
import card11 from './11.webp';
import card12 from './12.webp';
import card13 from './13.webp';
import card14 from './14.webp';
import card15 from './15.webp';
import card16 from './16.webp';
import card17 from './17.webp';
import card18 from './18.webp';
import card19 from './19.webp';
import card20 from './20.webp';
import card21 from './21.webp';

const CARD_IMAGES = [
  card00, card01, card02, card03, card04, card05, card06, card07,
  card08, card09, card10, card11, card12, card13, card14, card15,
  card16, card17, card18, card19, card20, card21,
];

/**
 * 카드 id(0~21)로 정적 import된 webp URL을 반환.
 * 잘못된 id는 0번(바보) URL로 fallback + console.warn.
 */
export function getCardImageUrl(id) {
  if (!Number.isInteger(id) || id < 0 || id > 21) {
    console.warn(`[cards] invalid card id: ${id}`);
    return CARD_IMAGES[0];
  }
  return CARD_IMAGES[id];
}

/**
 * 22장 webp를 브라우저 이미지 캐시에 prefetch.
 * intro 단계 mount 직후 호출 → 사용자가 헤드라인 읽는 동안 다운로드 → 첫 result 표시 시 깜빡임 회피 (Pitfall 2).
 * SSR/non-browser 환경에서는 silent skip.
 */
export function prefetchAllCardImages() {
  if (typeof window === 'undefined') return;
  CARD_IMAGES.forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}
