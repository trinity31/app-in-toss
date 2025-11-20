/**
 * Replicate 모델 설정
 * 각 모델의 파라미터와 설정을 정의
 */

export const MODEL_CONFIGS = {
  // SeedEdit 3.0 - 고품질 이미지 편집
  'seededit': {
    name: 'SeedEdit 3.0',
    model: 'bytedance/seededit-3.0',
    params: {
      imageField: 'image',
      seed: 42,
      guidance_scale: 7.5,
      num_inference_steps: 50,
      negative_prompt: "worst quality, low quality, normal quality, lowres, bad anatomy, bad hands, multiple eyebrow, cropped, extra limb, missing limbs, deformed hands, long neck, long body, bad hands, signature, username, artist name, conjoined fingers, deformed fingers, ugly eyes, imperfect eyes, skewed eyes, unnatural face, stiff face, stiff body, unbalanced body, unnatural body"
    }
  },

  // Flux Pro - 최고품질
  'flux-pro': {
    name: 'Flux Pro',
    model: 'black-forest-labs/flux-pro',
    params: {
      imageField: 'image',
      num_inference_steps: 25,
      guidance_scale: 3.0,
      output_format: "png",
      aspect_ratio: "3:4"
    }
  },

  // Gemini 2.5 Flash (Replicate via nano-banana)
  'gemini-flash': {
    name: 'Gemini 2.5 Flash',
    model: 'google/nano-banana',
    params: {
      imageField: 'image',
      num_inference_steps: 20,
      guidance_scale: 7.5,
      output_format: "png"
    }
  },

  // Google Nano Banana - Replicate API 사용
  'google/nano-banana': {
    name: 'Gemini 2.5 Flash Image',
    model: 'google/gemini-2.5-flash-image',
    params: {
      imageField: 'image_input',
      imageAsArray: true,
      aspect_ratio: 'match_input_image',
      output_format: 'jpg'
    }
  },

  // Qwen Image Edit Plus
  'qwen': {
    name: 'Qwen Image Edit Plus',
    model: 'qwen/qwen-image-edit-plus',
    params: {
      imageField: 'image',
      imageAsArray: true, // image 필드지만 배열로 전달
      num_inference_steps: 30,
      guidance_scale: 7.5,
      seed: -1,
      output_format: "png"
    }
  },

  // SDXL (안정적인 기본 모델)
  'sdxl': {
    name: 'Stable Diffusion XL',
    model: 'stability-ai/sdxl',
    params: {
      imageField: 'image',
      num_inference_steps: 40,
      guidance_scale: 7.5,
      scheduler: "K_EULER",
      refine: "expert_ensemble_refiner"
    }
  }
};

// 기본 모델
export const DEFAULT_MODEL = 'google/nano-banana';

// 지원되는 모델 목록
export const SUPPORTED_MODELS = Object.keys(MODEL_CONFIGS);
