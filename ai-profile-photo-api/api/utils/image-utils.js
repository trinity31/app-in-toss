/**
 * 이미지 URL을 Base64로 변환
 * @param {string} imageUrl - 이미지 URL
 * @returns {Promise<string>} Base64로 인코딩된 이미지 데이터
 */
export async function urlToBase64(imageUrl) {
  try {
    console.log('URL에서 이미지 다운로드 중:', imageUrl);

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    console.log('이미지 변환 완료, 크기:', base64.length, 'bytes');

    return base64;
  } catch (error) {
    console.error('URL to Base64 변환 실패:', error);
    throw new Error(`Image conversion failed: ${error.message}`);
  }
}
