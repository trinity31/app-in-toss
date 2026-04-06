/**
 * 펫 스타일 샘플 이미지
 * samples 폴더 안의 9가지 스타일 샘플을 자동으로 가져와서 랜덤 순서로 표시
 */

const allSamples = import.meta.glob(
  '../assets/images/samples/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);

function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const images = Object.entries(allSamples)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

export const PET_STYLE_SAMPLES = shuffle(images)
  .map((url, i) => ({ id: `pet-${i}`, sampleUrl: url }));
