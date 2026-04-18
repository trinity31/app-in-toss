const TEST_AD_GROUP_ID = "ait-ad-test-rewarded-id";

// 테스트 광고로 고정할 user_anonymous_id 목록 (운영/검수용)
const TEST_ANONYMOUS_IDS = new Set([
  "CYVJ69j65gsXUnChiroCNzFmTfo",
]);

export function resolveAdGroupId(anonymousKey) {
  if (anonymousKey && TEST_ANONYMOUS_IDS.has(anonymousKey)) {
    return TEST_AD_GROUP_ID;
  }
  return import.meta.env.VITE_AD_GROUP_ID || TEST_AD_GROUP_ID;
}
