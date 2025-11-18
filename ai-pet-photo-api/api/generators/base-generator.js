/**
 * 이미지 생성기 베이스 클래스
 * 모든 Generator는 이 클래스를 상속받아 구현
 */
export class BaseImageGenerator {
  /**
   * 이미지 생성 메서드
   * @param {Object} params - 생성 파라미터
   * @param {string} params.imageBase64 - Base64 인코딩된 이미지
   * @param {string} params.mimeType - 이미지 MIME 타입
   * @param {string} params.prompt - 생성 프롬프트
   * @returns {Promise<{data: string, mimeType: string}>} 생성된 이미지 정보
   */
  async generate({ imageBase64, mimeType, prompt }) {
    throw new Error('generate() method must be implemented by subclass');
  }
}
