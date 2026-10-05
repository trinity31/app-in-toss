// Merge the app menu with the shared catalog without duplicating deployed rows.
export const JOB_MENU = {
  id: 'ai_saju_job',
  code: 'ai_saju_job',
  title_ko: '사주로 알아보는 나의 업',
  description_ko: '내 사주에서 찾은 강점과 일하는 방식을 조합해, 나만의 업과 작게 시작할 방법을 알려드려요',
  icon: '✨',
  theme_type: 'ai_saju',
  reading_type: 'job',
  is_active: true,
  credits: 20,
};

export function withJobMenu(rows) {
  if (rows.some(row => row.code === JOB_MENU.code || row.reading_type === 'job')) return rows;
  const order = Math.max(0, ...rows.map(row => row.display_order || 0)) + 1;
  return [...rows, { ...JOB_MENU, display_order: order }];
}
