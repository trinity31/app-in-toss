import { PET_PROMPTS, DEFAULT_PROMPT, VALID_PET_TYPES } from './prompts.js';
import { createGenerator, DEFAULT_MODEL, SUPPORTED_MODELS } from './generators/index.js';

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    'https://ai-pet-studio.apps.tossmini.com',
    'https://ai-pet-studio.private-apps.tossmini.com',
    'http://localhost:5173',
    'http://192.168.0.25:5173'
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
      mimeType = 'image/jpeg',
      petType = 'masterpiece',
      model = DEFAULT_MODEL
    } = req.body;

    console.log('받은 petType:', petType);
    console.log('받은 model:', model);
    console.log('이미지 크기:', imageBase64?.length, 'bytes');
    console.log('MIME 타입:', mimeType);

    // 입력 검증
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'imageBase64 is required'
      });
    }

    // 모델 검증
    if (!SUPPORTED_MODELS.includes(model)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model: ${model}. Supported models: ${SUPPORTED_MODELS.join(', ')}`
      });
    }

    // 반려동물 타입 검증 및 프롬프트 선택
    const selectedPrompt = VALID_PET_TYPES.includes(petType)
      ? PET_PROMPTS[petType]
      : DEFAULT_PROMPT;

    console.log('선택된 프롬프트 타입:', VALID_PET_TYPES.includes(petType) ? petType : 'DEFAULT (masterpiece)');
    console.log('프롬프트 길이:', selectedPrompt.length, 'chars');

    // Generator 생성
    const generator = createGenerator(model);

    // 이미지 생성
    const generatedImage = await generator.generate({
      imageBase64,
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
      model: model // 어떤 모델을 사용했는지 반환
    });

  } catch (error) {
    console.error('Error generating pet photo:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
