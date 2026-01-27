import { Storage } from '@apps-in-toss/web-framework'
import { useState, useCallback, useEffect } from 'react'

const USER_INFO_STORAGE_KEY = 'FORTUNE_CAT_USER_INFO'

function isValidUserInfo(userInfo) {
  if (!userInfo || typeof userInfo !== 'object') return false

  const { name, birthdate, gender } = userInfo

  if (!name || !birthdate || !gender) return false
  if (!birthdate.year || !birthdate.month || !birthdate.day) return false
  if (!['male', 'female'].includes(gender)) return false

  // email, phone은 선택적 필드이므로 유효성 검사하지 않음

  return true
}

export function useUserInfoStorage() {
  const [storedUserInfo, setStoredUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserInfo = useCallback(async () => {
    setLoading(true)
    try {
      const jsonString = await Storage.getItem(USER_INFO_STORAGE_KEY)
      console.log('[Storage] 불러온 데이터:', jsonString)

      if (!jsonString) {
        setStoredUserInfo(null)
        return null
      }

      const parsed = JSON.parse(jsonString)
      console.log('[Storage] 파싱된 데이터:', parsed)

      if (!isValidUserInfo(parsed)) {
        console.warn('[Storage] 저장된 데이터가 유효하지 않습니다:', parsed)
        await Storage.removeItem(USER_INFO_STORAGE_KEY)
        setStoredUserInfo(null)
        return null
      }

      console.log('[Storage] 유효한 데이터 로드 성공:', parsed)
      setStoredUserInfo(parsed)
      return parsed
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error)
      try {
        await Storage.removeItem(USER_INFO_STORAGE_KEY)
      } catch (e) {
        console.error('손상된 데이터 삭제 실패:', e)
      }
      setStoredUserInfo(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const saveUserInfo = useCallback(async (userInfo) => {
    try {
      console.log('[Storage] 저장 시도:', userInfo)

      if (!isValidUserInfo(userInfo)) {
        console.error('[Storage] 유효하지 않은 데이터:', userInfo)
        throw new Error('유효하지 않은 사용자 정보입니다.')
      }

      const jsonString = JSON.stringify(userInfo)
      console.log('[Storage] JSON 변환 완료:', jsonString)
      await Storage.setItem(USER_INFO_STORAGE_KEY, jsonString)
      console.log('[Storage] 저장 완료')
      setStoredUserInfo(userInfo)
      return true
    } catch (error) {
      console.error('사용자 정보 저장 실패:', error)
      return false
    }
  }, [])

  const clearUserInfo = useCallback(async () => {
    try {
      await Storage.removeItem(USER_INFO_STORAGE_KEY)
      setStoredUserInfo(null)
      return true
    } catch (error) {
      console.error('사용자 정보 삭제 실패:', error)
      return false
    }
  }, [])

  useEffect(() => {
    loadUserInfo()
  }, [loadUserInfo])

  return {
    loading,
    storedUserInfo,
    saveUserInfo,
    loadUserInfo,
    clearUserInfo
  }
}
