import { useState, useEffect } from 'react'
import Intro from '../components/Intro'
import NameInput from '../components/NameInput'
import BirthdateInput from '../components/BirthdateInput'
import GenderSelect from '../components/GenderSelect'
import FortuneTypeSelect from '../components/FortuneTypeSelect'
import PhotoUpload from '../components/PhotoUpload'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'

export default function SajuPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [userData, setUserData] = useState({})
  const [isInitializing, setIsInitializing] = useState(true)

  const { loading, storedUserInfo, saveUserInfo } = useUserInfoStorage()

  // 저장된 정보로 초기화
  useEffect(() => {
    if (!loading) {
      if (storedUserInfo) {
        setUserData(storedUserInfo)
      }
      setIsInitializing(false)
    }
  }, [loading, storedUserInfo])

  const handleNext = (data) => {
    const updatedData = { ...userData, ...data }
    setUserData(updatedData)

    // 사용자 기본 정보만 저장 (name, birthdate, gender)
    if (data.name || data.birthdate || data.gender) {
      // 저장할 때는 필요한 필드만 추출 (순환 참조 방지)
      const dataToSave = {
        name: updatedData.name,
        birthdate: updatedData.birthdate,
        gender: updatedData.gender
      }
      saveUserInfo(dataToSave)
    }

    // 페이지 순서대로 이동
    if (currentPage === 'intro') {
      setCurrentPage('name')
    } else if (currentPage === 'name') {
      setCurrentPage('birthdate')
    } else if (currentPage === 'birthdate') {
      setCurrentPage('gender')
    } else if (currentPage === 'gender') {
      setCurrentPage('fortuneType')
    } else if (currentPage === 'fortuneType') {
      // 타입이 'basic'인 경우에만 사진 업로드
      if (data.fortuneType === 'basic') {
        setCurrentPage('photoUpload')
      } else {
        // 다른 타입은 바로 로딩으로 이동 (TODO: 각 타입별 분기 구현 필요)
        setCurrentPage('loading')
      }
    } else if (currentPage === 'photoUpload') {
      setCurrentPage('loading')
    } else if (currentPage === 'loading') {
      setCurrentPage('result')
    }
  }

  const handleBack = () => {
    if (currentPage === 'name') {
      setCurrentPage('intro')
    } else if (currentPage === 'birthdate') {
      setCurrentPage('name')
    } else if (currentPage === 'gender') {
      setCurrentPage('birthdate')
    } else if (currentPage === 'fortuneType') {
      setCurrentPage('gender')
    } else if (currentPage === 'photoUpload') {
      setCurrentPage('fortuneType')
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return <Intro onNext={handleNext} />
      case 'name':
        return <NameInput onNext={handleNext} onBack={handleBack} initialValue={userData.name || ''} />
      case 'birthdate':
        return <BirthdateInput name={userData.name} onNext={handleNext} onBack={handleBack} initialBirthdate={userData.birthdate || null} />
      case 'gender':
        return <GenderSelect onNext={handleNext} onBack={handleBack} initialGender={userData.gender || null} />
      case 'fortuneType':
        return <FortuneTypeSelect onNext={handleNext} onBack={handleBack} />
      case 'photoUpload':
        return <PhotoUpload onNext={handleNext} onBack={handleBack} />
      case 'loading':
        return <Loading userData={userData} onNext={handleNext} />
      case 'result':
        return <Result userData={userData} />
      default:
        return <Intro onNext={handleNext} />
    }
  }

  if (isInitializing) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#8B95A1'
      }}>
        로딩 중...
      </div>
    )
  }

  return renderPage()
}
