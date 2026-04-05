import { GoogleGenAI } from '@google/genai';
import { BaseImageGenerator } from './base-generator.js';

/**
 * Gemini Image Generator
 * Google Gemini 2.5 Flash를 사용한 이미지 생성
 */
export class GeminiGenerator extends BaseImageGenerator {
  constructor(modelName) {
    super();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    this.modelName = modelName || 'gemini-3-pro-image-preview';
  }

  async generate({ imageBase64, images, mimeType, prompt }) {
    try {
      console.log('Gemini 생성 시작...');

      // 컨텐츠 구성 - 다중 이미지 지원
      const contents = [
        {
          text: prompt
        }
      ];

      // 다중 이미지가 있으면 모두 추가
      if (images && images.length > 0) {
        console.log(`다중 이미지 처리: ${images.length}장`);
        images.forEach((img, index) => {
          contents.push({
            inlineData: {
              mimeType: img.mimeType || 'image/jpeg',
              data: img.imageBase64
            }
          });
          console.log(`이미지 ${index + 1} 추가됨`);
        });
      } else if (imageBase64) {
        // 단일 이미지
        console.log('단일 이미지 처리');
        contents.push({
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        });
      }

      // 이미지 생성
      console.log('Gemini 모델:', this.modelName);
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: '2:3',
            imageSize: '1K'
          }
        }
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
