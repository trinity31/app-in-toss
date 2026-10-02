// Versioned server assets; source WebPs remain in the repository for hash verification.
const CARD_IMAGE_BASE = 'https://www.fortunecat.art/tarot/cards/tarot78-v1';

export function getCardImageUrl(id) {
  return Number.isInteger(id) && id >= 0 && id < 78
    ? `${CARD_IMAGE_BASE}/${String(id).padStart(2, '0')}.webp` : null;
}

// Daily fortune still prefetches only its 22 major cards.
export function prefetchAllCardImages() {
  if (typeof window === 'undefined') return;
  for (let id = 0; id < 22; id++) {
    const img = new Image();
    img.src = getCardImageUrl(id);
  }
}
