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
`,

  // 6. 다른 동물과 합친 사진 - 하이브리드 동물
  'hybrid-animal': `
INSTRUCTION: Transform this pet into a hybrid creature by giving it a different animal's body, while keeping the pet's face completely recognizable.

STEP 1 - KEEP THE PET'S FACE:
DO NOT change the pet's face. The pet's eyes, nose, mouth, ears, and facial expression must remain exactly as they are in the original photo. This is the most important requirement.

STEP 2 - ANALYZE THE PET'S APPEARANCE:
Look at the pet's fur color and pattern:
- Orange/ginger with stripes → the pet has orange striped fur
- White/cream → the pet has white/light colored fur
- Gray/silver → the pet has gray fur
- Brown/tan → the pet has brown/tan fur
- Black → the pet has black fur
- Spotted/patched → the pet has spots or patches
- Multi-colored → the pet has multiple colors

STEP 3 - SELECT A MATCHING ANIMAL BODY:
Choose ONE animal body that has similar coloring to the pet:
- Orange striped pet → tiger body, fox body, or lion body
- White pet → owl body, swan body, dove body, arctic fox body
- Gray pet → wolf body, elephant body, koala body, sloth body
- Brown pet → deer body, rabbit body, eagle body
- Black pet → panther body, raven body, black swan body
- Spotted pet → leopard body, giraffe body
- Multi-colored pet → parrot body, peacock body

STEP 4 - CREATE THE HYBRID:
Replace the pet's body (from neck down) with the selected animal's body. The pet's face stays on top. Make sure:
- The pet's face color matches the animal body color (both should be the same color)
- The neck connects smoothly with no visible line where they meet
- The whole creature looks like it was born this way, not edited
- The size of the head matches naturally with the body size

STEP 5 - FINAL TOUCHES:
- Put the hybrid creature in a natural environment (forest, sky, water, etc.)
- Use natural lighting like a wildlife photograph
- Make it look photorealistic and believable

REMEMBER: The pet's original face must be clearly visible and recognizable in the final image. Do not replace or change the pet's face.
`,

  // 7. 동화 주인공 - 클래식 동화 캐릭터
  'fairytale-hero': `
Transform this pet into a beloved fairytale character or storybook hero with magical charm.
Apply classic storybook illustration style with soft, dreamy quality and enchanting atmosphere.
Dress the pet as a fairytale character - Little Red Riding Hood, Cinderella, Prince Charming, or other classic storybook heroes.
Use warm, storybook colors with gentle lighting that creates a magical, nostalgic feeling.
Add fairytale setting elements - enchanted forest, castle, magical garden, or whimsical cottage scene.
Include storybook details like sparkles, magical effects, gentle light rays, or fantasy elements.
Maintain the pet's endearing expression while conveying the character's story and charm.
Create a book-illustration quality that feels timeless, innocent, and full of wonder.
Soft storybook aesthetic, magical atmosphere, classic fairytale charm, high resolution, enchanting composition.
`,

  // 8. 피규어 - 수집용 피규어 스타일
  'figure': `
Transform this pet into a high-quality collectible figure or statue with detailed craftsmanship.
Create a 3D rendered appearance of a premium collectible figure made of high-quality materials - resin, vinyl, or painted plastic.
Apply realistic figure textures with subtle paint details, panel lines, and crafted surface quality.
Use dynamic pose and composition typical of premium collectible figures - action stance or display pose.
Add figure-specific details like base stand, accessories, or display elements that enhance the collectible aesthetic.
Include professional product photography lighting - studio quality with careful highlights and shadows.
Create depth of field effect to make it look like a photographed collectible on a display shelf.
Show fine craftsmanship details - paint gradation, texture sculpting, articulation points done tastefully.
Premium collectible quality, studio photography aesthetic, detailed craftsmanship, ultra-high resolution, display-worthy.
`,

  // 9. 봉제인형 - 귀여운 플러시 토이
  'plush-toy': `
Transform this pet into an adorable plush toy or stuffed animal with soft, huggable appearance.
Create a soft, fluffy texture that looks like high-quality plush fabric - velvet, minky, or soft fleece material.
Apply cute, simplified features typical of premium plush toys - button eyes, embroidered details, gentle smile.
Use soft, pastel or warm colors with gentle shading that emphasizes the toy's cuddly nature.
Add plush toy details like stitching lines, fabric texture, cute accessories, or a small tag.
Place on a cozy setting - soft blanket, cushions, or child's bedroom scene with warm lighting.
Capture an irresistibly cute and huggable appearance that makes people want to squeeze it.
Include soft focus and gentle lighting that emphasizes the toy's softness and warmth.
Premium plush quality, soft and cuddly aesthetic, adorable design, high resolution, heartwarming composition.
`,

  // 10. 루니툰 스타일 - 클래식 카툰 애니메이션
  'looney-tunes': `
