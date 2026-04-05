// API 기본 URL
const API_BASE_URL = 'https://ai-pet-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
//const API_BASE_URL = 'http://192.168.0.28:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  GENERATE_SET: `${API_BASE_URL}/generate-pet-set`,
  GENERATE_PET_PHOTO: `${API_BASE_URL}/generate-pet-photo`,
};

// 인앱결제 상품 SKU
export const PET_SET_PRODUCT_SKU = 'ait.pet.set.9';
