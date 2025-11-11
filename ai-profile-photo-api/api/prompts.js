// 용도별 프로필 사진 생성 프롬프트

export const PROFILE_PROMPTS = {
  // 1. SNS 프로필 - 밝고 친근한 느낌
  sns: `
Transform this casual selfie into a vibrant, friendly SNS profile photo.
Create bright, natural lighting that enhances facial features with a warm, approachable feel.
Apply light, natural makeup - fresh skin tone, subtle lip color, and natural eye definition.
Style hair to look effortlessly good - casual yet well-groomed, with natural movement and volume.
Dress in smart casual attire - comfortable but stylish, like a nice sweater, casual blazer, or fashionable top.
Use a clean, softly blurred background with warm tones or subtle patterns that complement the subject.
Capture a genuine, friendly expression with a natural smile and warm eyes.
Bright, cheerful atmosphere, natural daylight feel, high resolution, authentic and relatable look.
`,

  // 2. 전문가 프로필 - 신뢰감과 전문성
  professional: `
Transform this casual selfie into a professional business portrait.
Enhance lighting with sophisticated studio illumination that conveys trust and professionalism.
Apply polished natural makeup - flawless even skin tone, professional lip color, refined eye definition.
Style hair in a neat, professional manner - well-groomed, polished, and business-appropriate.
Replace casual clothing with formal business attire - tailored suit, crisp shirt, or elegant blazer.
Use a clean, neutral background in professional colors (grey, navy, or subtle gradient) that conveys authority.
Maintain a confident, approachable expression with a professional smile.
Crisp lighting, corporate aesthetic, ultra-high resolution, LinkedIn-worthy professional look.
`,

  // 3. 아티스트 프로필 - 자유분방하고 개성있는
  artist: `
Transform this casual selfie into a stylish, free-spirited artist profile photo.
Create natural, flattering lighting with soft shadows that adds depth and dimension without being overly dramatic.
Apply tasteful makeup that enhances natural features - subtle yet distinctive, expressing personal style.
Style hair in a relaxed, effortlessly cool way - slightly tousled, natural volume, creative but wearable style.
Dress in trendy, creative casual wear - unique fashion sense and personal style.
Use an urban or creative random background - cozy studio space, artistic cafe, or neutral backdrop with character.
Capture a confident, relaxed expression with a subtle smile or thoughtful gaze that shows personality.
Natural yet stylish lighting, modern artistic vibe, high resolution, authentic and cool aesthetic.
`,

  // 4. 소개팅 프로필 - 매력적이고 따뜻한
  dating: `
Transform this casual selfie into an attractive, warm dating profile photo.
Create soft, flattering lighting that highlights best features with a warm, inviting glow.
Apply charming, natural makeup - glowing skin, attractive lip color, eyes that sparkle with warmth.
Style hair to look attractive and approachable - soft, romantic, with natural volume and movement.
Dress in attractive casual wear - stylish but approachable, like a nice dress, fitted shirt, or elegant casual outfit.
Use a pleasant background that suggests personality - cozy cafe, outdoor setting, or warm interior with soft bokeh.
Capture a genuine, warm smile with friendly, inviting eyes that convey approachability.
Soft, romantic lighting, warm color tones, high resolution, attractive and genuine look.
`,

  // 5. 웨딩 프로필 - 우아하고 로맨틱한
  wedding: `
Transform this casual selfie into an elegant, romantic wedding-style portrait.
Create soft, dreamy lighting with gentle highlights that give an ethereal, romantic glow.
Apply elegant bridal makeup - luminous skin, soft romantic colors, timeless beauty enhancement.
Style hair in an elegant, romantic manner - sophisticated updo or soft romantic waves, wedding-appropriate.
Dress in elegant, formal attire with romantic elements - soft fabrics, elegant necklines, or classic formal wear.
Use a romantic background with soft, dreamy elements - soft pastels, delicate bokeh, or elegant simplicity.
Capture a serene, joyful expression with a gentle smile and soft, loving eyes.
Soft, romantic lighting, dreamy atmosphere, ultra-high resolution, timeless elegant beauty.
`,

  // 6. 디지털 노마드 프로필 - 자유로운 영혼
  nomad: `
Transform this casual selfie into a free-spirited, adventurous digital nomad profile photo.
Create bright, natural outdoor lighting with a tropical or beachy feel - warm sunlight, breezy atmosphere, vacation vibes.
Apply minimal, sun-kissed makeup - healthy glowing skin, natural beach-ready look, effortless and fresh.
Style hair in a relaxed, carefree way - windswept, natural waves, tousled beach hair, or casually tied up, low-maintenance travel style.
Dress in casual comfortable travel wear - relaxed t-shirt, linen shirt, tank top, casual summer clothing, or comfortable everyday travel attire.
Use a tropical lifestyle background - beach setting with palm trees, seaside cafe with ocean view, resort poolside workspace, coastal scenery, or laptop on beach table with tropical drinks, suggesting remote work paradise.
Capture a genuinely happy, free-spirited expression with a relaxed smile, eyes full of wanderlust and adventure.
Natural sunlight, tropical vacation atmosphere, beachy lifestyle aesthetic, high resolution, authentic freedom and adventure vibe.
`
};

// 기본 프롬프트 (타입이 지정되지 않은 경우)
export const DEFAULT_PROMPT = PROFILE_PROMPTS.professional;

// 유효한 프로필 타입 목록
export const VALID_PROFILE_TYPES = Object.keys(PROFILE_PROMPTS);
