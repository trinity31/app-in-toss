/**
 * 샘플 이미지 생성 스크립트
 *
 * 사용법:
 *   GEMINI_API_KEY=your-key node scripts/generate-samples.js
 *
 * 결과:
 *   ../ai-profile-photo/src/assets/images/samples/{type}/{variation}.png
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUTPUT_DIR = path.resolve(
  __dirname,
  '../../ai-profile-photo/src/assets/images/samples'
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-image-preview';

// ── 공통 베이스 ──

const BASE = `
CRITICAL REQUIREMENTS:
- Generate a SINGLE person portrait photo, NOT a collage or grid
- The subject is an attractive Korean woman in her 40s
- Natural, elegant beauty — not overly retouched or plastic-looking
- Photorealistic quality, shot with a professional camera
- Vertical 2:3 aspect ratio, portrait orientation
- The image should make viewers think "I want my photo to look like this"
- High-end magazine editorial quality
`.trim();

// ── 타입별 프롬프트 ──

const TYPES = {
  sns: {
    title: 'SNS 프로필',
    base: `${BASE}
PROFILE TYPE: Bright, friendly SNS profile photo.
Natural, approachable vibe. Light makeup, effortlessly styled hair.
Smart casual attire — comfortable but stylish.`,
  },
  professional: {
    title: '전문가 프로필',
    base: `${BASE}
PROFILE TYPE: Premium executive business portrait.
Confident, powerful presence. Professional makeup, polished hair.
Well-tailored business suit or blazer. Arms crossed pose conveying leadership.`,
  },
  artist: {
    title: '아티스트 프로필',
    base: `${BASE}
PROFILE TYPE: Creative, free-spirited artist portrait.
Expressive, unique personality. Artistic makeup with character.
Trendy creative fashion. Relaxed, confident expression.`,
  },
  dating: {
    title: '소개팅 프로필',
    base: `${BASE}
PROFILE TYPE: Attractive, warm dating profile photo.
Charming, approachable beauty. Glowing skin, warm smile.
Stylish yet approachable outfit. Inviting, genuine expression.`,
  },
  nomad: {
    title: '디지털 노마드',
    base: `${BASE}
PROFILE TYPE: Free-spirited digital nomad portrait.
Sun-kissed, healthy glow. Minimal natural makeup.
Casual travel wear — linen, relaxed fabrics. Adventurous, happy expression.`,
  },
  doctor: {
    title: '의사 프로필',
    base: `${BASE}
PROFILE TYPE: Professional, trustworthy doctor portrait.
Clean, confident appearance. Minimal professional makeup.
White medical coat over professional attire. Arms crossed, authoritative yet caring.`,
  },
  wicked: {
    title: '위키드 프로필',
    base: `${BASE}
PROFILE TYPE: Enchanting, mystical Wicked-inspired portrait.
Dramatic theatrical beauty. Emerald green magical accents.
Elegant witch attire with pointed hat. Captivating, mysterious expression.`,
  },
};

// ── 변형별 서픽스 (6가지) ──

const VARIATIONS = [
  {
    id: 'warm-golden',
    suffix: `
STYLE: Warm golden hour lighting from the side. Soft amber glow on skin.
Background: Outdoor with warm sunset bokeh, golden tones.
Mood: Warm, radiant, inviting. Color grading: warm amber/gold.`,
  },
  {
    id: 'cool-studio',
    suffix: `
STYLE: Cool-toned professional studio lighting. Crisp, clean illumination.
Background: Clean grey or soft blue gradient studio backdrop.
Mood: Sharp, modern, polished. Color grading: cool blue/silver.`,
  },
  {
    id: 'natural-outdoor',
    suffix: `
STYLE: Bright natural daylight, open shade. Fresh and airy.
Background: Lush green garden or park with soft natural bokeh.
Mood: Fresh, vibrant, healthy. Color grading: fresh green/natural.`,
  },
  {
    id: 'elegant-dark',
    suffix: `
STYLE: Dramatic Rembrandt lighting, rich shadows on one side.
Background: Deep dark charcoal or navy with subtle warm accent.
Mood: Sophisticated, powerful, editorial. Color grading: high contrast, moody.`,
  },
  {
    id: 'soft-pastel',
    suffix: `
STYLE: Soft diffused front lighting, dreamy and ethereal.
Background: Soft pastel-toned (blush pink or lavender), minimal.
Mood: Gentle, elegant, feminine. Color grading: soft pastel tones.`,
  },
  {
    id: 'urban-street',
    suffix: `
STYLE: Natural city light with interesting shadows, street photography feel.
Background: Modern urban setting, trendy neighborhood or cafe.
Mood: Dynamic, contemporary, candid. Color grading: slightly desaturated urban tones.`,
  },
];

// ── 생성 로직 ──

async function generateImage(prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ text: prompt }],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: '2:3',
        imageSize: '1K',
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error('No response parts');

  for (const part of parts) {
    if (part.inlineData) {
      return Buffer.from(part.inlineData.data, 'base64');
    }
  }

  throw new Error('No image in response');
}

async function generateAll() {
  const typeIds = Object.keys(TYPES);
  let total = typeIds.length * VARIATIONS.length;
  let done = 0;
  let failed = 0;

  console.log(`\n🎨 샘플 이미지 생성 시작: ${typeIds.length}개 타입 × ${VARIATIONS.length}개 변형 = ${total}장\n`);

  for (const typeId of typeIds) {
    const typeDir = path.join(OUTPUT_DIR, typeId);
    fs.mkdirSync(typeDir, { recursive: true });

    const { title, base } = TYPES[typeId];

    for (const variation of VARIATIONS) {
      const filename = `${variation.id}.png`;
      const filepath = path.join(typeDir, filename);

      // 이미 생성된 파일 스킵
      if (fs.existsSync(filepath)) {
        console.log(`⏭️  [${typeId}/${variation.id}] 이미 존재 — 스킵`);
        done++;
        continue;
      }

      const prompt = `${base}\n${variation.suffix}`;

      try {
        console.log(`🔄 [${done + 1}/${total}] ${title} — ${variation.id} 생성 중...`);
        const imageBuffer = await generateImage(prompt);
        fs.writeFileSync(filepath, imageBuffer);
        done++;
        console.log(`✅ [${done}/${total}] ${filepath}`);
      } catch (err) {
        failed++;
        done++;
        console.error(`❌ [${done}/${total}] ${typeId}/${variation.id} 실패:`, err.message);
      }

      // API rate limit 방지
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n🏁 완료: ${done - failed}/${total} 성공, ${failed}개 실패\n`);
}

generateAll().catch(console.error);
