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
