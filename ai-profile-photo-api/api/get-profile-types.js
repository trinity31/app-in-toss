import { PROFILE_TYPES_METADATA } from './prompts.js';

// 허용된 Origin 목록
function getAllowedOrigins() {
  return [
    'https://ai-profile-photo-studio.apps.tossmini.com',
    'https://ai-profile-photo-studio.private-apps.tossmini.com',
    'http://localhost:5173',
    'http://192.168.0.50:5173'
  ];
}

export default async function handler(req, res) {
  // Origin 검증 및 CORS 헤더 설정
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Preflight 요청 처리
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // GET 요청만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    // 메타데이터를 배열 형태로 변환
    const profileTypes = Object.keys(PROFILE_TYPES_METADATA).map(id => ({
      id,
      ...PROFILE_TYPES_METADATA[id]
    }));

    res.status(200).json({
      success: true,
      profileTypes
    });
  } catch (error) {
    console.error('프로필 타입 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '프로필 타입 목록을 가져오는 중 오류가 발생했습니다.'
    });
  }
}
