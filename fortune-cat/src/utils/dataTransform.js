/**
 * 생년월일 데이터를 API 형식(YYYY-MM-DD)으로 변환
 * @param {Object} birthdate - { year, month, day }
 * @returns {string} "YYYY-MM-DD" 형식의 날짜 문자열
 */
export function formatBirthdate(birthdate) {
  if (!birthdate || !birthdate.year || !birthdate.month || !birthdate.day) {
    throw new Error('생년월일 정보가 올바르지 않습니다.')
  }

  const year = birthdate.year.toString().padStart(4, '0')
  const month = birthdate.month.toString().padStart(2, '0')
  const day = birthdate.day.toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 태어난 시간 데이터를 API 형식(HH:mm)으로 변환
 * @param {string} period - 'am' | 'pm' | 'unknown'
 * @param {number|string} hour12 - 1-12 (12시간 형식)
 * @param {string} minuteRange - '0-29' | '30-59'
 * @returns {string} "HH:mm" 형식의 시간 문자열 또는 null (시간을 모르는 경우)
 */
export function formatBirthTime(period, hour12, minuteRange) {
  if (!period || period === 'unknown') {
    return null
  }

  if (!hour12 || !minuteRange) {
    throw new Error('태어난 시간 정보가 올바르지 않습니다.')
  }

  // 문자열을 숫자로 변환
  const hour12Num = typeof hour12 === 'string' ? parseInt(hour12) : hour12

  // 12시간 형식을 24시간 형식으로 변환
  let hour24 = hour12Num
  if (period === 'pm' && hour12Num !== 12) {
    hour24 = hour12Num + 12
  } else if (period === 'am' && hour12Num === 12) {
    hour24 = 0
  }

  // minuteRange에서 중간값 추출 (0-29 → 15, 30-59 → 45)
  const minute = minuteRange === '0-29' ? 15 : 45

  const hourStr = hour24.toString().padStart(2, '0')
  const minuteStr = minute.toString().padStart(2, '0')

  return `${hourStr}:${minuteStr}`
}

/**
 * 성별 데이터를 API 형식(M/F)으로 변환
 * @param {string} gender - 'male' | 'female'
 * @returns {string} 'M' | 'F'
 */
export function formatGender(gender) {
  if (!gender) {
    throw new Error('성별 정보가 없습니다.')
  }

  if (gender === 'male') return 'M'
  if (gender === 'female') return 'F'

  throw new Error(`지원하지 않는 성별 형식: ${gender}`)
}

/**
 * base64 문자열을 Blob으로 변환
 * @param {string} base64String - base64 인코딩된 이미지 데이터
 * @returns {Blob} 이미지 Blob 객체
 */
export function base64ToBlob(base64String) {
  if (!base64String) {
    return null
  }

  try {
    // data:image/jpeg;base64, 접두사 제거
    const base64Data = base64String.includes(',')
      ? base64String.split(',')[1]
      : base64String

    // base64를 binary로 디코딩
    const binaryString = atob(base64Data)

    // binary를 Uint8Array로 변환
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    // Blob 생성
    return new Blob([bytes], { type: 'image/jpeg' })
  } catch (error) {
    console.error('base64 to Blob 변환 실패:', error)
    throw new Error('이미지 데이터 변환에 실패했습니다.')
  }
}
