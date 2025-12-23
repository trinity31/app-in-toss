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
      negative_prompt: "worst quality, low quality, normal quality, lowres, bad anatomy, bad hands, multiple eyebrow, cropped, extra limb, missing limbs, deformed hands, long neck, long body, bad hands, signature, username, artist name, conjoined fingers, deformed fingers, ugly eyes, imperfect eyes, skewed eyes, unnatural face, stiff face, stiff body, unbalanced body, unnatural body, rotated, tilted, upside down, diagonal composition, blurry, grotesque, disturbing, scary, horror"
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
      aspect_ratio: '2:3',
      output_format: 'jpg'
      // Note: Gemini does not support negative_prompt parameter
      // Quality control is handled through detailed positive prompts and safety settings
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
      output_format: "png",
      negative_prompt: "worst quality, low quality, bad anatomy, distorted features, deformed body, ugly, bad proportions, extra limbs, missing limbs, rotated, tilted, upside down, blurry, grotesque, disturbing, scary, signature, watermark"
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
      refine: "expert_ensemble_refiner",
      negative_prompt: "worst quality, low quality, bad anatomy, distorted features, deformed body, ugly, bad proportions, extra limbs, missing limbs, rotated, tilted, upside down, blurry, grotesque, disturbing, scary, signature, watermark"
    }
  },

  // Sana - Nvidia의 고효율 이미지 생성 모델
  'sana': {
    name: 'Sana',
    model: 'nvidia/sana',
    params: {
      imageField: 'image',
      num_inference_steps: 20,
      guidance_scale: 5.0,
      output_format: "png",
      negative_prompt: "worst quality, low quality, bad anatomy, distorted features, deformed body, ugly, bad proportions, extra limbs, missing limbs, rotated, tilted, upside down, blurry, grotesque, disturbing, scary, signature, watermark"
    }
  },

  // Flux Pro 2 - 최고품질 이미지 생성 (크리스마스 카드, 연하장)
  'flux-pro-2': {
    name: 'Flux Pro 2',
    model: 'black-forest-labs/flux-2-pro',
    params: {
      imageField: 'input_images',
      imageAsArray: true,
      resolution: '1 MP',
      aspect_ratio: '2:3',
      output_format: 'jpg',
      output_quality: 90,
      safety_tolerance: 2,
      guidance: 4.0,
      num_inference_steps: 40
    }
  }
};

// 기본 모델
export const DEFAULT_MODEL = 'google/nano-banana';

// 지원되는 모델 목록
export const SUPPORTED_MODELS = Object.keys(MODEL_CONFIGS);
