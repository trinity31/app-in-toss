// API 기본 URL
//const API_BASE_URL = 'https://ai-pet-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
const API_BASE_URL = 'http://192.168.0.28:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  GENERATE_SET: `${API_BASE_URL}/generate-pet-set`,
  GENERATE_PET_PHOTO: `${API_BASE_URL}/generate-pet-photo`,
  TOSS_LOGIN: `${API_BASE_URL}/toss-login`,
};

// Supabase 이미지 저장
export const IMAGE_ENDPOINTS = {
  UPLOAD: `${API_BASE_URL}/images/upload`,
  LIST: `${API_BASE_URL}/images/list`,
  DELETE: `${API_BASE_URL}/images/delete`,
};
export const IMAGE_BUCKET = 'pet-profile-images';

// 인앱결제 상품 SKU
export const PET_SET_PRODUCT_SKU = 'ait.0000015038.174a84ee.cbd16d7509.5445481832';
