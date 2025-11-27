// API 기본 URL
const API_BASE_URL = 'https://ai-profile-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
//const API_BASE_URL = 'http://192.168.0.25:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  GET_PROFILE_TYPES: `${API_BASE_URL}/get-profile-types`,
  GENERATE_PROFILE: `${API_BASE_URL}/generate-profile-photo`
};

// 광고 그룹 ID
export const AD_GROUP_ID = 'ait.live.b1ba8a40762945e6';  //라이브
//export const AD_GROUP_ID = 'ait-ad-test-rewarded-id';  //테스트
