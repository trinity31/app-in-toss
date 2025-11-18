/**
 * 반려동물 타입별 추천 모델 매핑
 */

// seededit - SeedEdit 3.0 (기본 모델)
// flux-pro - Flux Pro
// gemini-flash - Gemini 2.5 Flash
// google/nano-banana - GoogleGenAI SDK (얼굴 보존)
// qwen - Qwen Image Edit Plus
// sdxl - Stable Diffusion XL
export const PET_TYPE_MODEL_MAP = {
  // 명화 속 주인공 - 예술적 변환
  'masterpiece': 'google/nano-banana',

  // 할로윈 - 창의적 변환
  'halloween': 'google/nano-banana',

  // 슈퍼히어로 - 액션/파워풀
  'superhero': 'google/nano-banana',

  // 왕족 - 우아하고 고급스러운
  'royal': 'google/nano-banana',

  // 카툰 - 친근하고 귀여운
  'cartoon': 'google/nano-banana',

  // 다른 동물과 합체 - 하이브리드
  'hybrid-animal': 'google/nano-banana',

  // 동화 주인공 - 클래식 동화
  'fairytale-hero': 'google/nano-banana',

  // 피규어 - 수집용
  'figure': 'google/nano-banana',

  // 봉제인형 - 플러시 토이
  'plush-toy': 'google/nano-banana',

  // 루니툰 스타일 - 클래식 카툰
  'looney-tunes': 'google/nano-banana',

  // 스티커 - SNS용
  'sticker': 'google/nano-banana',

  // 이모티콘 - 귀여운 이모티콘
  'emoticon': 'google/nano-banana',

  // 디즈니 주인공 - 디즈니 애니메이션
  'disney-character': 'google/nano-banana',

  // 천사 - 순수한 천사
  'angel': 'google/nano-banana',

  // 산타 - 크리스마스
  'santa': 'google/nano-banana'
};

/**
 * 기본 모델 (매핑에 없는 타입의 경우)
 */
export const DEFAULT_MODEL = 'google/nano-banana';

/**
 * 반려동물 타입에 따라 적절한 모델 선택
 * @param {string} petType - 반려동물 타입
 * @returns {string} 모델 ID
 */
export function getModelForPetType(petType) {
  return PET_TYPE_MODEL_MAP[petType] || DEFAULT_MODEL;
}

/**
 * 사용 가능한 모델 목록
 */
export const AVAILABLE_MODELS = {
  'seededit': {
    name: 'SeedEdit 3.0',
    description: '고품질 이미지 편집',
    speed: 'medium'
  },
  'flux-pro': {
    name: 'Flux Pro',
    description: '최고 품질',
    speed: 'slow'
  },
  'gemini-flash': {
    name: 'Gemini Flash',
    description: '빠른 생성',
    speed: 'fast'
  },
  'google/nano-banana': {
    name: 'GoogleGenAI',
    description: '얼굴 보존',
    speed: 'fast'
  },
  'qwen': {
    name: 'Qwen Image Edit',
    description: '세밀한 편집',
    speed: 'medium'
  },
  'sdxl': {
    name: 'Stable Diffusion XL',
    description: '안정적인 기본 모델',
    speed: 'medium'
  }
};
