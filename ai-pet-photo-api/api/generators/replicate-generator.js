import Replicate from 'replicate';
import { BaseImageGenerator } from './base-generator.js';
import { urlToBase64 } from '../utils/image-utils.js';

/**
 * Replicate 통합 Generator
 * 다양한 Replicate 모델을 지원하는 통합 생성기
 */
export class ReplicateGenerator extends BaseImageGenerator {
  constructor(modelConfig) {
    super();

    if (!process.env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is not configured');
    }

    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    this.modelConfig = modelConfig;
  }

  async generate({ imageBase64, mimeType, prompt }) {
    try {
      console.log(`${this.modelConfig.name} 생성 시작...`);
      console.log('프롬프트 길이:', prompt.length, 'chars');

      // Base64를 data URL로 변환
      const imageDataUrl = `data:${mimeType};base64,${imageBase64}`;

      // 모델별 입력 파라미터 구성
      const input = this.buildInput(imageDataUrl, prompt);

      // Replicate API 호출
      console.log('Replicate API 호출 중...', this.modelConfig.model);
      const output = await this.replicate.run(
        this.modelConfig.model,
        { input }
      );

      console.log(`${this.modelConfig.name} API 응답:`, typeof output, Array.isArray(output) ? `배열(${output.length}개)` : '단일값');

      // output은 URL 배열 또는 단일 URL
      const imageUrl = Array.isArray(output) ? output[0] : output;

      if (!imageUrl) {
        throw new Error(`${this.modelConfig.name} API did not return image URL`);
      }

      console.log('이미지 URL:', imageUrl);

      // URL에서 이미지 다운로드 및 Base64 변환
      const base64Data = await urlToBase64(imageUrl);

      console.log(`${this.modelConfig.name} 생성 완료`);

      return {
        data: base64Data,
        mimeType: 'image/png'
      };

    } catch (error) {
      console.error(`${this.modelConfig.name} 생성 실패:`, error);

      // Replicate 특정 에러 메시지 개선
      if (error.message && error.message.includes('Failed to fetch')) {
        throw new Error(`${this.modelConfig.name} API connection failed: ${error.message}`);
      }

      throw new Error(`${this.modelConfig.name} generation failed: ${error.message}`);
    }
  }

  /**
   * 모델별 입력 파라미터 구성
   */
  buildInput(imageDataUrl, prompt) {
    const { params } = this.modelConfig;

    // 기본 입력 구성
    const input = {
      ...params,
      prompt: prompt
    };

    // 이미지 파라미터 추가 (모델별로 다름)
    const imageValue = params.imageAsArray ? [imageDataUrl] : imageDataUrl;

    if (params.imageField === 'image') {
      input.image = imageValue;
    } else if (params.imageField === 'images') {
      input.images = [imageDataUrl];
    } else if (params.imageField === 'input_image') {
      input.input_image = imageValue;
    } else if (params.imageField === 'image_input') {
      input.image_input = imageValue;
    }

    // 내부 설정 제거
    delete input.imageField;
    delete input.imageAsArray;

    return input;
  }
}
