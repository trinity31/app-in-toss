import { PET_PROMPTS } from "./prompts.js";
import { createGenerator, SUPPORTED_MODELS } from "./generators/index.js";

// 세트에 포함할 9가지 스타일 (순서대로 생성)
const SET_STYLES = [
  { id: 'figure',           label: '피규어',      model: 'google/nano-banana' },
  { id: 'plush-toy',        label: '봉제인형',    model: 'google/nano-banana' },
  { id: 'cartoon',          label: '3D 캐릭터',   model: 'google/nano-banana' },
  { id: 'masterpiece',      label: '명화',        model: 'google/nano-banana' },
  { id: 'disney-character', label: '디즈니',      model: 'google/nano-banana' },
  { id: 'superhero',        label: '슈퍼히어로',  model: 'seededit' },
  { id: 'royal',            label: '귀족',        model: 'google/nano-banana' },
  { id: 'sticker',          label: '스티커',      model: 'google/nano-banana' },
  { id: 'angel',            label: '천사',        model: 'seededit' },
];

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    "https://ai-pet-studio.apps.tossmini.com",
    "https://ai-pet-studio.private-apps.tossmini.com",
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

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    console.log("=== 펫 세트 생성 API 요청 시작 ===");

    const {
      imageBase64,
      mimeType = "image/jpeg",
      count = 9,
      purchaseToken,
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "imageBase64 is required" });
    }

    if (!purchaseToken) {
      return res.status(400).json({ success: false, error: "purchaseToken is required. 결제 후 이용 가능합니다." });
    }

    // TODO: 인앱결제 영수증 검증
    console.log("결제 토큰:", purchaseToken, "(검증 로직 TODO)");

    const stylesToGenerate = SET_STYLES.slice(0, Math.min(count, SET_STYLES.length));
    console.log("생성 개수:", stylesToGenerate.length);

    // 병렬 생성
    const results = await Promise.allSettled(
      stylesToGenerate.map(async (style) => {
        const prompt = PET_PROMPTS[style.id];
        if (!prompt) throw new Error(`Unknown style: ${style.id}`);

        console.log(`[${style.label}] 생성 시작 (model: ${style.model})`);

        const generator = createGenerator(style.model);
        const generatedImage = await generator.generate({
          imageBase64,
          mimeType,
          prompt,
        });

        if (!generatedImage?.data) {
          throw new Error(`${style.label}: 이미지 생성 실패`);
        }

        console.log(`[${style.label}] 생성 완료`);

        return {
          id: style.id,
          label: style.label,
          data: generatedImage.data,
          mimeType: generatedImage.mimeType || "image/png",
        };
      })
    );

    const images = [];
    const errors = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        images.push(result.value);
      } else {
        errors.push({ index: i, style: stylesToGenerate[i].id, error: result.reason?.message });
        console.error(`[${stylesToGenerate[i].label}] 실패:`, result.reason?.message);
      }
    });

    console.log(`=== 펫 세트 생성 완료: ${images.length}/${stylesToGenerate.length} 성공 ===`);

    if (images.length === 0) {
      return res.status(500).json({ success: false, error: "모든 이미지 생성에 실패했습니다", errors });
    }

    return res.status(200).json({
      success: true,
      images,
      totalRequested: stylesToGenerate.length,
      totalGenerated: images.length,
      ...(errors.length > 0 ? { errors } : {}),
    });
  } catch (error) {
    console.error("펫 세트 생성 에러:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}
