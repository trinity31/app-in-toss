import { useState, useEffect } from 'react'
import Intro from '../components/Intro'
import NameInput from '../components/NameInput'
import BirthdateInput from '../components/BirthdateInput'
import GenderSelect from '../components/GenderSelect'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'
import { Analytics } from '@apps-in-toss/web-framework'
import { colors } from '@toss/tds-colors'
import { StepperRow } from '@toss/tds-mobile'
import newYearCard from '../assets/images/new-year-2026-fortune.png'

export default function NewYearPage() {
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
      setCurrentPage('newYearType')
    } else if (currentPage === 'newYearType') {
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
    } else if (currentPage === 'newYearType') {
      setCurrentPage('gender')
    }
  }

  const handleRestart = () => {
    setUserData({})
    setCurrentPage('intro')
  }

  const handleBackToTypeSelect = () => {
    // fortuneResult 등 데이터 제거하고 타입 선택으로
    const { fortuneResult, ...restData } = userData
    setUserData(restData)
    setCurrentPage('newYearType')
  }



  // ... existing code

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <Intro
            onNext={handleNext}
            title="2026년 신년운세"
            subtitle="2026년 나의 운명과 행운의 연하장을 확인해보세요"
            heroImages={[newYearCard]}
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
                      title="신년운세 보기를 선택하면"
                      description=""
                    />
                  }
                />
                <StepperRow
                  left={<StepperRow.NumberIcon number={3} />}
                  center={
                    <StepperRow.Texts
                      type="A"
                      title="2026년 신년운세와 연하장 이미지 완성!"
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
      case 'newYearType':
        return <NewYearTypeSelect onNext={handleNext} onBack={handleBack} />
      case 'loading':
        return <Loading userData={userData} onNext={handleNext} />
      case 'result':
        return <Result userData={userData} onRestart={handleRestart} onBackToTypeSelect={handleBackToTypeSelect} />
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

function NewYearTypeSelect({ onNext, onBack }) {
  const [isSelected, setIsSelected] = useState(false)

  // 2026 신년운세 타입 하드코딩
  const handleSelect = () => {
    setIsSelected(true)
  }

  const handleNextStep = () => {
    Analytics.click({ button_name: 'new_year_2026_select' })
    onNext({
      fortuneType: 'new_year_2026',
      themeType: 'new_year_2026',
      readingType: 'new_year_2026'
    })
  }

  return (
    <>
      <div style={{ padding: '20px 20px 100px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          원하는 결과를 선택해 주세요
        </h1>

        <button
          onClick={handleSelect}
          style={{
            width: '100%',
            padding: '16px',
            background: isSelected ? '#F7F8FA' : '#fff',
            border: isSelected ? '2px solid var(--color-primary)' : '1px solid #E5E8EB',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '8px'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#191F28',
              marginBottom: '4px',
              transition: 'color 0.2s ease'
            }}>
              2026 신년운세
            </div>
            <div style={{
              fontSize: '14px',
              color: isSelected ? '#4E5968' : '#8B95A1',
              transition: 'color 0.2s ease'
            }}>
              내년 나의 운명은 어떨까요?
            </div>
          </div>
          <img
            src={newYearCard}
            alt="2026 신년운세"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              objectFit: 'cover',
              border: isSelected ? '2px solid var(--color-primary)' : 'none',
              transition: 'border 0.2s ease'
            }}
          />
        </button>
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={onBack}
          style={{
            flex: isSelected ? 1 : '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          이전
        </button>
        {isSelected && (
          <button
            onClick={handleNextStep}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            광고 보고 생성하기
          </button>
        )}
      </div>
    </>
  )
}