Transform this pet into a classic Looney Tunes style cartoon character with vintage animation charm.
Apply 1940s-1950s golden age cartoon aesthetic with bold outlines, exaggerated features, and dynamic expression.
Use vibrant, slightly retro color palette typical of classic Warner Bros. cartoons - bright primaries with cel-shading.
Exaggerate the pet's features in a playful, comedic way - big expressive eyes, dynamic fur, animated personality.
Add classic cartoon motion lines, impact effects, or comedic visual elements around the character.
Create a simple, classic cartoon background with bold colors and minimal detail, focusing on the character.
Capture an energetic, mischievous, or comically expressive face full of personality and charm.
Include vintage cartoon styling - hand-drawn feel, cel animation aesthetic, timeless comedy appeal.
Classic golden-age animation style, bold vibrant colors, comedic expression, high resolution, nostalgic cartoon charm.
`,

  // 11. 스티커 - SNS용 스티커 디자인
  'sticker': `
Transform this pet into a cute, expressive sticker design perfect for messaging apps and social media.
Create a simplified, iconic design with clean lines and bold colors that works at small sizes.
Apply kawaii or modern sticker aesthetic - big eyes, cute expression, simplified features, rounded shapes.
Use bright, cheerful color palette with solid colors and minimal gradients for clear visibility.
Add a subtle white outline or glow effect to make the sticker pop against any background.
Include expressive emotion or action - happy, excited, loving, or playful gesture that conveys clear feeling.
Keep the composition simple and focused on the pet's face or key features for maximum impact.
Create transparent background ready design that could be easily used as a digital sticker.
Clean sticker design, vibrant colors, expressive emotion, high resolution, messaging-app ready aesthetic.
`,

  // 12. 이모티콘 - 귀여운 이모티콘 캐릭터
  'emoticon': `
Transform this pet into an adorable emoticon character with simple, expressive design.
Create a cute, minimal character design that clearly conveys emotion - similar to LINE or KakaoTalk emoticons.
Apply simple, clean art style with smooth lines, solid colors, and clear emotional expression.
Use bright, friendly color palette with gentle shading that maintains clarity at all sizes.
Exaggerate expressive features - extra large eyes showing emotion, simple mouth conveying feeling clearly.
Add emoticon-style elements like hearts, stars, sweat drops, or other symbols that enhance the emotion.
Keep the design simple and iconic enough to be recognized even at small thumbnail size.
Create a character that could be part of an emoticon set - consistent style, clear emotion, charming appeal.
Simple emoticon aesthetic, clear expression, vibrant cheerful colors, high resolution, messaging-friendly design.
`,

  // 13. 디즈니 주인공 - 디즈니 애니메이션 캐릭터
  'disney-character': `
Transform this pet into a Disney animated character with that signature magical Disney charm.
Apply classic Disney animation style - expressive features, appealing proportions, warm personality.
Use rich, vibrant Disney color palette with beautiful gradients and that special Disney glow and warmth.
Enhance features to be more expressive and endearing - large, sparkling eyes full of life, gentle smile, soft features.
Add Disney-quality fur or hair rendering - flowing, dynamic, with that signature animation shimmer and shine.
Create a magical Disney background - enchanted setting, dreamy atmosphere, or iconic Disney-style landscape.
Include Disney magical effects like sparkles, glowing lights, musical notes, or fairy dust around the character.
Capture that special Disney emotion and personality - brave, kind, adventurous, or heartwarming character essence.
Premium Disney animation quality, magical atmosphere, heartwarming expression, ultra-high resolution, theatrical quality.
`,

  // 14. 천사 - 순수하고 신성한 천사
  'angel': `
Transform this pet into a beautiful angel with divine, heavenly presence and pure innocence.
Create ethereal, heavenly atmosphere with soft, glowing divine light from above creating a sacred aura.
Apply angel wings - white feathered wings with detailed plumage, soft and majestic, naturally positioned.
Use pure, heavenly color palette - whites, soft golds, gentle blues, with ethereal glowing effects.
Add angelic accessories - golden halo floating above head, flowing white robes, or divine light emanation.
Place in a heavenly setting - clouds, heavenly light rays, starry sky, or divine architectural elements.
Include divine effects like soft glowing aura, floating light particles, gentle sparkles, or holy radiance.
Capture a serene, peaceful, pure expression conveying innocence, kindness, and divine grace.
Heavenly divine aesthetic, soft ethereal lighting, angelic purity, ultra-high resolution, celestial beauty.
`,

  // 15. 산타 - 크리스마스 산타클로스
  'santa': `
Transform this pet into an adorable Santa Claus character spreading Christmas joy and cheer.
Create festive, warm Christmas atmosphere with cozy lighting and magical holiday spirit.
Apply Santa costume elements - red Santa suit with white fur trim, Santa hat, wide black belt with golden buckle.
Use classic Christmas colors - rich reds, pure whites, forest greens, with golden accents and festive sparkles.
Add Santa accessories - toy bag, presents, jingle bells, or candy canes that enhance the holiday theme.
Place in Christmas setting - snowy scene, decorated Christmas tree, cozy fireplace, or Santa's workshop.
Include Christmas magic effects - falling snow, twinkling lights, magical sparkles, or festive glow.
Capture a jolly, warm, friendly expression full of Christmas spirit and holiday happiness.
Festive Christmas aesthetic, warm cozy lighting, joyful holiday charm, high resolution, shareable Christmas spirit.
`
};

// 기본 프롬프트 (타입이 지정되지 않은 경우)
export const DEFAULT_PROMPT = PET_PROMPTS.masterpiece;

// 유효한 반려동물 변형 타입 목록
export const VALID_PET_TYPES = Object.keys(PET_PROMPTS);
