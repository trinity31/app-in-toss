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

/**
 * 이미지를 특정 파일 크기 이하로 압축
 * @param {string} base64Data - Base64 인코딩된 이미지
 * @param {string} mimeType - 이미지 MIME 타입
 * @param {number} maxSizeKB - 최대 파일 크기 (KB)
 * @returns {Promise<string>} 압축된 Base64 이미지
 */
export async function compressImageToSizeLimit(base64Data, mimeType, maxSizeKB) {
  try {
    const sharp = (await import('sharp')).default;

    // Base64 → Buffer 변환
    let buffer = Buffer.from(base64Data, 'base64');
    let currentSizeKB = buffer.length / 1024;

    console.log(`이미지 압축 시작: ${currentSizeKB.toFixed(2)}KB → 목표: ${maxSizeKB}KB`);

    // 이미 제한 이하면 그대로 반환
    if (currentSizeKB <= maxSizeKB) {
      console.log('이미지가 이미 크기 제한 이하입니다.');
      return base64Data;
    }

    // Sharp 객체 생성
    let image = sharp(buffer);
    const metadata = await image.metadata();

    // 단계 1: 품질 조정 (85 → 80 → 75 → 70 → 65 → 60)
    const qualityLevels = [85, 80, 75, 70, 65, 60];
    for (const quality of qualityLevels) {
      buffer = await sharp(buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      currentSizeKB = buffer.length / 1024;
      console.log(`품질 ${quality}% 압축: ${currentSizeKB.toFixed(2)}KB`);

      if (currentSizeKB <= maxSizeKB) {
        return buffer.toString('base64');
      }
    }

    // 단계 2: 리사이징 (품질 60% 유지하며 크기 축소)
    let width = metadata.width;
    let height = metadata.height;
    const resizeSteps = [0.9, 0.8, 0.7, 0.6, 0.5];

    for (const scale of resizeSteps) {
      const newWidth = Math.floor(width * scale);
      const newHeight = Math.floor(height * scale);

      buffer = await sharp(buffer)
        .resize(newWidth, newHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 60, mozjpeg: true })
        .toBuffer();

      currentSizeKB = buffer.length / 1024;
      console.log(`리사이징 ${(scale * 100).toFixed(0)}% (${newWidth}x${newHeight}): ${currentSizeKB.toFixed(2)}KB`);

      if (currentSizeKB <= maxSizeKB) {
        return buffer.toString('base64');
      }
    }

    // 단계 3: 마지막 수단 - 더 공격적인 압축
    const aggressiveQuality = [50, 40, 30];
    for (const quality of aggressiveQuality) {
      buffer = await sharp(buffer)
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      currentSizeKB = buffer.length / 1024;
      console.log(`공격적 압축 ${quality}%: ${currentSizeKB.toFixed(2)}KB`);

      if (currentSizeKB <= maxSizeKB) {
        return buffer.toString('base64');
      }
    }

    // 최종적으로 500KB를 맞추지 못했더라도 최대한 압축된 결과 반환
    console.warn(`최대 압축 후에도 목표 크기 초과: ${currentSizeKB.toFixed(2)}KB`);
    return buffer.toString('base64');

  } catch (error) {
    console.error('이미지 압축 실패:', error);
    throw new Error(`이미지 압축 실패: ${error.message}`);
  }
}
