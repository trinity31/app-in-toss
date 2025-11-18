/**
 * 이미지 유틸리티 함수들
 */

/**
 * URL에서 이미지를 다운로드하여 Base64로 변환
 * @param {string} imageUrl - 이미지 URL
 * @returns {Promise<string>} Base64 인코딩된 이미지 데이터
 */
export async function urlToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return buffer.toString('base64');
  } catch (error) {
    console.error('URL to Base64 변환 실패:', error);
    throw new Error(`Failed to convert URL to Base64: ${error.message}`);
  }
}
