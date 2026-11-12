import { formatBirthdate } from '../utils/dataTransform.js';

export function jobPreferencesError(value) {
  if (!value || !Array.isArray(value.keyword_ids) || typeof value.interest !== 'string' ||
      (!value.keyword_ids.length && !value.interest.trim())) {
    return '키워드를 하나 이상 고르거나 관심 분야를 입력해 주세요.';
  }
  if (value.keyword_ids.length > 12 || value.interest.length > 300) return '관심 분야는 300자 이내로 입력해 주세요.';
  return null;
}

export function jobKeywordRequest(userData) {
  const bd = userData.birthdate;
  const fields = { name: userData.name || '사용자', gender: userData.gender,
    datetime: formatBirthdate(bd), birthday_type: bd.birthdayType || 'solar',
    is_leap_month: Boolean(bd.isLeapMonth) };
  if (bd.period && bd.period !== 'unknown') {
    if (bd.hour12) fields.hour = String(bd.hour12);
    if (bd.minuteRange) fields.minute = bd.minuteRange === '0-29' ? '00' : '30';
    fields.am_pm = bd.period.toUpperCase();
  }
  return fields;
}

export function appendJobPreferences(formData, userData) {
  if (userData.readingType !== 'job') return;
  const error = jobPreferencesError(userData.job_preferences);
  if (error) throw new Error(error);
  formData.append('job_preferences', JSON.stringify({ ...userData.job_preferences,
    interest: userData.job_preferences.interest.trim() }));
}
