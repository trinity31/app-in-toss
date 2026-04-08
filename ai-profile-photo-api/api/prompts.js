// 용도별 프로필 사진 생성 프롬프트

// 프로필 타입 메타데이터
export const PROFILE_TYPES_METADATA = {
  sns: {
    title: 'SNS 프로필',
    description: '밝고 친근한 느낌',
    icon: 'u1F4F1.png' // 📱
  },
  professional: {
    title: '전문가 프로필',
    description: '취업·비즈니스용',
    icon: 'u1F4BC.png' // 💼
  },
  artist: {
    title: '아티스트 프로필',
    description: '창의적이고 개성있는',
    icon: 'u1F3A8.png' // 🎨
  },
  dating: {
    title: '소개팅 프로필',
    description: '매력적이고 따뜻한',
    icon: 'u1F496.png' // 💖
  },
  nomad: {
    title: '디지털 노마드',
    description: '자유롭고 모던한',
    icon: 'u2708.png' // ✈️
  },
  doctor: {
    title: '의사 프로필',
    description: '전문적이고 신뢰감 있는',
    icon: 'u1FA7A.png' // 🩺
  },
  wicked: {
    title: '위키드 프로필',
    description: '매력적이고 신비로운',
    icon: 'u1F9D9-u200D-u2640-uFE0F.png' // 🧙‍♀️
  },
  creative: {
    title: '크리에이티브',
    description: '나를 다른 세계로 변신!',
    icon: 'u2728.png' // ✨
  }
};

// 연하장 공통 프롬프트 (DRY 원칙)
const NEW_YEAR_CARD_COMMON_PROMPT = `
CRITICAL IDENTITY PRESERVATION:
- Use the input image(s) as PRIMARY REFERENCE(S)
- The person/people in the output MUST be the EXACT SAME individual(s) from the input photo(s)
- Preserve same face(s), same facial features, same expressions completely
- PRESERVE THE EXACT FACIAL FEATURES: Keep the person's/people's face(s) identical to the original(s)
- MAINTAIN ORIGINAL IDENTITY: The person/people must be instantly recognizable
- KEEP NATURAL APPEARANCE: Transform to the specified style but preserve their unique features
- NO ARTIFICIAL CHANGES: Keep their authentic appearance in the transformed style

CLOTHING AND STYLING TRANSFORMATION:
- REPLACE the original clothing with festive, style-appropriate attire
- DO NOT keep casual clothing like tracksuits, t-shirts, or everyday wear from the input photos
- Dress each person in elegant, celebratory outfits that match the card's artistic style
- The clothing should feel festive, special, and appropriate for a New Year greeting card
- Maintain the person's body proportions and pose, only changing the clothing style

CARD LAYOUT AND COMPOSITION (CRITICAL):
- VERTICAL GREETING CARD FORMAT with proper margins and breathing room
- Position subjects in the LOWER TWO-THIRDS of the card (bottom 60-70% of the image)
- Reserve the UPPER THIRD (top 30-40%) for the greeting text and decorative sky/background
- Subjects should be MEDIUM SIZE - not too large, leaving generous space around them
- Include a rich, detailed BACKGROUND SCENE that fills the card:
  * For multiple people: arrange them naturally in a group, well-spaced
  * Background should be atmospheric and festive with appropriate scenery
  * Add environmental elements: scenery, decorative objects, celebratory elements
  * Create depth with foreground, midground, and background layers
- GENEROUS MARGINS on all sides (at least 10-15% padding from edges)
- BALANCED COMPOSITION with subjects not filling the entire frame

TEXT PLACEMENT REQUIREMENTS:
- Include "2026" and Korean New Year greeting "새해 복 많이 받으세요" in the UPPER PORTION of the card
- "2026" should be placed prominently (can be above or integrated with the Korean greeting)
- Position text at approximately 15-25% from the top edge
- Text must be FULLY CONTAINED within the image boundaries - NO text cutoff
- Leave clear space above and around the text
- Text should be clearly readable with proper contrast
- Text style should match the artistic style of the card
- Use elegant Korean font that suits the greeting card style

QUALITY STANDARDS:
- Professional greeting card printing quality with sharp focus
- Natural proportions and appealing composition
- Clean, polished rendering with festive effects
- Rich but balanced colors appropriate for New Year aesthetics
- High resolution output suitable for sharing and printing
`;

