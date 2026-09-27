// Static imports let Vite fingerprint every consultation card.
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
import card22 from './22.webp';
import card23 from './23.webp';
import card24 from './24.webp';
import card25 from './25.webp';
import card26 from './26.webp';
import card27 from './27.webp';
import card28 from './28.webp';
import card29 from './29.webp';
import card30 from './30.webp';
import card31 from './31.webp';
import card32 from './32.webp';
import card33 from './33.webp';
import card34 from './34.webp';
import card35 from './35.webp';
import card36 from './36.webp';
import card37 from './37.webp';
import card38 from './38.webp';
import card39 from './39.webp';
import card40 from './40.webp';
import card41 from './41.webp';
import card42 from './42.webp';
import card43 from './43.webp';
import card44 from './44.webp';
import card45 from './45.webp';
import card46 from './46.webp';
import card47 from './47.webp';
import card48 from './48.webp';
import card49 from './49.webp';
import card50 from './50.webp';
import card51 from './51.webp';
import card52 from './52.webp';
import card53 from './53.webp';
import card54 from './54.webp';
import card55 from './55.webp';
import card56 from './56.webp';
import card57 from './57.webp';
import card58 from './58.webp';
import card59 from './59.webp';
import card60 from './60.webp';
import card61 from './61.webp';
import card62 from './62.webp';
import card63 from './63.webp';
import card64 from './64.webp';
import card65 from './65.webp';
import card66 from './66.webp';
import card67 from './67.webp';
import card68 from './68.webp';
import card69 from './69.webp';
import card70 from './70.webp';
import card71 from './71.webp';
import card72 from './72.webp';
import card73 from './73.webp';
import card74 from './74.webp';
import card75 from './75.webp';
import card76 from './76.webp';
import card77 from './77.webp';

const CARD_IMAGES = [
  card00, card01, card02, card03, card04, card05, card06, card07,
  card08, card09, card10, card11, card12, card13, card14, card15,
  card16, card17, card18, card19, card20, card21, card22, card23,
  card24, card25, card26, card27, card28, card29, card30, card31,
  card32, card33, card34, card35, card36, card37, card38, card39,
  card40, card41, card42, card43, card44, card45, card46, card47,
  card48, card49, card50, card51, card52, card53, card54, card55,
  card56, card57, card58, card59, card60, card61, card62, card63,
  card64, card65, card66, card67, card68, card69, card70, card71,
  card72, card73, card74, card75, card76, card77,
];

// Unknown IDs must never impersonate another card.
export function getCardImageUrl(id) {
  return Number.isInteger(id) && id >= 0 && id < CARD_IMAGES.length ? CARD_IMAGES[id] : null;
}

// Daily fortune still prefetches only its 22 major cards.
export function prefetchAllCardImages() {
  if (typeof window === 'undefined') return;
  CARD_IMAGES.slice(0, 22).forEach((url) => {
    const img = new Image();
    img.src = url;
  });
}
