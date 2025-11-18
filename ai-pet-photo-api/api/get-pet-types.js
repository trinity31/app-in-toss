// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    'https://ai-pet-studio.apps.tossmini.com',
    'https://ai-pet-studio.private-apps.tossmini.com',
    'http://localhost:5173',
    'http://192.168.0.25:5173'
  ];
}

// 반려동물 타입 목록
const PET_TYPES = [
  {
    id: 'masterpiece',
    title: '명화 속 주인공',
    description: '고전 명화 스타일',
    icon: 'u1F3A8.png' // 🎨
  },
  {
    id: 'halloween',
    title: '할로윈 마녀',
    description: '귀엽고 재미있는 할로윈',
    icon: 'u1F383.png' // 🎃
  },
  {
    id: 'superhero',
    title: '슈퍼히어로',
    description: '멋진 히어로 컨셉',
    icon: 'u1F9B8.png' // 🦸
  },
  {
    id: 'royal',
    title: '왕족/귀족',
    description: '우아하고 고귀한 느낌',
    icon: 'u1F451.png' // 👑
  },
  {
    id: 'cartoon',
    title: '만화 캐릭터',
    description: '귀여운 애니메이션',
    icon: 'u1F3AC.png' // 🎬
  },
  {
    id: 'hybrid-animal',
    title: '다른 동물과 합체',
    description: '신기한 하이브리드',
    icon: 'u1F98B.png' // 🦋
  },
  {
    id: 'fairytale-hero',
    title: '동화 주인공',
    description: '클래식 동화',
    icon: 'u1F9DA.png' // 🧚
  },
  {
    id: 'figure',
    title: '피규어',
    description: '수집용 피규어',
    icon: 'u1F5FF.png' // 🗿
  },
  {
    id: 'plush-toy',
    title: '봉제인형',
    description: '귀여운 인형',
    icon: 'u1F9F8.png' // 🧸
  },
  {
    id: 'looney-tunes',
    title: '루니툰 스타일',
    description: '클래식 카툰',
    icon: 'u1F43E.png' // 🐾
  },
  {
    id: 'sticker',
    title: '스티커',
    description: 'SNS용 스티커',
    icon: 'u1F3F7.png' // 🏷
  },
  {
    id: 'emoticon',
    title: '이모티콘',
    description: '귀여운 이모티콘',
    icon: 'u1F60A.png' // 😊
  },
  {
    id: 'disney-character',
    title: '디즈니 주인공',
    description: '디즈니 애니메이션',
    icon: 'u2728.png' // ✨
  },
  {
    id: 'angel',
    title: '천사',
    description: '순수한 천사',
    icon: 'u1F47C.png' // 👼
  },
  {
    id: 'santa',
    title: '산타',
    description: '크리스마스 산타',
    icon: 'u1F385.png' // 🎅
  }
];

export default async function handler(req, res) {
  // Origin 검증 및 CORS 헤더 설정
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // 반려동물 타입 목록 반환
    return res.status(200).json({
      success: true,
      profileTypes: PET_TYPES
    });
  } catch (error) {
    console.error('Error fetching pet types:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