export const PROFILE_PROMPTS = {
  // 연하장 3가지 스타일
  'new-year-card-illustration': NEW_YEAR_CARD_COMMON_PROMPT + `

ILLUSTRATION STYLE SPECIFIC:
Transform this person/people into a beautiful 2026 New Year greeting card with a simple, warm illustration style.
Create a soft, heartwarming illustration that feels gentle and welcoming - like watercolor or pastel art.

VISUAL STYLE:
- Simple, clean lines with soft edges and warm tones
- Watercolor or pastel-like texture with gentle color gradients
- Minimalist approach with focus on warmth and emotion
- Hand-drawn illustration quality with artistic brushstrokes
- Warm color palette: soft oranges, gentle yellows, warm browns, cream whites

CLOTHING STYLE FOR ILLUSTRATION:
- Dress people in cozy, elegant winter attire: soft knit sweaters, cardigans, turtlenecks
- Use warm, muted colors: beige, cream, soft brown, warm gray, dusty rose
- Simple, comfortable yet refined clothing that matches the gentle illustration style
- Avoid patterns - prefer solid colors or subtle textures
- The clothing should feel warm and inviting, like a cozy winter gathering

BACKGROUND AND ATMOSPHERE:
- Soft, dreamy background with warm seasonal scenery (winter garden, cozy indoor setting, or gentle outdoor scene)
- Add subtle decorative touches: simple flowers, soft light rays, gentle patterns, winter elements
- Create a warm, inviting atmosphere with lots of negative space
- Keep the illustration simple and uncluttered but with complete scene composition

LIGHTING AND EFFECTS:
- Apply soft, diffused lighting - warm golden hour glow or gentle morning light
- Add subtle effects like soft bokeh, gentle sparkles, or warm light particles
- Capture gentle, warm expressions that convey hope and happiness

TEXT STYLING:
- Place "2026" and "새해 복 많이 받으세요" at the top in simple, elegant handwritten-style Korean font
- "2026" can be displayed above or near the Korean greeting
- Soft contrast that matches the warm illustration style
- Text naturally integrated into the artwork with proper spacing
`,

  'new-year-card-minhwa': NEW_YEAR_CARD_COMMON_PROMPT + `

KOREAN MINHWA FOLK PAINTING STYLE SPECIFIC:
Transform this person/people into a beautiful 2026 Korean New Year greeting card in authentic Joseon Dynasty Minhwa (Folk Painting) style.
Create an authentic Korean folk art illustration with bold outlines, flat color areas, and decorative traditional elements.

VISUAL STYLE:
- Authentic Korean Minhwa folk painting style with flat, decorative rendering
- Bold black outlines around shapes typical of traditional folk art
- Stylized, decorative treatment of all elements including the people
- Traditional Korean paper (한지) texture feel
- Traditional Korean color palette: vibrant reds, royal blues, jade greens, golden yellows, pure whites

CLOTHING STYLE FOR MINHWA:
- Dress people in traditional Korean hanbok (한복) - elegant jeogori (저고리) and chima/baji
- Use traditional Korean colors: lucky reds, royal blues, jade greens, prosperity golds
- Include traditional hanbok accessories: norigae (노리개), binyeo (비녀) hair ornaments
- The clothing should feel elegant, traditional, and festive in authentic Korean style
- Can add traditional elements like bojagi (복주머니) lucky bags

BACKGROUND AND ATMOSPHERE:
- Korean Minhwa background elements: stylized pine trees (소나무), magpies (까치), plum blossoms (매화)
- Include traditional Korean lucky symbols: the sun and moon (일월), mountains (산), cranes (학)
- Add ten longevity symbols (십장생): deer, turtles, bamboo, clouds
- Traditional patterns: dancheong (단청) patterns, traditional borders
- Create a symbolic, auspicious composition following Minhwa conventions

DECORATIVE ELEMENTS:
- Tigers (호랑이) in friendly Minhwa style, peonies (모란), clouds (구름), water waves (물결)
- Traditional Korean patterns and borders with decorative frames
- Pine, bamboo, and plum (세한삼우) as auspicious symbols

LIGHTING AND EFFECTS:
- Apply traditional Korean art lighting - bright, clear, with symbolic golden accents
- Add decorative effects like stylized clouds, floating blossoms, auspicious patterns
- Capture dignified, warm expressions that convey traditional Korean New Year blessings

TEXT STYLING:
- Place "2026" and "새해 복 많이 받으세요" at the top in traditional Korean calligraphy or seal script style
- "2026" can be displayed above or near the Korean greeting with traditional styling
- Text harmonizes with Minhwa aesthetics - can include decorative seal stamps (도장)
- Text clearly readable while matching the traditional Korean folk art aesthetic
`,

  'new-year-card-clay': NEW_YEAR_CARD_COMMON_PROMPT + `

3D CLAY/CLAYMATION STYLE SPECIFIC:
Transform this person/people into a cute 2026 New Year greeting card with 3D clay/claymation stop-motion animation style.
Create an adorable clay figure composition that looks like a real clay sculpture photographed in a miniature set.

VISUAL STYLE:
- 3D clay/polymer clay styling with smooth rounded surfaces and soft matte texture
- Visible but subtle clay texture (fingerprint marks, small imperfections for authenticity)
- Slightly chunky, adorable proportions typical of clay figures (like Aardman animations)
- Soft shadows and ambient occlusion like a real photographed clay model
- Cheerful color palette: warm terracotta, soft pastels, bright primary colors

CLOTHING STYLE FOR CLAY:
- Dress clay figures in cozy, festive winter attire made to look like clay/felt
- Options: knitted sweaters, scarves, winter hats, festive outfits all in clay style
- Use bright, cheerful colors: warm reds, greens, yellows, soft pastels
- Clothing should have that handcrafted, tactile clay/felt texture
- The clothing should feel cute, cozy, and celebratory in claymation style
- Can add miniature accessories: tiny clay scarves, small clay ornaments

BACKGROUND AND ATMOSPHERE:
- Miniature set design feel with depth and dimension like a diorama
- Clay-style New Year elements: miniature clay decorations, tiny clay flowers, small clay ornaments
- Include cute celebratory elements: tiny clay stars, small clay confetti, miniature clay presents
- Create a handcrafted, tactile aesthetic throughout the scene
- Background elements should all look like they're made of clay/plasticine

DECORATIVE ELEMENTS:
- Miniature clay trees, tiny clay lanterns, small clay lucky charms
- Handcrafted feel elements: clay buttons, tiny felt decorations, miniature props
- New Year symbols rendered in cute clay style

LIGHTING AND EFFECTS:
- Apply soft, diffused studio lighting typical of claymation productions
- Add subtle depth of field effects to enhance the miniature feel
- Capture cute, friendly expressions with slightly exaggerated features typical of clay characters
- Warm, inviting lighting that makes the clay figures look huggable and charming

TEXT STYLING:
- Place "2026" and "새해 복 많이 받으세요" at the top, designed to look like clay letters or a clay sign/banner
- "2026" can be displayed above or near the Korean greeting in 3D clay style
- Text should look handcrafted, like it's made of actual clay or placed as a prop in the scene
- Text clearly readable while matching the adorable claymation aesthetic
- Can include tiny clay decorations around the text
`,

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
Transform this casual selfie into a premium professional portrait photo.
IMPORTANT: Make the person look slightly YOUNGER than their actual age - about 3-5 years younger. Enhance skin clarity, reduce any fine lines, and give a fresh, youthful glow while keeping the face naturally recognizable.
IMPORTANT: Keep the EXACT SAME HAIRSTYLE as the original photo - if hair is down, keep it down. If hair is long, keep it long and flowing. Do NOT tie up, bun, or change the hairstyle. Only make it look polished and well-groomed while preserving the original style.

TECHNICAL QUALITY:
- Professional lighting with key light creating soft, flattering illumination on the face.
- Subtle rim light or hair light to separate the subject from the background.
- Soft fill light to minimize harsh shadows while maintaining dimension.
- Catch lights in the eyes for a lively, engaging look.
- Ultra-high resolution, magazine-quality portrait, polished and confident.

CLOTHING, POSE, AND SETTING will be specified by the VARIATION OVERRIDE instructions below. Follow those instructions exactly for outfit, body language, background, and overall mood.
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

  // 5. 디지털 노마드 프로필 - 자유로운 영혼
  nomad: `
Transform this casual selfie into a free-spirited, adventurous digital nomad profile photo.
Create bright, natural outdoor lighting with a tropical or beachy feel - warm sunlight, breezy atmosphere, vacation vibes.
Apply minimal, sun-kissed makeup - healthy glowing skin, natural beach-ready look, effortless and fresh.
Style hair in a relaxed, carefree way - windswept, natural waves, tousled beach hair, or casually tied up, low-maintenance travel style.
Dress in casual comfortable travel wear - relaxed t-shirt, linen shirt, tank top, casual summer clothing, or comfortable everyday travel attire.
Use a tropical lifestyle background - beach setting with palm trees, seaside cafe with ocean view, resort poolside workspace, coastal scenery, or laptop on beach table with tropical drinks, suggesting remote work paradise.
Capture a genuinely happy, free-spirited expression with a relaxed smile, eyes full of wanderlust and adventure.
Natural sunlight, tropical vacation atmosphere, beachy lifestyle aesthetic, high resolution, authentic freedom and adventure vibe.
`,

  // 6. 의사 프로필 - 전문적이고 신뢰감 있는
  doctor: `
Transform this casual selfie into a professional, trustworthy medical doctor profile photo.
Create clean, bright clinical lighting that conveys professionalism and expertise - well-lit, clear, and professional medical environment feel.
Apply professional, minimal makeup - clean, healthy appearance, naturally confident look, subtle and refined.
Style hair in a neat, professional medical manner - well-groomed, clean, professional healthcare standard, polished and tidy.
Dress in white medical coat or professional medical scrubs - clean white coat over professional attire, or neat medical scrubs, suggesting healthcare professional.
Pose with arms crossed confidently in front of chest - professional, confident medical doctor stance with arms folded, conveying authority and expertise.
Use a clean medical office or clinical background - professional medical setting, clean white walls, medical office environment, or subtle clinical backdrop with soft medical equipment hints.
Capture a confident, compassionate expression with a warm professional smile and trustworthy, caring eyes that inspire patient confidence.
Bright clinical lighting, professional medical atmosphere, ultra-high resolution, credible and caring healthcare professional aesthetic.
`,

  // 7. 위키드 프로필 - 매력적이고 신비로운
  wicked: `
Transform this casual selfie into an enchanting, mystical Wicked-inspired witch or wizard profile photo.
Create dramatic, magical lighting with emerald green ethereal glow - mysterious yet alluring atmosphere with subtle magical sparkles and mystical ambiance.
Apply captivating, theatrical makeup with emerald green accents - flawless, porcelain-like skin with subtle green shimmer, dramatic yet beautiful eyes with green undertones, elegant dark lip color, enchanting and sophisticated look.
Style hair in a dramatic, elegant witchy manner - flowing, voluminous, perfectly styled with slight magical windswept effect, dark or dramatically colored hair, sophisticated witch aesthetic.
Dress in elegant, theatrical witch attire - stylish black witch costume with emerald green accents, sophisticated pointed witch hat, elegant dark robes or dress with mystical details, fashionable magical aesthetic.
Use a mystical, dramatic background - enchanted forest with green magical mist, gothic castle interior, magical library, or starry night sky with green aurora effects.
Capture a confident, alluring expression with mysterious eyes and an enchanting smile - captivating, powerful, and magnetically attractive witch presence.
IMPORTANT: Maintain an attractive, beautiful appearance - elegant facial features, symmetrical face, stunning and charismatic look.
Dramatic emerald green lighting, magical mystical atmosphere, theatrical aesthetic, ultra-high resolution, captivating and beautiful witch/wizard portrait.
`,

  // 8. 크리에이티브 - 나를 다른 세계관으로 변신
  creative: `
CRITICAL IDENTITY PRESERVATION:
- The person in the output MUST be the EXACT SAME person from the input photo.
- Preserve the EXACT facial features, face shape, and unique characteristics.
- The person must be instantly recognizable.

CRITICAL AGE:
- Make the person look YOUNGER than their actual age — about 5 years younger.
- Smooth, clear, youthful skin. NO wrinkles, fine lines, or aged appearance.
- Fresh, bright, youthful glow. The person should look like they are in their 20s.

CRITICAL STYLE TRANSFORMATION:
- This is NOT a regular photo edit. You MUST completely transform the visual style as described below.
- The output should look like a completely different medium/art style, NOT a regular photograph.
- Follow the VARIATION OVERRIDE instructions below EXACTLY — they define the entire visual style.
`
};

