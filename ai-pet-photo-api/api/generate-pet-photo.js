import { PET_PROMPTS, FLUX_PROMPTS, DEFAULT_PROMPT, VALID_PET_TYPES, getFluxPromptWithRandomComposition } from './prompts.js';
import { createGenerator, DEFAULT_MODEL, SUPPORTED_MODELS } from './generators/index.js';

// 카드 타입(크리스마스, 연하장) 모델 설정
// 'google/nano-banana' 또는 'flux-pro-2' 중 선택
const CARD_MODEL = 'flux-pro-2';
//const CARD_MODEL = 'google/nano-banana';

// 타입별 모델 매핑 (클라이언트가 모델을 지정하지 않은 경우)
// 테스트를 위해 각 타입에 다른 모델을 할당하여 품질/비용 비교 가능
const TYPE_TO_MODEL_MAPPING = {
  'masterpiece': 'google/nano-banana',     // $0.039 - nano-banana
  'halloween': 'google/nano-banana',                 // $0.03
  'superhero': 'seededit',                     // $0.03 -> seededit ok
  'royal': 'google/nano-banana',           // $0.039
  'cartoon': 'google/nano-banana',        // $0.039 -> nano-banana
  'hybrid-animal': 'google/nano-banana',   // $0.039 -> nano-banana
  'fairytale-hero': 'google/nano-banana',  // $0.039
  'figure': 'google/nano-banana',                    // $0.03
  'plush-toy': 'google/nano-banana',                     // $0.03
  'looney-tunes': 'google/nano-banana',    // $0.039
  'sticker': 'google/nano-banana',                   // $0.03
  'emoticon': 'google/nano-banana',                      // $0.03
  'disney-character': 'google/nano-banana', // $0.039
  'angel': 'seededit',                     // $0.03 -> seededit OK
  'santa': 'qwen',                         // $0.03 -> qwen OK
  'christmas-card': 'google/nano-banana',            // 크리스마스 카드 (상단 CARD_MODEL 변수로 제어)
  'new-year-card': 'google/nano-banana',   // 연하장 - nano banana로 비용 절감 (하위 호환)
  'new-year-card-cat': 'google/nano-banana', // 복고양이 연하장 (하위 호환)
  'new-year-card-dog': 'google/nano-banana',  // 복강아지 연하장 (하위 호환)

  // 고양이 연하장 3종 (한/일/중) - 모두 nano-banana-pro로 AI 텍스트 생성
  'new-year-card-cat-korea': 'google/nano-banana-pro', // 한국풍 고양이
  'new-year-card-cat-korea-male': 'google/nano-banana-pro', // 한국풍 고양이 남아
  'new-year-card-cat-korea-female': 'google/nano-banana-pro', // 한국풍 고양이 여아
  'new-year-card-cat-japan': 'google/nano-banana-pro', // 일본풍 고양이 (마네키네코)
  'new-year-card-cat-china': 'google/nano-banana-pro', // 중국풍 고양이

  // 강아지 연하장 3종 (한/일/중) - 모두 nano-banana-pro로 AI 텍스트 생성
  'new-year-card-dog-korea': 'google/nano-banana-pro', // 한국풍 강아지
  'new-year-card-dog-korea-male': 'google/nano-banana-pro', // 한국풍 강아지 남아
  'new-year-card-dog-korea-female': 'google/nano-banana-pro', // 한국풍 강아지 여아
  'new-year-card-dog-japan': 'google/nano-banana-pro', // 일본풍 강아지
  'new-year-card-dog-china': 'google/nano-banana-pro'  // 중국풍 강아지
};

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    'https://ai-pet-studio.apps.tossmini.com',
    'https://ai-pet-studio.private-apps.tossmini.com',
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
      mimeType = 'image/jpeg',
      petType = 'masterpiece',
      model  // 클라이언트가 지정하지 않으면 undefined
    } = req.body;

    // 모델 선택: 클라이언트가 지정하지 않으면 타입별 매핑 사용, 매핑에 없으면 기본 모델 사용
    const selectedModel = model || TYPE_TO_MODEL_MAPPING[petType] || DEFAULT_MODEL;

    console.log('받은 petType:', petType);
    console.log('받은 model:', model);
    console.log('선택된 model:', selectedModel, model ? '(클라이언트 지정)' : `(타입 매핑: ${petType})`);
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
    if (!SUPPORTED_MODELS.includes(selectedModel)) {
      return res.status(400).json({
        success: false,
        error: `Invalid model: ${selectedModel}. Supported models: ${SUPPORTED_MODELS.join(', ')}`
      });
    }

    // 반려동물 타입 검증 및 프롬프트 선택
    // Flux-2 Pro 모델인 경우 FLUX_PROMPTS 사용, 아니면 PET_PROMPTS 사용
    let selectedPrompt;
    const isFluxModel = selectedModel === 'flux-pro-2';
    const isCardType = petType === 'christmas-card' || petType === 'new-year-card';

    if (isFluxModel && isCardType && FLUX_PROMPTS[petType]) {
      // Flux 모델 + 카드 타입인 경우 Flux 전용 프롬프트 사용 (랜덤 컴포지션 적용)
      selectedPrompt = getFluxPromptWithRandomComposition(petType);
      console.log('선택된 프롬프트:', `FLUX_${petType} (with random composition)`);
    } else if (VALID_PET_TYPES.includes(petType)) {
      // 일반 모델 또는 일반 타입인 경우 기본 프롬프트 사용
      selectedPrompt = PET_PROMPTS[petType];
      console.log('선택된 프롬프트 타입:', petType);
    } else {
      selectedPrompt = DEFAULT_PROMPT;
      console.log('선택된 프롬프트 타입:', 'DEFAULT (masterpiece)');
    }

    console.log('프롬프트 길이:', selectedPrompt.length, 'chars');

    // Generator 생성
    const generator = createGenerator(selectedModel);

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
      model: selectedModel // 실제 사용된 모델 반환
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
