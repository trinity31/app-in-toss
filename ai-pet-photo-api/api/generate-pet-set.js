import { PET_PROMPTS } from "./prompts.js";
import { createGenerator } from "./generators/index.js";

// 세트에 포함할 9가지 스타일 (순서대로 생성)
const SET_STYLES = [
  { id: "figure", label: "피규어", model: "google/nano-banana-pro" },
  { id: "plush-toy", label: "봉제인형", model: "gemini-3.1-flash" },
  { id: "cartoon", label: "3D 캐릭터", model: "gemini-3.1-flash" },
  { id: "sticker", label: "스티커", model: "gemini-3.1-flash" },
  { id: "masterpiece", label: "명화", model: "gemini-3.1-flash" },
  { id: "disney-character", label: "디즈니", model: "gemini-3.1-flash" },
  { id: "looney-tunes", label: "루니툰", model: "gemini-3.1-flash" },
  { id: "royal", label: "귀족", model: "gemini-3.1-flash" },
  { id: "emoticon", label: "이모티콘", model: "gemini-3.1-flash" },
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
  if (req.method !== "POST")
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });

  try {
    console.log("=== 펫 세트 생성 API 요청 시작 ===");

    const {
      imageBase64,
      mimeType = "image/jpeg",
      count = 9,
      purchaseToken,
    } = req.body;

    if (!imageBase64) {
      return res
        .status(400)
        .json({ success: false, error: "imageBase64 is required" });
    }

    if (!purchaseToken) {
      return res.status(400).json({
        success: false,
        error: "purchaseToken is required. 결제 후 이용 가능합니다.",
      });
    }

    // TODO: 인앱결제 영수증 검증
    console.log("결제 토큰:", purchaseToken, "(검증 로직 TODO)");

    // styles 파라미터가 있으면 해당 스타일만 생성, 없으면 전체
    const { styles: requestedStyles } = req.body;
    const stylesToGenerate = requestedStyles?.length
      ? SET_STYLES.filter((s) => requestedStyles.includes(s.id))
      : SET_STYLES.slice(0, Math.min(count, SET_STYLES.length));
    console.log("생성 개수:", stylesToGenerate.length);

    // 병렬 생성
    const results = await Promise.allSettled(
      stylesToGenerate.map(async (style) => {
        const prompt = PET_PROMPTS[style.id];
        if (!prompt) throw new Error(`Unknown style: ${style.id}`);

        const MAX_RETRIES = 2;
        let lastError;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          try {
            if (attempt > 0)
              console.log(`[${style.label}] 재시도 ${attempt}/${MAX_RETRIES}`);
            else
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
          } catch (err) {
            lastError = err;
            console.error(
              `[${style.label}] 시도 ${attempt + 1} 실패:`,
              err.message,
            );
          }
        }
        throw lastError;
      }),
    );

    const images = [];
    const errors = [];

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        images.push(result.value);
      } else {
        errors.push({
          index: i,
          style: stylesToGenerate[i].id,
          label: stylesToGenerate[i].label,
          error: result.reason?.message,
        });
        console.error(
          `[${stylesToGenerate[i].label}] 실패:`,
          result.reason?.message,
        );
      }
    });

    console.log(
      `=== 펫 세트 생성 완료: ${images.length}/${stylesToGenerate.length} 성공 ===`,
    );

    if (images.length === 0) {
      return res.status(500).json({
        success: false,
        error: "모든 이미지 생성에 실패했습니다",
        errors,
      });
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