// 기본 프롬프트 (타입이 지정되지 않은 경우)
export const DEFAULT_PROMPT = PROFILE_PROMPTS.professional;

// 유효한 프로필 타입 목록
export const VALID_PROFILE_TYPES = Object.keys(PROFILE_PROMPTS);

/**
 * 세트 생성용 스타일 변형 서픽스
 * 같은 타입이라도 각 변형마다 배경/조명/의상/포즈를 다르게 지시하여
 * 6장 모두 확실히 다른 결과물을 만듦
 */
// 공통 변형 서픽스
const VARIATION_WARM_GOLDEN = {
  id: 'warm-golden',
  label: '골든아워',
  suffix: `
VARIATION OVERRIDE - WARM GOLDEN:
- LIGHTING: Warm golden hour sunlight from the side, creating soft warm shadows and a glowing skin tone.
- BACKGROUND: Outdoor setting with warm sunset tones, soft bokeh of golden light.
- MOOD: Warm, inviting, naturally radiant.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use warm amber/gold color grading.`
};

const VARIATION_COOL_STUDIO = {
  id: 'cool-studio',
  label: '쿨 스튜디오',
  suffix: `
VARIATION OVERRIDE - COOL STUDIO:
- LIGHTING: Cool-toned professional studio lighting, clean and crisp with slight blue undertones.
- BACKGROUND: Clean grey or soft blue gradient studio backdrop.
- MOOD: Sharp, modern, professional.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use cool blue/grey color grading.`
};

