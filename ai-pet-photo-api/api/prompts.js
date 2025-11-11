// 반려동물 사진 변형 프롬프트

export const PET_PROMPTS = {
  // 1. 명화 속 주인공 - 고전 명화 스타일
  masterpiece: `
Transform this pet photo into a classical masterpiece painting style portrait.
Apply the artistic techniques of famous classical painters like Rembrandt, Vermeer, or Renaissance masters.
Create rich, dramatic lighting with subtle shadows and highlights that give depth and dimension.
Use a classical color palette with warm, earthy tones and subtle glazing effects typical of oil paintings.
Place the pet in an elegant pose befitting a noble portrait subject.
Add a classical background - perhaps a grand interior, draped fabric, or subtle landscape in the style of old masters.
Include fine details like fur texture rendered in painterly brushstrokes, expressive eyes with depth.
Apply canvas texture and subtle aging effects to make it look like an authentic classical painting.
Museum-quality composition, timeless artistic style, rich colors, masterful technique, portrait of nobility.
`,

  // 2. 할로윈 마녀/호박 - 귀엽고 재미있는 할로윈 테마
  halloween: `
Transform this pet into an adorable Halloween character - either as a cute witch or with festive pumpkin decorations.
Create a magical, spooky-fun atmosphere with Halloween themed elements.
Apply fun costume elements - witch hat, wizard cape, pumpkin accessories, or bat wings that look natural on the pet.
Use rich Halloween colors - deep purples, oranges, blacks, and mystical greens with magical glow effects.
Add atmospheric Halloween background - moonlit night, jack-o'-lanterns, autumn leaves, or a cozy magical setting.
Include playful magical effects like sparkles, glowing eyes, floating autumn leaves, or mystical aura.
Maintain the pet's cute and friendly expression while adding festive Halloween charm.
Keep it adorable and fun, not scary - perfect for sharing on social media during Halloween season.
Vibrant Halloween colors, magical atmosphere, cute and festive, high resolution, shareable quality.
`,

  // 3. 슈퍼히어로 - 멋진 히어로 컨셉
  superhero: `
Transform this pet into an epic superhero character with powerful presence.
Create a dynamic, heroic composition with dramatic action-movie style lighting.
Apply a superhero costume that fits naturally - cape, mask, heroic emblem, or super suit adapted for the pet's body.
Use bold, vibrant superhero colors - reds, blues, golds, or unique color schemes with metallic and glossy effects.
Add a dynamic background - city skyline, dramatic sky with lightning, or action scene with energy effects.
Include superhero elements like glowing eyes, power aura, heroic stance, or energy effects around the pet.
Capture a brave, confident expression that shows heroic determination.
Create an epic, cinematic feel like a movie poster - dramatic, powerful, inspiring.
Dynamic lighting, bold colors, heroic composition, ultra-high resolution, epic superhero aesthetic.
`,

  // 4. 왕족/귀족 - 우아하고 고귀한 느낌
  royal: `
Transform this pet into a regal royal or noble portrait with majestic dignity.
Create elegant, sophisticated lighting that conveys nobility and refinement with subtle grandeur.
Apply royal accessories that look natural - ornate crown, jeweled collar, royal robe with ermine fur, or noble medallions.
Use rich, luxurious colors - deep purples, royal blues, crimson reds, and gold accents with velvet textures.
Place the pet on a royal throne, elegant cushions, or in a palace setting with grand architectural elements.
Add regal details like royal insignia, heraldic elements, luxurious fabrics, or precious jewels.
Capture a dignified, noble expression - proud, serene, and majestic bearing befitting royalty.
Include baroque or renaissance palace interior elements - ornate frames, columns, or grand drapery.
Sophisticated composition, rich royal colors, luxurious details, ultra-high resolution, portrait of nobility.
`,

  // 5. 귀여운 만화 캐릭터 - 애니메이션 스타일
  cartoon: `
Transform this pet into an adorable cartoon character with charming animation style.
Apply a modern, cute cartoon art style with smooth, clean lines and vibrant colors - like Pixar or Disney animation.
Enhance features to be more expressive and endearing - bigger, sparkling eyes, softer features, gentle smile.
Use bright, cheerful color palette with smooth gradients and soft shading typical of 3D animation.
Add cartoon-style fur texture - fluffy, soft-looking, with gentle highlights and smooth rendering.
Create a fun, colorful background - whimsical scene, pastel colors, or simple gradient with playful elements.
Include cartoon effects like sparkles, hearts, stars, or other cute decorative elements around the pet.
Capture an irresistibly cute expression - happy, playful, sweet, with big expressive cartoon eyes.
Smooth animation-quality rendering, vibrant happy colors, ultra-cute aesthetic, high resolution, shareable character design.
`
};

// 기본 프롬프트 (타입이 지정되지 않은 경우)
export const DEFAULT_PROMPT = PET_PROMPTS.masterpiece;

// 유효한 반려동물 변형 타입 목록
export const VALID_PET_TYPES = Object.keys(PET_PROMPTS);
