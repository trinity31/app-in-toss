// API 기본 URL
const API_BASE_URL = 'https://ai-pet-photo-api.vercel.app/api';

// 로컬 개발 환경용 (필요시 주석 해제)
//const API_BASE_URL = 'http://192.168.0.25:3000/api';

// API 엔드포인트
export const API_ENDPOINTS = {
  GET_PET_TYPES: `${API_BASE_URL}/get-pet-types`,
  GENERATE_PET_PHOTO: `${API_BASE_URL}/generate-pet-photo`
};

// 광고 그룹 ID
export const AD_GROUP_ID = 'ait.live.75b5007d7da84183';

// 광고 로드 대기 시간 (10초)
export const AD_WAIT_TIMEOUT_MS = 10000;