const VARIATION_NATURAL_OUTDOOR = {
  id: 'natural-outdoor',
  label: '자연광 아웃도어',
  suffix: `
VARIATION OVERRIDE - NATURAL OUTDOOR:
- LIGHTING: Bright natural daylight, open shade with even illumination, fresh and airy.
- BACKGROUND: Lush green park, garden, or tree-lined path with soft natural bokeh.
- MOOD: Fresh, healthy, vibrant, connected to nature.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use fresh green/natural tones.`
};

const VARIATION_ELEGANT_DARK = {
  id: 'elegant-dark',
  label: '엘레건트 다크',
  suffix: `
VARIATION OVERRIDE - ELEGANT DARK:
- LIGHTING: Dramatic Rembrandt lighting with rich shadows, one side of face beautifully lit.
- BACKGROUND: Deep dark backdrop (charcoal or deep navy) with subtle warm accent light.
- MOOD: Sophisticated, powerful, high-end editorial.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use high contrast with dark, moody tones.`
};

const VARIATION_DOCTOR = {
  id: 'doctor',
  label: '의사 프로필',
  suffix: `
VARIATION OVERRIDE - DOCTOR PROFILE:
- CLOTHING: White medical coat over professional attire, stethoscope around neck.
- POSE: Arms crossed confidently, authoritative yet compassionate stance.
- LIGHTING: Clean, bright clinical lighting, professional medical environment feel.
- BACKGROUND: Modern medical office, clean clinical setting with subtle medical equipment.
- MOOD: Professional, trustworthy, caring healthcare expert.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Must look like a real doctor portrait.`
};

const VARIATION_SOFT_PASTEL = {
  id: 'soft-pastel',
  label: '소프트 파스텔',
  suffix: `
VARIATION OVERRIDE - SOFT PASTEL:
- LIGHTING: Soft, diffused lighting from front, dreamy and ethereal, minimal shadows.
- BACKGROUND: Soft pastel-toned backdrop (blush pink, lavender, or mint), clean and minimal.
- MOOD: Gentle, approachable, delicate, feminine.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use soft pastel color grading.`
};

const VARIATION_URBAN_STREET = {
  id: 'urban-street',
  label: '어반 스트릿',
  suffix: `
VARIATION OVERRIDE - URBAN STREET:
- LIGHTING: Natural city light with interesting light/shadow play, street photography feel.
- BACKGROUND: Urban cityscape, modern architecture, trendy neighborhood, or cafe exterior.
- MOOD: Dynamic, contemporary, city-cool, candid feel.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use urban, slightly desaturated tones.`
};

/**
 * 타입별 스타일 변형 매핑
 * professional만 4번째가 의사 프로필, 나머지는 엘레건트 다크
 */
const DEFAULT_VARIATIONS = [
  VARIATION_WARM_GOLDEN,
  VARIATION_COOL_STUDIO,
  VARIATION_NATURAL_OUTDOOR,
  VARIATION_ELEGANT_DARK,
  VARIATION_SOFT_PASTEL,
  VARIATION_URBAN_STREET,
];

const VARIATION_CAFE = {
  id: 'cafe',
  label: '카페 감성',
  suffix: `
VARIATION OVERRIDE - CAFE MOOD:
- LIGHTING: Warm indoor cafe lighting, soft window light mixed with warm ambient bulbs.
- BACKGROUND: Cozy cafe interior — wooden table, coffee cup, warm-toned decor, soft bokeh of cafe lights.
- MOOD: Warm, cozy, everyday-pretty, relatable and inviting.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use warm, cozy cafe tones with soft warmth.`
};

const VARIATION_SELFIE_LIGHT = {
  id: 'selfie-light',
  label: '셀피 라이트',
  suffix: `
VARIATION OVERRIDE - SELFIE LIGHT:
- LIGHTING: Bright, even ring-light style illumination from front, clean and flattering with minimal shadows. Bright catch lights in eyes.
- BACKGROUND: Clean, simple, slightly blurred neutral or light-toned background.
- MOOD: Fresh, bright, camera-ready, naturally beautiful selfie look.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use bright, clean, high-key lighting like a beauty selfie.`
};

const VARIATION_SPRING_WALK = {
  id: 'spring-walk',
  label: '봄날 산책',
  suffix: `
VARIATION OVERRIDE - SPRING WALK:
- LIGHTING: Bright, soft spring daylight with gentle warmth, dappled sunlight through cherry blossoms.
- BACKGROUND: Cherry blossom trees or flower-lined path, soft pink petals, romantic spring scenery with gentle bokeh.
- MOOD: Romantic, bright, hopeful, warm spring energy.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use bright, warm spring tones with soft pink accents.`
};

