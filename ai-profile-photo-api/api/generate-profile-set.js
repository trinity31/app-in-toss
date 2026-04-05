import {
  VALID_PROFILE_TYPES,
  STYLE_VARIATIONS,
  getVariationPrompt,
} from "./prompts.js";
import {
  createGenerator,
  DEFAULT_MODEL,
  SUPPORTED_MODELS,
} from "./generators/index.js";

// 타입별 모델 매핑 (generate-profile-photo.js와 동일)
const TYPE_TO_MODEL_MAPPING = {
  sns: "gemini-3.1-flash",
  professional: "gemini-3.1-flash",
  artist: "gemini-3.1-flash",
  dating: "gemini-3.1-flash",
  nomad: "gemini-3.1-flash",
  doctor: "gemini-3.1-flash",
  wicked: "gemini-3.1-flash",
  creative: "gemini-3.1-flash",
};

const DEFAULT_SET_COUNT = 6;

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    "https://ai-profile-photo-studio.apps.tossmini.com",
    "https://ai-profile-photo-studio.private-apps.tossmini.com",
    "http://localhost:5173",
    "http://192.168.0.28:5173",
  ];
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log("=== 세트 생성 API 요청 시작 ===");

    const {
      imageBase64,
      mimeType = "image/jpeg",
      profileType = "professional",
      count = DEFAULT_SET_COUNT,
      purchaseToken,
    } = req.body;

    // 입력 검증
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: "imageBase64 is required",
      });
    }

    if (!purchaseToken) {
      return res.status(400).json({
        success: false,
        error: "purchaseToken is required. 결제 후 이용 가능합니다.",
      });
    }

    // TODO: 인앱결제 영수증 검증
    // 실제 구현 시 토스 인앱결제 서버 API로 purchaseToken 유효성 검증
    // const isValid = await verifyPurchase(purchaseToken);
    // if (!isValid) return res.status(403).json({ ... });
    console.log("결제 토큰:", purchaseToken, "(검증 로직 TODO)");

    // 프로필 타입 검증
    if (!VALID_PROFILE_TYPES.includes(profileType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid profileType: ${profileType}`,
      });
    }

    // 모델 선택
    const selectedModel = TYPE_TO_MODEL_MAPPING[profileType] || DEFAULT_MODEL;
    console.log("프로필 타입:", profileType);
    console.log("모델:", selectedModel);
    console.log("생성 개수:", count);

    // 변형 수 제한 (최대 6)
    const variationCount = Math.min(count, STYLE_VARIATIONS.length);

    // 6장 병렬 생성
    const generationPromises = Array.from({ length: variationCount }, async (_, i) => {
      const { prompt, variation } = getVariationPrompt(profileType, i);

      console.log(`[${i + 1}/${variationCount}] ${variation.label} 생성 시작...`);

      const generator = createGenerator(selectedModel);
      const generatedImage = await generator.generate({
        imageBase64,
        mimeType,
        prompt,
      });

      if (!generatedImage?.data) {
        throw new Error(`Variation ${variation.id}: 이미지 생성 실패`);
      }

      console.log(`[${i + 1}/${variationCount}] ${variation.label} 생성 완료`);

      return {
        id: variation.id,
        label: variation.label,
        data: generatedImage.data,
        mimeType: generatedImage.mimeType || "image/png",
      };
    });

    const results = await Promise.allSettled(generationPromises);

    // 성공/실패 분류
    const images = [];
    const errors = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        images.push(result.value);
      } else {
        errors.push({
          index: i,
          error: result.reason?.message || "Unknown error",
        });
        console.error(`[${i + 1}] 실패:`, result.reason?.message);
      }
    });

    console.log(`=== 세트 생성 완료: ${images.length}/${variationCount} 성공 ===`);

    if (images.length === 0) {
      return res.status(500).json({
        success: false,
        error: "모든 이미지 생성에 실패했습니다",
        errors,
      });
    }

    return res.status(200).json({
      success: true,
      profileType,
      model: selectedModel,
      images,
      totalRequested: variationCount,
      totalGenerated: images.length,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (error) {
    console.error("세트 생성 에러:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
