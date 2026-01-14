import { useState, useEffect } from 'react'
import Intro from '../components/Intro'
import NameInput from '../components/NameInput'
import BirthdateInput from '../components/BirthdateInput'
import GenderSelect from '../components/GenderSelect'
import AmuletTypeSelect from '../components/AmuletTypeSelect'
import EmailInput from '../components/EmailInput'
import AmuletResult from '../components/AmuletResult'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'
import { StepperRow } from '@toss/tds-mobile'

export default function AmuletPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [userData, setUserData] = useState({})
  const [isInitializing, setIsInitializing] = useState(true)

  const { loading, storedUserInfo, saveUserInfo } = useUserInfoStorage()

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

    if (data.name || data.birthdate || data.gender) {
      const dataToSave = {
        name: updatedData.name,
        birthdate: updatedData.birthdate,
        gender: updatedData.gender
      }
      saveUserInfo(dataToSave)
    }

    if (currentPage === 'intro') {
      setCurrentPage('name')
    } else if (currentPage === 'name') {
      setCurrentPage('birthdate')
    } else if (currentPage === 'birthdate') {
      setCurrentPage('gender')
    } else if (currentPage === 'gender') {
      setCurrentPage('amuletType')
    } else if (currentPage === 'amuletType') {
      setCurrentPage('email')
    } else if (currentPage === 'email') {
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
    } else if (currentPage === 'amuletType') {
      setCurrentPage('gender')
    } else if (currentPage === 'email') {
      setCurrentPage('amuletType')
    }
  }

  const handleRestart = () => {
    setUserData({})
    setCurrentPage('intro')
  }

  const handleBackToTypeSelect = () => {
    const { amuletType, amuletTypeTitle, email, ...restData } = userData
    setUserData(restData)
    setCurrentPage('amuletType')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <Intro
            onNext={handleNext}
            title="나만의 부적 이미지"
            subtitle="사주에 맞는 특별한 부적 이미지를 만들어 보세요"
            heroImages={['/images/amulet-sample.png']}
            steps={
              <>
                <StepperRow
                  left={<StepperRow.NumberIcon number={1} />}
                  center={
                    <StepperRow.Texts
                      type="A"
                      title="생년월일과 태어난 시간을 입력하고"
                      description=""
                    />
                  }
                />
                <StepperRow
                  left={<StepperRow.NumberIcon number={2} />}
                  center={
                    <StepperRow.Texts
                      type="A"
                      title="원하는 부적 스타일을 선택하면"
                      description=""
                    />
                  }
                />
                <StepperRow
                  left={<StepperRow.NumberIcon number={3} />}
                  center={
                    <StepperRow.Texts
                      type="A"
                      title="24시간 내 이메일로 부적 이미지를 보내드려요"
                      description=""
                    />
                  }
                  hideLine={true}
                />
              </>
            }
          />
        )
      case 'name':
        return <NameInput onNext={handleNext} onBack={handleBack} initialValue={userData.name || ''} />
      case 'birthdate':
        return <BirthdateInput name={userData.name} onNext={handleNext} onBack={handleBack} initialBirthdate={userData.birthdate || null} />
      case 'gender':
        return <GenderSelect onNext={handleNext} onBack={handleBack} initialGender={userData.gender || null} />
      case 'amuletType':
        return <AmuletTypeSelect onNext={handleNext} onBack={handleBack} />
      case 'email':
        return <EmailInput onNext={handleNext} onBack={handleBack} initialEmail={userData.email || ''} />
      case 'result':
        return <AmuletResult userData={userData} onRestart={handleRestart} onBackToTypeSelect={handleBackToTypeSelect} />
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
