/**
 * 프로필 타입별 스타일 변형 샘플 이미지
 * 각 타입 폴더의 female/male 하위 폴더에서 자동으로 이미지를 가져옴
 * 여성/남성 번갈아 배치 — 총 12장
 */

const PROFILE_TYPES = ['sns', 'professional', 'artist', 'dating', 'nomad', 'creative'];

// 모든 샘플 이미지를 한번에 가져옴 (eager: 빌드 타임에 resolve)
const allSamples = import.meta.glob(
  '../assets/images/samples/**/*.{jpg,jpeg,png,webp}',
  { eager: true, import: 'default' }
);

/**
 * 특정 타입/성별 폴더의 이미지 URL 배열 반환
 * 파일명 알파벳순 정렬
 */
function getImages(type, gender) {
  const prefix = `../assets/images/samples/${type}/${gender}/`;
  return Object.entries(allSamples)
    .filter(([path]) => path.startsWith(prefix))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, url]) => url);
}

/** 여성/남성 번갈아 배치하여 배열 생성 */
function interleave(female, male) {
  const result = [];
  const len = Math.max(female.length, male.length);
  for (let i = 0; i < len; i++) {
    if (i < female.length) result.push(female[i]);
    if (i < male.length) result.push(male[i]);
  }
  return result;
}

/** 배열을 결정적으로 셔플 (시드 기반, 매 세션 동일) */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 타입별 샘플 이미지 매핑 생성 (여/남 교차 후 셔플) */
const STYLE_SAMPLES = {};
for (const type of PROFILE_TYPES) {
  const female = getImages(type, 'female');
  const male = getImages(type, 'male');
  STYLE_SAMPLES[type] = shuffle(interleave(female, male))
    .map((url, i) => ({ id: `${type}-${i}`, sampleUrl: url }));
}

export { STYLE_SAMPLES };

/** profileTypeId에 해당하는 샘플 목록 반환 */
export function getSamplesForType(profileTypeId) {
  return STYLE_SAMPLES[profileTypeId] || STYLE_SAMPLES.professional;
}
