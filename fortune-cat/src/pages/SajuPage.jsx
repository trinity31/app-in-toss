import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import UserInfoInput from '../components/UserInfoInput'
import PhotoUpload from '../components/PhotoUpload'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'

const PHOTO_UPLOAD_TYPES = ['basic', 'lookbook', 'travel_lookbook']

export default function SajuPage() {
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
      const initialData = storedUserInfo ? { ...storedUserInfo } : {}
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
        gender: updatedData.gender
      }
      saveUserInfo(dataToSave)
    }

    if (currentPage === 'userInfo') {
      if (PHOTO_UPLOAD_TYPES.includes(updatedData.fortuneType)) {
        setCurrentPage('photoUpload')
      } else {
        setCurrentPage('loading')
      }
    } else if (currentPage === 'photoUpload') {
      setCurrentPage('loading')
    } else if (currentPage === 'loading') {
      setCurrentPage('result')
    }
  }

  const handleBack = () => {
    if (currentPage === 'userInfo') {
      navigate('/')
    } else if (currentPage === 'photoUpload') {
      setCurrentPage('userInfo')
    }
  }

  const handleRestart = () => {
    navigate('/')
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
        color: '#8B95A1'
      }}>
        로딩 중...
      </div>
    )
  }

  switch (currentPage) {
    case 'userInfo':
      return <UserInfoInput onNext={handleNext} onBack={handleBack} initialUserInfo={userData} />
    case 'photoUpload':
      return <PhotoUpload onNext={handleNext} onBack={handleBack} />
    case 'loading':
      return <Loading userData={userData} onNext={handleNext} />
    case 'result':
      return <Result userData={userData} onRestart={handleRestart} />
    default:
      return <UserInfoInput onNext={handleNext} onBack={handleBack} initialUserInfo={userData} />
  }
}
