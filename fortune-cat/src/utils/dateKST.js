/**
 * KST(Asia/Seoul) 기준 오늘 날짜를 'YYYY-MM-DD' 문자열로 반환한다.
 *
 * Phase 4 (CONTEXT D-06, D-07): 모든 사용자 자정 리셋을 한국 자정으로 통일한다.
 * 디바이스 timezone 과 무관. en-CA locale 이 ISO 8601 형식을 보장한다.
 *
 * @returns {string} 'YYYY-MM-DD' (예: '2026-05-03')
 */
export function todayKST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
}
