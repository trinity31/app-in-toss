import { Storage } from '@apps-in-toss/web-framework'
import { useState, useCallback, useEffect } from 'react'

const USER_INFO_STORAGE_KEY = 'FORTUNE_CAT_USER_INFO'

function isValidUserInfo(userInfo) {
  if (!userInfo || typeof userInfo !== 'object') return false

  const { name, birthdate, gender } = userInfo

  if (!name || !birthdate || !gender) return false
  if (!birthdate.year || !birthdate.month || !birthdate.day) return false
  if (!['male', 'female'].includes(gender)) return false

  return true
}

export function useUserInfoStorage() {
  const [storedUserInfo, setStoredUserInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUserInfo = useCallback(async () => {
    setLoading(true)
    try {
      const jsonString = await Storage.getItem(USER_INFO_STORAGE_KEY)

      if (!jsonString) {
        setStoredUserInfo(null)
        return null
      }

      const parsed = JSON.parse(jsonString)

      if (!isValidUserInfo(parsed)) {
        console.warn('저장된 데이터가 유효하지 않습니다.')
        await Storage.removeItem(USER_INFO_STORAGE_KEY)
        setStoredUserInfo(null)
        return null
      }

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
      if (!isValidUserInfo(userInfo)) {
        throw new Error('유효하지 않은 사용자 정보입니다.')
      }

      const jsonString = JSON.stringify(userInfo)
      await Storage.setItem(USER_INFO_STORAGE_KEY, jsonString)
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