const VARIATION_GALLERY = {
  id: 'gallery',
  label: '갤러리',
  suffix: `
VARIATION OVERRIDE - ART GALLERY:
- LIGHTING: Soft, warm gallery spotlights from above, creating gentle highlights and a refined atmosphere.
- BACKGROUND: Clean white gallery wall with abstract art pieces, minimalist exhibition space.
- MOOD: Cultured, refined, intellectual creative elegance. Friendly and approachable.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use clean, bright tones with warm gallery lighting.`
};

const VARIATION_VINTAGE_FILM = {
  id: 'vintage-film',
  label: '빈티지 필름',
  suffix: `
VARIATION OVERRIDE - VINTAGE FILM:
- LIGHTING: Warm, slightly overexposed film-like lighting with soft grain texture feel.
- BACKGROUND: Retro-toned environment — old bookshop, vinyl cafe, or vintage studio with warm wood tones.
- MOOD: Nostalgic, analog, artistic warmth with timeless quality.
- IMPORTANT: This variation must look distinctly DIFFERENT from other variations. Use warm vintage film color grading with slight fade.`
};

const TYPE_VARIATIONS = {
  sns: [
    VARIATION_WARM_GOLDEN,
    VARIATION_CAFE,
    VARIATION_NATURAL_OUTDOOR,
    VARIATION_SELFIE_LIGHT,
    VARIATION_SOFT_PASTEL,
    VARIATION_URBAN_STREET,
  ],
  professional: [
    {
      id: 'corporate-executive',
      label: '기업 임원',
      suffix: `
VARIATION OVERRIDE - CORPORATE EXECUTIVE:
- CLOTHING: Well-tailored business suit or blazer in classic colors (charcoal, navy, black). For women: elegant blazer with simple blouse or professional dress. For men: fitted suit jacket with crisp dress shirt and optional tie. Clean, pressed, wrinkle-free with sharp lapels. Understated jewelry (small earrings or thin necklace).
- POSE: Arms crossed confidently in front of chest, conveying leadership and authority. Shoulders back, chin slightly up. Upper body framing from waist up, slightly angled for dynamic composition.
- EXPRESSION: Strong, assured smile with direct eye contact — approachable yet commanding.
- LIGHTING: Professional cool-toned studio lighting, clean and crisp.
- BACKGROUND: Solid color studio backdrop with soft gradient — muted grey, soft blue, or warm charcoal. Slight vignette effect.
- MOOD: Powerful, polished, corporate authority. Like a Fortune 500 executive headshot.
- IMPORTANT: This must look like a premium corporate headshot suitable for a company website or annual report.`
    },
    {
      id: 'creative-professional',
      label: '크리에이티브 전문가',
      suffix: `
VARIATION OVERRIDE - CREATIVE INDUSTRY PROFESSIONAL:
- CLOTHING: Smart casual with personality — relaxed structured blazer over a fine-knit turtleneck or clean crew-neck top in rich earth tones or muted jewel tones (burgundy, forest green, warm camel, dusty blue). NO formal suit. Visible tasteful accessories like modern glasses frames, a delicate bracelet, or statement earrings.
- POSE: Relaxed, natural seated or leaning pose — one hand resting on a table or chin. Approachable and creative body language, NOT stiff. Upper body to head framing, slightly off-center composition.
- EXPRESSION: Warm, thoughtful smile — intelligent and approachable, like someone you'd want to work with.
- LIGHTING: Warm natural window light from the side, creating soft directional shadows. Bright and airy feel.
- BACKGROUND: Modern co-working space or design studio with soft bokeh — visible elements like bookshelves, plants, or warm wood surfaces. Clean but lived-in.
- MOOD: Innovative, approachable, modern. Like a startup founder profile on a tech magazine.
- IMPORTANT: This should feel distinctly different from a corporate headshot — more relaxed, warmer, and creative while still professional.`
    },
    {
      id: 'ai-developer',
      label: 'AI 개발자',
      suffix: `
VARIATION OVERRIDE - AI DEVELOPER:
- CLOTHING: Modern tech casual — clean hoodie or premium crewneck sweatshirt in dark tones (charcoal, deep navy, black). Comfortable but intentional styling. NO formal suit, NO blazer.
- GLASSES: Wearing stylish modern glasses — thin metal or clean acetate frames. The glasses should look natural and suit the face well.
- HAIR: Casual, low-maintenance hairstyle — effortless and natural developer vibe. Override the base prompt's hairstyle preservation for this variation.
- POSE: Seated at a desk, body angled toward the monitors, looking at the screen — NOT facing the camera. Natural coding posture with hands on keyboard. Shot from a slight side angle (3/4 view) capturing the profile as they work. Upper body framing showing the person and part of the desk setup.
- EXPRESSION: Calm, deeply thoughtful expression — slightly narrowed eyes reading code on screen, lips gently pressed together in contemplation. NOT frowning or angry. The quiet, absorbed look of someone deeply immersed in solving an interesting problem. Peaceful concentration, like a chess player mid-game.
- LIGHTING: Cool ambient screen glow mixed with soft overhead lighting. Subtle blue/purple tones from monitors illuminating the face. Clean, tech-forward atmosphere.
- BACKGROUND: Dual monitor setup clearly visible behind or beside the person — screens showing code, terminal, or AI model visualizations in soft bokeh. Sleek minimal desk with mechanical keyboard, coffee mug. Dark, clean workspace with ambient LED lighting.
- MOOD: Innovative, deeply focused, quietly confident. Like a candid profile photo of a top AI engineer in their element.
- IMPORTANT: The dual monitors and coding environment are essential to this variation. The person should look like a real developer actively working, NOT posing for a corporate photo.`
    },
    VARIATION_DOCTOR,
    {
      id: 'media-speaker',
      label: '미디어/강연자',
      suffix: `
VARIATION OVERRIDE - MEDIA SPEAKER:
- CLOTHING: Polished but expressive outfit — structured dress in a bold solid color (coral, royal blue, emerald) OR elegant top with statement necklace. Clothing should look great on camera. Vibrant but not loud. NO dark business suit.
- POSE: Dynamic, engaging stance — slight forward lean as if connecting with an audience, open hand gesture or hands together. Energetic body language. Upper body framing, slightly wider than typical headshot to show gesture.
- EXPRESSION: Bright, energetic smile with sparkling eyes — charismatic and inspiring. The look of someone about to give a great talk.
- LIGHTING: Bright, theatrical stage-style lighting — clean key light with subtle colored accent lights (warm amber or soft blue rim light). Professional broadcast quality.
- BACKGROUND: Blurred stage or conference setting — subtle hints of an audience in deep bokeh, stage lights, or a modern event space. Dark background with luminous lighting on subject.
- MOOD: Charismatic, inspiring, dynamic. Like a TED speaker portrait or a media personality headshot.
- IMPORTANT: This should feel energetic and public-facing — NOT a quiet studio portrait. The person should look like a confident speaker or media personality.`
    },
    {
      id: 'lifestyle-professional',
      label: '라이프스타일',
      suffix: `
VARIATION OVERRIDE - LIFESTYLE PROFESSIONAL:
- CLOTHING: Elevated casual — premium quality knitwear, cashmere wrap, or linen blouse in soft warm tones (ivory, soft peach, warm beige, light lavender). Comfortable but clearly high-quality fabric. Minimal elegant jewelry. NO blazer, NO formal wear.
- POSE: Natural, relaxed walking or standing pose — weight shifted to one side, one hand in pocket or holding a coffee cup. Candid, lifestyle feel rather than posed. Wider framing showing more of the body in a natural environment.
- EXPRESSION: Genuine, relaxed warm smile — approachable and authentic. The look of someone enjoying their day.
- LIGHTING: Golden hour natural light — warm, soft sunlight creating a naturally glowing look. Bright and airy outdoor daylight.
- BACKGROUND: Beautiful outdoor lifestyle setting — tree-lined avenue, elegant cafe terrace, modern urban park, or riverside walkway. Soft natural bokeh with warm tones.
- MOOD: Authentic, warm, aspirational yet relatable. Like a premium LinkedIn personal brand photo or lifestyle magazine feature.
- IMPORTANT: This should feel like an elevated candid lifestyle photo — NOT a studio portrait. Natural, warm, and authentic while still looking polished and professional.`
    },
  ],
  dating: [
    VARIATION_WARM_GOLDEN,
    VARIATION_COOL_STUDIO,
    VARIATION_NATURAL_OUTDOOR,
    VARIATION_SPRING_WALK,
    VARIATION_SOFT_PASTEL,
    VARIATION_URBAN_STREET,
  ],
  artist: [
    VARIATION_WARM_GOLDEN,
    VARIATION_GALLERY,
    VARIATION_NATURAL_OUTDOOR,
    VARIATION_VINTAGE_FILM,
    VARIATION_SOFT_PASTEL,
    VARIATION_URBAN_STREET,
  ],
  nomad: [
    VARIATION_WARM_GOLDEN,
    {
      id: 'coworking',
      label: '공유오피스',
      suffix: `
VARIATION OVERRIDE - COWORKING SPACE:
- CLOTHING: Relaxed, free-spirited outfit — oversized linen shirt, casual t-shirt, or comfortable hoodie in bright or neutral tones. Laid-back digital nomad style. NO formal wear.
- POSE: Seated at a bright shared desk with laptop open, relaxed posture, maybe one hand on coffee cup. Natural, candid working vibe.
- EXPRESSION: Relaxed, content smile — enjoying the freedom of remote work.
- LIGHTING: Bright, airy natural light flooding through large windows. Clean, modern, well-lit space.
- BACKGROUND: Modern co-working space with large windows, bright white interior, plants, other people working in soft bokeh. Open, spacious, international vibe.
- MOOD: Free, productive, modern nomad lifestyle. The joy of working from anywhere.
- IMPORTANT: This should feel bright, open, and international — NOT a dark corporate office.`
    },
    {
      id: 'tropical-outdoor',
      label: '트로피컬 아웃도어',
      suffix: `
VARIATION OVERRIDE - TROPICAL OUTDOOR:
- CLOTHING: Tropical resort wear — sleeveless tank top, flowy sundress, off-shoulder top, or light spaghetti strap top. Bright or tropical colors (coral, turquoise, white, sunny yellow). Bare arms and shoulders visible, sun-kissed skin. NO long sleeves, NO collared shirts, NO formal wear.
- POSE: Standing or walking in a lush tropical setting, relaxed and carefree body language. Natural, candid feel.
- EXPRESSION: Genuinely happy, free-spirited smile with eyes full of wanderlust.
- LIGHTING: Bright natural tropical daylight, open shade with even warm illumination. Fresh and airy.
- BACKGROUND: Lush tropical garden, rice terraces, or palm-lined path. Rich green foliage with soft natural bokeh. Southeast Asia or Bali travel vibe.
- MOOD: Adventurous, free, connected to nature. Authentic travel lifestyle.
- IMPORTANT: Must feel like a real travel photo, NOT a studio shot. Natural, vibrant, alive.`
    },
    {
      id: 'city-night',
      label: '도시 야경',
      suffix: `
VARIATION OVERRIDE - CITY NIGHT:
- CLOTHING: Stylish but comfortable travel outfit — fitted jacket or cardigan over casual top, smart-casual layers suitable for a cool city evening.
- POSE: Standing with a MacBook or laptop tucked under one arm, leaning casually against a railing or wall. Confident, worldly traveler body language.
- EXPRESSION: Calm, confident subtle smile — the look of someone who feels at home anywhere in the world.
- LIGHTING: Dramatic city night lighting — warm street lights and colorful building lights illuminating the face. Mix of warm and cool urban night tones.
- BACKGROUND: Stunning city skyline at night — glittering skyscrapers, city lights bokeh, rooftop or bridge viewpoint. Cosmopolitan nightscape.
- MOOD: Sophisticated, worldly, quietly adventurous. A digital nomad who works from the world's greatest cities.
- IMPORTANT: The laptop/MacBook is essential — it signals the digital nomad lifestyle. The city night setting should feel glamorous and aspirational.`
    },
    {
      id: 'beach-pastel',
      label: '해변 파스텔',
      suffix: `
VARIATION OVERRIDE - BEACH PASTEL:
- CLOTHING: Soft, flowy beach outfit — light linen dress, pastel-toned loose shirt, or breezy cotton layers in soft peach, cream, or sky blue.
- POSE: Relaxed standing or sitting by the seaside, hair gently windswept. Peaceful, serene body language.
- EXPRESSION: Soft, peaceful smile — content and at ease. The look of someone living their dream life.
- LIGHTING: Soft diffused coastal morning light, dreamy and ethereal. Gentle warm glow.
- BACKGROUND: Pastel-toned seaside — Santorini white buildings with blue accents, or soft sandy beach at sunrise. Light, dreamy, pastel color palette.
- MOOD: Serene, dreamy, aspirational. A beautiful, calm moment of remote life by the sea.
- IMPORTANT: The overall tone should be soft and pastel — NOT harsh tropical colors. Gentle, peaceful, Mediterranean or minimalist coastal vibe.`
    },
    VARIATION_URBAN_STREET,
  ],
  creative: [
    {
      id: 'figure',
      label: '피규어',
      suffix: `
VARIATION OVERRIDE - COLLECTIBLE FIGURE:
Transform this person into a high-quality collectible action figure displayed in a blister pack packaging.
Create a premium toy package design with the action figure visible through clear plastic blister packaging mounted on colorful cardboard backing.
The figure should be made of high-quality painted plastic or vinyl with articulated joints, displayed in an eye-catching pose.
CRITICAL CLOTHING: The figure MUST be wearing a COMPLETE outfit covering the entire body — top AND bottom. Full outfit examples: jeans and jacket, dress, uniform with pants, skirt and top. The figure must NEVER appear without pants, skirt, or lower body clothing. ALL limbs must be fully clothed or naturally covered by the outfit.
The figure must have the person's recognizable facial features but BEAUTIFIED like a premium designer doll — flawless smooth plastic skin, perfectly symmetrical features, large sparkling doll-like eyes, cute button nose, small pretty lips. Think Barbie/designer vinyl toy level of idealized beauty while still resembling the original person.
Design an attractive cardboard backing with bold graphics, product name, character artwork, decorative patterns, and brand-style elements in vibrant colors.
Include multiple accessories displayed around the main figure: interchangeable hands, effect parts, character-specific items, badges or emblems, miniature props.
The accessories should be neatly arranged in molded plastic compartments within the blister pack, creating an organized and premium presentation.
Use dynamic and creative poses for the figure - randomly choose from: heroic standing pose, action stance, confident pose, signature character pose, or stylish position that looks great through the packaging.
Apply professional toy photography lighting with clean, bright illumination that showcases the figure and accessories clearly through the transparent blister.
Add authentic packaging details: warning labels, age recommendations, barcodes, product information text, company logos positioned naturally on the card backing.
Create that new-in-box collectible aesthetic - pristine condition, museum-quality presentation, shelf-ready display packaging.
Choose random creative cardboard backing themes: space adventure, fantasy realm, urban hero, cute pastel design, futuristic tech design, or seasonal themes.
Show fine details: realistic plastic texture on figure, glossy finish on blister pack, printing quality on cardboard, professional product photography composition.
Premium blister pack toy quality, authentic collectible packaging aesthetic, detailed craftsmanship, ultra-high resolution, retail-ready presentation.`
    },
    {
      id: '3d-character',
      label: '3D 캐릭터',
      suffix: `
VARIATION OVERRIDE - 3D ANIMATED CHARACTER:
- STYLE: Transform into a Pixar/Disney-style 3D animated character.
- Slightly exaggerated proportions: larger expressive eyes, smoother skin, rounder features.
- Stylized but recognizable - the person's key features preserved in 3D animation style.
- CLOTHING: Stylish animated character outfit appropriate to their vibe.
- LIGHTING: Bright, colorful Pixar-quality rendering with soft ambient occlusion.
- BACKGROUND: Colorful, cheerful animated world environment.
- MOOD: Warm, charming, family-friendly, like a beloved animated movie character.
- IMPORTANT: Must look like a frame from a high-budget 3D animated film. Smooth, polished rendering.`
    },
    {
      id: 'vogue',
      label: '보그 모델',
      suffix: `
VARIATION OVERRIDE - VOGUE MAGAZINE COVER:
Create a VOGUE FASHION MAGAZINE COVER featuring this person as the cover model.

THIS IS A MAGAZINE COVER LAYOUT, NOT a simple portrait photo.

MAGAZINE LAYOUT (MANDATORY):
- Large "VOGUE" masthead text at the very top of the image in classic serif font (white or contrasting color)
- Additional magazine cover text elements: headline text, date, barcode area — arranged like a real Vogue cover
- The overall composition must look like a REAL magazine cover you'd see on a newsstand

MODEL STYLING:
- High-fashion editorial makeup: dramatic eyes, sculpted contour, bold lip color, flawless luminous skin
- Hair: Perfectly styled — voluminous blowout, sleek updo, or dramatic editorial style. NOT everyday hair.
- Outfit: Visible high-fashion clothing — couture top, elegant neckline, statement jewelry or accessories. NOT plain clothing.
- Expression: Confident, powerful, magnetic — a supermodel commanding the camera

FRAMING:
- Upper body portrait (head to mid-torso), NOT just face
- Slightly angled pose, NOT straight-on passport style
- Fashion model pose with attitude

LIGHTING & COLOR:
- Bright, vivid, high-end fashion photography lighting
- Rich, saturated colors — NOT desaturated or muted
- Clean studio or artistic gradient backdrop

IMPORTANT: The final image must be UNMISTAKABLY a fashion magazine cover — with masthead, text elements, and editorial styling. If someone saw this, they should think "that's a magazine cover" NOT "that's a headshot."`
    },
    {
      id: 'hanbok',
      label: '한복',
      suffix: `
VARIATION OVERRIDE - HANBOK PORTRAIT:
- FRAMING: Full body portrait. The person should fill about two-thirds of the frame height. Face clearly visible.
- STYLE: Beautiful, bright Korean hanbok (한복) portrait.
- GENDER-APPROPRIATE HANBOK: Detect the person's gender from the input photo and dress accordingly. For MALES: traditional dopo (도포) or durumagi (두루마기) with baji (바지) and joggi (조끼), dignified colors like navy, deep blue, jade green, charcoal, or muted earth tones. For FEMALES: elegant jeogori (저고리) and chima (치마), bright cheerful colors like soft pink, light blue, coral, pastel yellow, or lavender.
- REMOVE ALL ACCESSORIES from the original photo: hats, caps, beanies, sunglasses, headbands, earphones — the person must appear WITHOUT any head accessories. Show their natural hair instead.
- FACE: MUST look youthful and fresh — smooth flawless skin, bright clear eyes, rosy healthy cheeks, NO wrinkles or fine lines whatsoever. Dewy, glowing complexion.
- HAIR: Natural, neat hairstyle with healthy shine. NO hats or head coverings.
- LIGHTING: Bright, warm, cheerful natural daylight. Soft flattering light on face.
- BACKGROUND: Softly blurred hanok village with cherry blossoms and flowers. Shallow depth of field, soft bokeh.
- MOOD: Pretty, bright, cheerful, youthful.
- IMPORTANT: The person MUST look young and beautiful. Gender-appropriate hanbok is critical — do NOT put male subjects in female hanbok (chima) or vice versa.`
    },
    {
      id: 'clay',
      label: '점토인형',
      suffix: `
VARIATION OVERRIDE - CLAY FIGURE:
- STYLE: Transform into an adorable clay/claymation stop-motion style miniature figure.
- Slightly chunky, cute proportions typical of clay animation (like Aardman/Wallace & Gromit).
- FACE: Smooth, PERFECTLY SMOOTH clay surface. ABSOLUTELY NO wrinkles, NO fine lines, NO nasolabial folds, NO under-eye lines, NO crow's feet. The face must be a smooth, round, cute clay surface like a brand new clay doll. Think baby-smooth clay. Any lines on the face are WRONG — clay figures do NOT have wrinkles.
- Visible but subtle clay texture on body — smooth rounded surfaces, soft matte finish.
- CLOTHING: Cute, cozy outfit rendered in clay/felt style — knitted sweater, scarf, or casual wear all made of clay.
- LIGHTING: Soft, diffused studio lighting typical of claymation productions.
- BACKGROUND: Miniature diorama set with tiny clay props, handcrafted feel.
- MOOD: Adorable, warm, huggable, charming. Makes people smile.
- IMPORTANT: The clay figure must look CUTE and YOUNG. Smooth round baby-like face. NO aging features whatsoever. Clay figures are always adorable, never old-looking.`
    },
    {
      id: 'goddess',
      label: '여신/신화',
      suffix: `
VARIATION OVERRIDE - ETHEREAL DEITY:
Create an ethereal photorealistic close-up portrait. Natural makeup, flawless even skin tone and refined eye definition. Surrounded by a dreamlike landscape. Gentle features radiate elegance, with flowing hair adorned with glowing runes symbolizing love. Wearing a simple flowing mystical robe that drapes elegantly with a soft, plain fabric without patterns, god/goddess-like aura that resonates with the energy of the five elements.
- IMPORTANT: Preserve the person's face as closely as possible to the input image.`
    },
  ],
};

