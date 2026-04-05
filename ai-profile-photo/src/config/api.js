// API 기본 URL
//const API_BASE_URL = 'https://ai-profile-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
const API_BASE_URL = 'http://192.168.0.28:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  // 프로필 타입 목록
  GET_PROFILE_TYPES: `${API_BASE_URL}/get-profile-types`,
  // 세트 생성 (결제 후 6장 병렬)
  GENERATE_SET: `${API_BASE_URL}/generate-profile-set`,
  // 기존 단건 생성 (하위 호환)
  GENERATE_PROFILE: `${API_BASE_URL}/generate-profile-photo`,
};

// 인앱결제 상품 SKU
export const PROFILE_PRODUCT_SKU = 'ait.profile.hires.single';
