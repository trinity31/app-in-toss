// API 기본 URL
const API_BASE_URL = 'https://ai-profile-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
//const API_BASE_URL = 'http://192.168.0.28:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  GET_PROFILE_TYPES: `${API_BASE_URL}/get-profile-types`,
  GENERATE_PROFILE: `${API_BASE_URL}/generate-profile-photo`,
  UPLOAD_IMAGE: `${API_BASE_URL}/images/upload`,
  LIST_IMAGES: `${API_BASE_URL}/images/list`,
  DELETE_IMAGE: `${API_BASE_URL}/images/delete`,
  TOSS_LOGIN: `${API_BASE_URL}/toss-login`,
};

// 광고 그룹 ID
export const AD_GROUP_ID = 'ait.live.b1ba8a40762945e6';  //라이브
//export const AD_GROUP_ID = 'ait-ad-test-rewarded-id';  //테스트

// 연하장 인앱결제 상품 SKU
export const NEWYEAR_PRODUCT_SKU = 'ait.0000014499.18991038.9eb93b914b.0254727020';
