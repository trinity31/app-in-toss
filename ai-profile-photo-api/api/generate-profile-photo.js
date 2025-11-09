import { GoogleGenAI } from '@google/genai';
import { PROFILE_PROMPTS, DEFAULT_PROMPT, VALID_PROFILE_TYPES } from './prompts.js';

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
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

    const { imageBase64, mimeType = 'image/jpeg', profileType = 'professional' } = req.body;

    console.log('받은 profileType:', profileType);
    console.log('이미지 크기:', imageBase64?.length, 'bytes');
    console.log('MIME 타입:', mimeType);

    // 입력 검증
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'imageBase64 is required'
      });
    }

    // 프로필 타입 검증 및 프롬프트 선택
    const selectedPrompt = VALID_PROFILE_TYPES.includes(profileType)
      ? PROFILE_PROMPTS[profileType]
      : DEFAULT_PROMPT;

    console.log('선택된 프롬프트 타입:', VALID_PROFILE_TYPES.includes(profileType) ? profileType : 'DEFAULT (professional)');
    console.log('프롬프트 길이:', selectedPrompt.length, 'chars');

    // API 키 확인
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'GEMINI_API_KEY is not configured'
      });
    }

    // GoogleGenAI 초기화
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    // 이미지 생성 설정
    const config = {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '3:4', // 프로필 사진에 적합한 비율
        imageSize: '1K'     // 1024x1024 정도 크기
      }
    };

    // 모델 이름
    const model = 'gemini-2.5-flash-image';

    // 컨텐츠 구성
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: selectedPrompt
          },
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType
            }
          }
        ]
      }
    ];

    // 이미지 생성 (스트리밍)
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents
    });

    // 스트림에서 이미지 데이터 수집
    let generatedImage = null;

    for await (const chunk of response) {
      // chunk 구조 확인
      if (!chunk.candidates || !chunk.candidates[0] || !chunk.candidates[0].content) {
        continue;
      }

      const parts = chunk.candidates[0].content.parts;
      if (!parts || parts.length === 0) {
        continue;
      }

      // 이미지 데이터 찾기
      for (const part of parts) {
        if (part.inlineData) {
          generatedImage = {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType || 'image/png'
          };
          break;
        }
      }

      // 이미지를 찾으면 루프 종료
      if (generatedImage) {
        break;
      }
    }

    // 이미지가 생성되지 않은 경우
    if (!generatedImage) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate image'
      });
    }

    // 성공 응답
    return res.status(200).json({
      success: true,
      image: generatedImage
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
