/**
 * Base Image Generator Interface
 * 모든 이미지 생성 모델의 추상 인터페이스
 */
export class BaseImageGenerator {
  /**
   * 이미지 생성
   * @param {Object} params - 생성 파라미터
   * @param {string} params.imageBase64 - Base64로 인코딩된 입력 이미지
   * @param {string} params.mimeType - 이미지 MIME 타입 (예: 'image/jpeg')
   * @param {string} params.prompt - 이미지 생성 프롬프트
   * @returns {Promise<{data: string, mimeType: string}>} Base64 이미지 데이터
   */
  async generate({ imageBase64, mimeType, prompt }) {
    throw new Error('generate() method must be implemented by subclass');
  }
}