// 하위 호환용 export
export const STYLE_VARIATIONS = DEFAULT_VARIATIONS;

/**
 * 주어진 프로필 타입의 기본 프롬프트 + 변형 서픽스를 결합하여 반환
 * @param {string} profileType - 프로필 타입 ID
 * @param {number} variationIndex - 변형 인덱스 (0~5)
 * @returns {{ prompt: string, variation: { id: string, label: string } }}
 */
export function getVariationPrompt(profileType, variationIndex) {
  const basePrompt = VALID_PROFILE_TYPES.includes(profileType)
    ? PROFILE_PROMPTS[profileType]
    : DEFAULT_PROMPT;

  const variations = TYPE_VARIATIONS[profileType] || DEFAULT_VARIATIONS;
  const variation = variations[variationIndex % variations.length];

  // 보그는 잡지 텍스트가 필요하므로 텍스트 금지 제외
  const noTextRule = variation.id === 'vogue'
    ? ''
    : '\n- Do NOT include any text, letters, numbers, words, watermarks, logos, or typography anywhere in the image.';

  const globalRules = `
CRITICAL RULES:${noTextRule}
- Make the person look YOUNGER than their actual age - about 3-5 years younger. Enhance skin clarity, smooth out fine lines, give a fresh youthful glow while keeping the face naturally recognizable. The result should look like the person on their best day, not aged or tired.`;

  return {
    prompt: basePrompt + variation.suffix + globalRules,
    variation: { id: variation.id, label: variation.label },
  };
}
