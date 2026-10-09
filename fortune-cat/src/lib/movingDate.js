export const MOVING_MAX_DATE = "2050-12-31";

export function koreanToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function civilDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(stamp) &&
    new Date(stamp).toISOString().slice(0, 10) === value
    ? stamp
    : null;
}

export function movingPeriodError(
  period,
  today = koreanToday(),
) {
  if (!period) return "이사 희망 기간을 선택해 주세요.";
  const first = civilDate(period.start_date),
    last = civilDate(period.end_date);
  if (first === null || last === null)
    return "시작일과 종료일을 모두 올바른 날짜로 선택해 주세요.";
  if (period.start_date < today)
    return "시작일은 오늘 이후로 선택해 주세요. (한국 시간 기준)";
  if (last < first) return "종료일은 시작일 이후로 선택해 주세요.";
  if ((last - first) / 86_400_000 + 1 > 90)
    return "희망 기간은 시작일과 종료일을 포함해 최대 90일입니다.";
  if (period.end_date > MOVING_MAX_DATE)
    return "이사택일은 2050년 12월 31일까지 지원합니다.";
  return null;
}

export function appendMovingPeriod(formData, userData) {
  if (userData.readingType !== "moving_date") return;
  const error = movingPeriodError(userData.moving_period);
  if (error) throw new Error(error);
  formData.append("moving_start_date", userData.moving_period.start_date);
  formData.append("moving_end_date", userData.moving_period.end_date);
}

export function isMovingResponse(response, period) {
  if (!Object.hasOwn(response, "moving_date_result")) return false;
  if (response.is_preview) return Boolean(response.thread_id) && response.moving_date_result === null;
  const result = response.moving_date_result;
  if (!result || result.period?.start_date !== period.start_date || result.period?.end_date !== period.end_date
    || !Array.isArray(result.recommendations) || !Array.isArray(result.excluded_dates)) return false;
  const inPeriod = item => typeof item.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.date)
    && item.date >= period.start_date && item.date <= period.end_date;
  if (!result.recommendations.every(inPeriod) || !result.excluded_dates.every(inPeriod)) return false;
  if (result.status === "no_candidates") return !response.thread_id && result.recommendations.length === 0;
  return result.status === "ok" && Boolean(response.thread_id) && result.recommendations.length > 0 && result.recommendations.length <= 3;
}
