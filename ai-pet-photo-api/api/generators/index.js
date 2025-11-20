import { GeminiGenerator } from './gemini-generator.js';
import { ReplicateGenerator } from './replicate-generator.js';
import { MODEL_CONFIGS, DEFAULT_MODEL, SUPPORTED_MODELS } from './model-configs.js';

/**
 * Generator 팩토리 함수
 * @param {string} model - 모델 이름
 * @returns {BaseImageGenerator} 이미지 생성기 인스턴스
 */
export function createGenerator(model = DEFAULT_MODEL) {
  console.log('Generator 생성:', model);

  // Gemini SDK 직접 사용
  if (model === 'gemini-sdk') {
    return new GeminiGenerator();
  }

  // Replicate 기반 모델 (google/nano-banana 포함)
  const modelConfig = MODEL_CONFIGS[model];

  if (!modelConfig) {
    throw new Error(`Unknown model: ${model}. Supported models: ${SUPPORTED_MODELS.join(', ')}`);
  }

  return new ReplicateGenerator(modelConfig);
}

// Export 설정들
export { MODEL_CONFIGS, DEFAULT_MODEL, SUPPORTED_MODELS };
