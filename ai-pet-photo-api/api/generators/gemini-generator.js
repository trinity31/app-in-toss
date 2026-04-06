import { GoogleGenAI } from '@google/genai';
import { BaseImageGenerator } from './base-generator.js';

/**
 * Google Gemini Generator
 * Gemini 이미지 생성 모델 사용
 */
export class GeminiGenerator extends BaseImageGenerator {
  constructor(modelName = 'gemini-2.5-flash-image', config = null) {
    super();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.modelName = modelName;
    this.config = config;
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }

  async generate({ imageBase64, mimeType, prompt }) {
    try {
      console.log(`Gemini (${this.modelName}) 생성 시작...`);
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

      // 이미지 생성 파라미터 구성
      const generateParams = {
        model: this.modelName,
        contents: contents
      };

      // config에서 aspect_ratio와 resolution 추가
      if (this.config && this.config.params) {
        const imageConfig = {};

        if (this.config.params.aspect_ratio) {
          imageConfig.aspectRatio = this.config.params.aspect_ratio;
          console.log('Aspect ratio 설정:', this.config.params.aspect_ratio);
        }
        if (this.config.params.resolution) {
          imageConfig.imageSize = this.config.params.resolution;
          console.log('Resolution 설정:', this.config.params.resolution);
        }

        if (Object.keys(imageConfig).length > 0) {
          generateParams.config = {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: imageConfig
          };
        }
      }

      // 이미지 생성
      console.log('generateParams:', JSON.stringify({
        model: generateParams.model,
        config: generateParams.config,
        contentsLength: generateParams.contents.length
      }, null, 2));
      const response = await this.ai.models.generateContent(generateParams);

      // 응답에서 이미지 추출
      let generatedImage = null;

      if (response.candidates && response.candidates[0] && response.candidates[0].content) {
        const parts = response.candidates[0].content.parts || [];

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
      console.error('에러 상세:', JSON.stringify(error, null, 2));
      if (error.response) {
        console.error('API 응답:', error.response);
      }
      throw new Error(`Gemini generation failed: ${error.message}`);
    }
  }
}
