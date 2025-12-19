import { GoogleGenAI } from '@google/genai';
import { BaseImageGenerator } from './base-generator.js';

/**
 * Google Gemini Generator
 * Gemini 2.5 Flash Image 모델 사용
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
      console.log('Gemini 2.5 Flash Image 생성 시작...');
      console.log('프롬프트 길이:', prompt.length, 'chars');

      // 컨텐츠 구성
      const contents = [
        {
          text: prompt
        },
        {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        }
      ];

      // 이미지 생성
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: contents,
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      });

      // 응답에서 이미지 추출
      let generatedImage = null;

      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const parts = response.candidates[0].content.parts;

        for (const part of parts) {
          if (part.inlineData) {
            generatedImage = {
              data: part.inlineData.data,
              mimeType: part.inlineData.mimeType || 'image/png'
            };
            break;
          }
        }
      }

      // 이미지가 생성되지 않은 경우
      if (!generatedImage) {
        throw new Error('Gemini API did not return image data');
      }

      console.log('Gemini 생성 완료');

      return generatedImage;

    } catch (error) {
      console.error('Gemini 생성 실패:', error);
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }
}
