import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import UserInfoInput from '../components/UserInfoInput'
import DeepReadingLoading from '../components/DeepReadingLoading'
import DeepReadingResult from '../components/DeepReadingResult'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'

export default function NewYearPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const selectedType = location.state?.selectedType

  const [currentPage, setCurrentPage] = useState('userInfo')
  const [userData, setUserData] = useState({})
  const [isInitializing, setIsInitializing] = useState(true)

  const { loading, storedUserInfo, saveUserInfo } = useUserInfoStorage()

  // 타입이 전달되지 않은 경우 홈으로 redirect
  useEffect(() => {
    if (!selectedType) {
      navigate('/', { replace: true })
    }
  }, [selectedType, navigate])

  // 저장된 정보로 초기화 + 선택된 타입 세팅
  useEffect(() => {
    if (!loading) {
      const { partnerName, partnerBirthdate, partnerGender, ...baseInfo } = storedUserInfo || {}
      const isCompatibility = selectedType?.fortuneType === 'ai_saju_compatibility'
      const initialData = isCompatibility
        ? { ...baseInfo, partnerName, partnerBirthdate, partnerGender }
        : { ...baseInfo }
      if (selectedType) {
        Object.assign(initialData, selectedType)
      }
      setUserData(initialData)
      setIsInitializing(false)
    }
  }, [loading, storedUserInfo])

  const handleNext = (data) => {
    const updatedData = { ...userData, ...data }
    setUserData(updatedData)

    if (data.name || data.birthdate || data.gender) {
      const dataToSave = {
        name: updatedData.name,
        birthdate: updatedData.birthdate,
        gender: updatedData.gender,
        partnerName: updatedData.partnerName || undefined,
        partnerBirthdate: updatedData.partnerBirthdate || undefined,
        partnerGender: updatedData.partnerGender || undefined,
      }
      saveUserInfo(dataToSave)
    }

    if (currentPage === 'userInfo') {
      setCurrentPage('loading')
    } else if (currentPage === 'loading') {
      setCurrentPage('result')
    }
  }

  const handleBack = () => {
    if (currentPage === 'userInfo') {
      navigate('/')
    }
  }

  const handleRestart = () => {
    navigate('/')
  }

  // 오늘의 운세 결과 하단 크로스 CTA → 생년월일은 그대로 두고 풀이 타입만 바꿔 재풀이
  // (이전 풀이 결과·궁합 정보는 버리고 본인 정보만 재사용 — 새 reading_type은 단독 풀이)
  const handleCrossReading = (cta) => {
    setUserData((prev) => ({
      name: prev.name,
      birthdate: prev.birthdate,
      gender: prev.gender,
      fortuneType: cta.reading_type,
      themeType: 'ai_saju',
      readingType: cta.reading_type,
      fortuneTypeTitle: cta.title,
    }))
    setCurrentPage('loading')
  }

  if (!selectedType) return null

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px',
        color: 'var(--color-gray-400)'
      }}>
        로딩 중...
      </div>
    )
  }

  switch (currentPage) {
    case 'userInfo':
      return <UserInfoInput onNext={handleNext} onBack={handleBack} initialUserInfo={userData} isCompatibility={selectedType?.fortuneType === 'ai_saju_compatibility'} />
    case 'loading':
      return <DeepReadingLoading userData={userData} onNext={handleNext} />
    case 'result':
      return <DeepReadingResult userData={userData} onRestart={handleRestart} onCrossReading={handleCrossReading} />
    default:
      return <UserInfoInput onNext={handleNext} onBack={handleBack} initialUserInfo={userData} isCompatibility={selectedType?.fortuneType === 'ai_saju_compatibility'} />
  }
}
