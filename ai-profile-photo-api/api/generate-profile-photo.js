import { PROFILE_PROMPTS, DEFAULT_PROMPT, VALID_PROFILE_TYPES } from './prompts.js';
import { createGenerator, DEFAULT_MODEL, SUPPORTED_MODELS } from './generators/index.js';

// 타입별 모델 매핑 (클라이언트가 모델을 지정하지 않은 경우)
// 테스트를 위해 각 타입에 다른 모델을 할당하여 품질/비용 비교 가능
const TYPE_TO_MODEL_MAPPING = {
  'sns': 'google/nano-banana',        // $0.039 - 기본 모델
  'professional': 'google/nano-banana',         // $0.03
  'artist': 'google/nano-banana',                   // $0.03
  'dating': 'google/nano-banana',     // $0.039
  'nomad': 'google/nano-banana',                // $0.03
  'doctor': 'google/nano-banana',                   // $0.03
  'wicked': 'google/nano-banana',      // $0.039

  // 연하장 3가지 스타일
  'new-year-card-illustration': 'google/nano-banana-pro',  // 심플하고 따뜻한 느낌의 일러스트
  'new-year-card-minhwa': 'google/nano-banana-pro',        // 한국 전통 민화
  'new-year-card-clay': 'google/nano-banana-pro'           // 3D 클레이/점토
};

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    'https://ai-profile-photo-studio.apps.tossmini.com',
    'https://ai-profile-photo-studio.private-apps.tossmini.com',
    'http://localhost:5173',
    'http://192.168.0.28:5173'
  ];
}

export default async function handler(req, res) {
  // Origin 검증 및 CORS 헤더 설정
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  // 허용되지 않은 origin인 경우 CORS 헤더를 설정하지 않음 (브라우저가 차단함)

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    console.log('=== API 요청 시작 ===');

    const {
      imageBase64,
      images,  // 다중 이미지 배열 [{imageBase64, mimeType}, ...]
      mimeType = 'image/jpeg',
      profileType = 'professional',
      model  // 클라이언트가 지정하지 않으면 undefined
    } = req.body;

    // 모델 선택: 클라이언트가 지정하지 않으면 타입별 매핑 사용, 매핑에 없으면 기본 모델 사용
    const selectedModel = model || TYPE_TO_MODEL_MAPPING[profileType] || DEFAULT_MODEL;

    console.log('받은 profileType:', profileType);
    console.log('받은 model:', model);
    console.log('선택된 model:', selectedModel, model ? '(클라이언트 지정)' : `(타입 매핑: ${profileType})`);
    console.log('이미지 크기:', imageBase64?.length || '다중 이미지', 'bytes');
    console.log('다중 이미지 개수:', images?.length || 0);
    console.log('MIME 타입:', mimeType);

    // 입력 검증 - 단일 또는 다중 이미지 중 하나는 있어야 함
    if (!imageBase64 && (!images || images.length === 0)) {
      return res.status(400).json({
        success: false,
        error: 'imageBase64 or images array is required'
      });
    }

    // 모델 검증
    if (!SUPPORTED_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model: ${selectedModel}. Supported models: ${SUPPORTED_MODELS.join(', ')}`
      });
    }

    // 프로필 타입 검증 및 프롬프트 선택
    const selectedPrompt = VALID_PROFILE_TYPES.includes(profileType)
      ? PROFILE_PROMPTS[profileType]
      : DEFAULT_PROMPT;

    console.log('선택된 프롬프트 타입:', VALID_PROFILE_TYPES.includes(profileType) ? profileType : 'DEFAULT (professional)');
    console.log('프롬프트 길이:', selectedPrompt.length, 'chars');

    // Generator 생성
    const generator = createGenerator(selectedModel);

    // 이미지 생성 - 다중 이미지 지원
    const generatedImage = await generator.generate({
      imageBase64,
      images,  // 다중 이미지 배열 전달
      mimeType,
      prompt: selectedPrompt
    });

    // 이미지가 생성되지 않은 경우
    if (!generatedImage || !generatedImage.data) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate image'
      });
    }

    console.log('=== 이미지 생성 완료 ===');

    // 성공 응답
    return res.status(200).json({
      success: true,
      image: generatedImage,
      model: selectedModel // 실제 사용된 모델 반환
    });

  } catch (error) {
    console.error('Error generating profile photo:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
