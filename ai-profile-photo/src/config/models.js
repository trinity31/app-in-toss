/**
 * 프로필 타입별 추천 모델 매핑
 */

// seededit - SeedEdit 3.0 (기본 모델)
// flux-pro - Flux Pro
// gemini-flash - Gemini 2.5 Flash
// google/nano-banana - GoogleGenAI SDK (얼굴 보존)
// qwen - Qwen Image Edit Plus
// sdxl - Stable Diffusion XL
export const PROFILE_TYPE_MODEL_MAP = {
  // SNS 프로필 - 밝고 친근한
  'sns': 'seededit',

  // 전문가 프로필 - 취업·비즈니스용
  'professional': 'google/nano-banana',

  // 아티스트 프로필 - 창의적이고 개성있는
  'artist': 'seededit',

  // 소개팅 프로필 - 매력적이고 따뜻한
  'dating': 'seededit',

  // 디지털 노마드 - 자유롭고 모던한
  'nomad': 'qwen',

  // 의사 프로필 - 전문적이고 신뢰감 있는
  'doctor': 'google/nano-banana'
};

/**
 * 기본 모델 (매핑에 없는 타입의 경우)
 */
export const DEFAULT_MODEL = 'seededit';

/**
 * 프로필 타입에 따라 적절한 모델 선택
 * @param {string} profileType - 프로필 타입
 * @returns {string} 모델 ID
 */
export function getModelForProfileType(profileType) {
  return PROFILE_TYPE_MODEL_MAP[profileType] || DEFAULT_MODEL;
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
