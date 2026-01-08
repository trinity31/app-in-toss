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

  'new-year-card-anime': NEW_YEAR_CARD_COMMON_PROMPT + `

ANIME STYLE SPECIFIC:
Transform this person/people into a beautiful 2026 New Year greeting card with Japanese anime/manga art style.
Create a vibrant, expressive anime-style illustration with characteristic large eyes, dynamic poses, and bold colors.

VISUAL STYLE:
- Classic Japanese anime art style with clean linework and cell-shading
- Characteristic anime features: expressive large eyes, detailed hair with highlights, smooth skin
- Bold, vibrant colors with strong contrast and cel-shaded lighting
- Dynamic composition with energy and movement
- Manga/anime color palette: bright pinks, vivid blues, pure whites, deep shadows

CLOTHING STYLE FOR ANIME:
- Dress people in stylish, modern festive outfits: fashionable dresses, smart blazers, elegant tops
- Use vibrant anime-appropriate colors: bright reds, blues, purples, whites with accent colors
- Modern, trendy clothing that fits the dynamic anime aesthetic
- Can include fashionable accessories: scarves, jewelry, hair ornaments
- The clothing should feel energetic, youthful, and celebratory in anime style

BACKGROUND AND ATMOSPHERE:
- Background with anime aesthetic: gradient skies, festive outdoor or indoor scene, dynamic patterns
- Include festive New Year elements in anime style: stylized fireworks, cute decorations, celebration items
- Add anime-typical effects: speed lines, sparkles, star bursts, light effects
- Create depth with layered background elements

LIGHTING AND EFFECTS:
- Apply dramatic anime-style lighting - strong highlights, defined shadows, vibrant glow effects
- Add anime-typical visual effects: floating sparkles, lens flares, screen tones, cherry blossoms
- Capture bright, cheerful anime expressions - big smile, sparkling eyes, energetic pose

TEXT STYLING:
- Place "2026" and "새해 복 많이 받으세요" at the top in bold, modern anime-style Korean lettering
- "2026" can be displayed above or near the Korean greeting with dynamic styling
- Strong contrast with optional text effects (outline, shadow, glow)
- Text matches the energetic anime aesthetic
`,

  'new-year-card-chinese': NEW_YEAR_CARD_COMMON_PROMPT + `

CHINESE STYLE SPECIFIC:
Transform this person/people into a beautiful 2026 New Year greeting card with gorgeous traditional Chinese style.
Create a luxurious, ornate design with rich traditional Chinese aesthetics, symbols, and celebratory elements.

VISUAL STYLE:
- Traditional Chinese art aesthetic with intricate patterns and ornamental details
- Rich, luxurious color palette: auspicious reds, prosperity golds, imperial yellows, jade greens
- Elegant traditional Chinese fashion elements or festive attire
- Symmetrical or balanced composition reflecting Chinese design principles

CLOTHING STYLE FOR CHINESE:
- Dress people in luxurious traditional or modern-traditional fusion attire
- Options: elegant qipao/cheongsam, traditional Chinese robes, or modern elegant outfits with Chinese elements
- Use auspicious colors: rich reds, prosperity golds, imperial yellows, jade greens
- Include traditional elements: Chinese collars, embroidered patterns, silk fabrics, ornate buttons
- The clothing should feel elegant, luxurious, and culturally festive
- Can add traditional accessories: jade jewelry, ornamental hair pieces, silk sashes

BACKGROUND AND ATMOSPHERE:
- Rich, layered background with traditional Chinese architectural elements or festive scenery
- Add traditional Chinese New Year elements: red lanterns, gold ingots, plum blossoms, firecrackers
- Include auspicious symbols: dragons (subtle), phoenixes, peonies, bamboo, lucky coins
- Ornate decorative frames or borders with traditional patterns
- Create depth and grandeur with multiple background layers

DECORATIVE ELEMENTS:
- Chinese clouds, phoenixes, peonies, lucky coins, lanterns
- Traditional patterns: cloud motifs, wave patterns, floral emblems, geometric designs

LIGHTING AND EFFECTS:
- Apply rich, dramatic lighting - golden glow, warm radiance, lustrous highlights
- Add luxury effects: gold sparkles, gentle light rays, auspicious glow, floating petals
- Capture elegant, dignified expressions with warm celebration and prosperity

TEXT STYLING:
- Place "2026" and "새해 복 많이 받으세요" prominently at the top in elegant, ornate Korean lettering with gold accents
- "2026" can be displayed above or near the Korean greeting in luxurious style
- Luxurious appearance - gold color, ornate borders, or decorative frames
- Text clearly readable while matching the opulent Chinese aesthetic
- Optional decorative elements around the text
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
`
};

// 기본 프롬프트 (타입이 지정되지 않은 경우)
export const DEFAULT_PROMPT = PROFILE_PROMPTS.professional;

// 유효한 프로필 타입 목록
export const VALID_PROFILE_TYPES = Object.keys(PROFILE_PROMPTS);
