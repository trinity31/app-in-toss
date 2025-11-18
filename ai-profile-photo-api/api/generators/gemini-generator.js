import { GoogleGenAI } from '@google/genai';
import { BaseImageGenerator } from './base-generator.js';

/**
 * Gemini Image Generator
 * Google Gemini 2.5 Flash를 사용한 이미지 생성
 */
export class GeminiGenerator extends BaseImageGenerator {
  constructor() {
    super();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  async generate({ imageBase64, mimeType, prompt }) {
    try {
      console.log('Gemini 생성 시작...');

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
              text: prompt
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
      const response = await this.ai.models.generateContentStream({
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
        throw new Error('Failed to generate image from Gemini');
      }

      console.log('Gemini 생성 완료');

      return generatedImage;

    } catch (error) {
      console.error('Gemini 생성 실패:', error);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }
}
