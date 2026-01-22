import { useState, useEffect } from 'react'
import Intro from '../components/Intro'
import NameInput from '../components/NameInput'
import BirthdateInput from '../components/BirthdateInput'
import GenderSelect from '../components/GenderSelect'
import AmuletTypeSelect from '../components/AmuletTypeSelect'
import TossLogin from '../components/TossLogin'
import ContactInput from '../components/ContactInput'
import AmuletPayment from '../components/AmuletPayment'
import AmuletResult from '../components/AmuletResult'
import { useUserInfoStorage } from '../hooks/useUserInfoStorage'
import { usePendingOrderStorage, shouldSkipAutoRestore } from '../hooks/usePendingOrderStorage'
import { StepperRow, Loader } from '@toss/tds-mobile'

// /saju-reading 경로를 제거하여 base URL 추출
const API_BASE_URL = import.meta.env.VITE_SAJU_AI_ENDPOINT.replace('/saju-reading', '')

export default function AmuletPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [userData, setUserData] = useState({})
  const [isInitializing, setIsInitializing] = useState(true)
  const [isRestoringOrder, setIsRestoringOrder] = useState(false)
  const [pendingOrders, setPendingOrders] = useState([]) // 미완료 주문 목록

  const { loading, storedUserInfo, saveUserInfo } = useUserInfoStorage()
  const { loading: pendingLoading, pendingOrderData, clearPendingOrderData } = usePendingOrderStorage()

  // 백엔드 API 호출하여 상품 지급 처리
  const grantProduct = async (orderId, orderData) => {
    const bd = orderData.birthdate
    const formattedBirthdate = {
      year: parseInt(bd?.year) || 0,
      month: parseInt(bd?.month) || 0,
      day: parseInt(bd?.day) || 0,
      hour: bd?.hour ? parseInt(bd.hour) : null,
      minute: bd?.minute ? parseInt(bd.minute) : null,
      isLunar: false,
    }

    const requestBody = {
      orderId,
      userKey: orderData.tossUserInfo?.userKey,
      tossName: orderData.tossUserInfo?.name,
      phone: orderData.phone,
      email: orderData.email,
      name: orderData.name,
      birthdate: formattedBirthdate,
      gender: orderData.gender,
      amuletType: orderData.amuletType,
      amuletTypeTitle: orderData.amuletTypeTitle,
      productSku: orderData.productSku,
    }
    console.log('[AmuletPage] 주문 복원 요청:', JSON.stringify(requestBody, null, 2))

    try {
      const response = await fetch(`${API_BASE_URL}/amulet-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        console.error('[AmuletPage] 주문 등록 실패')
        return false
      }

      console.log('[AmuletPage] 주문 등록 성공')
      return true
    } catch (err) {
      console.error('[AmuletPage] 주문 등록 에러:', err)
      return false
    }
  }

  // 앱 시작 시 미완료 주문 확인
  useEffect(() => {
    async function checkPendingOrders() {
      if (loading || pendingLoading) return

      // 저장된 사용자 정보 복원
      if (storedUserInfo) {
        setUserData(storedUserInfo)
      }

      // 테스트 모드에서는 미완료 주문 확인 건너뛰기
      if (shouldSkipAutoRestore()) {
        console.log('[AmuletPage] 미완료 주문 확인 건너뛰기 (테스트 모드)')
        setIsInitializing(false)
        return
      }

      // 미완료 주문 확인 (pendingOrderData가 있을 때만)
      if (pendingOrderData) {
        try {
          const { IAP } = await import('@apps-in-toss/web-framework')
          const response = await IAP.getPendingOrders()
          console.log('[AmuletPage] getPendingOrders 응답:', response)

          const orders = Array.isArray(response) ? response : (response?.orders || response?.pendingOrders || [])
          console.log('[AmuletPage] 파싱된 미완료 주문:', orders)

          if (orders?.length > 0) {
            setPendingOrders(orders)
          } else {
            // 미완료 주문이 없으면 localStorage 정리
            clearPendingOrderData()
          }
        } catch (err) {
          console.error('[AmuletPage] 미완료 주문 확인 실패:', err)
        }
      }

      setIsInitializing(false)
    }

    checkPendingOrders()
  }, [loading, pendingLoading])

  // 복구 버튼 클릭 시 실행
  const handleRestoreOrder = async () => {
    if (!pendingOrderData || pendingOrders.length === 0) return

    setIsRestoringOrder(true)
    try {
      const { IAP } = await import('@apps-in-toss/web-framework')

      for (let i = 0; i < pendingOrders.length; i++) {
        const order = pendingOrders[i]
        const orderId = order.orderId || order
        console.log('[AmuletPage] 주문 복원 시도:', orderId)

        const success = await grantProduct(orderId, pendingOrderData)

        if (success) {
          console.log('[AmuletPage] completeProductGrant 호출 - orderId:', orderId)
          try {
            await IAP.completeProductGrant({ params: { orderId } })
            console.log('[AmuletPage] completeProductGrant 완료')
          } catch (completeErr) {
            console.error('[AmuletPage] completeProductGrant 에러:', completeErr)
          }

          // 복원 성공 시 결과 화면으로 이동
          setUserData({ ...pendingOrderData, orderId })
          clearPendingOrderData()
          setPendingOrders([])
          setCurrentPage('result')
          setIsRestoringOrder(false)
          return
        }
      }

      // 모든 복원 시도 실패
      alert('주문 복원에 실패했습니다. 잠시 후 다시 시도해 주세요.')
    } catch (err) {
      console.error('[AmuletPage] 주문 복원 실패:', err)
      alert('주문 복원 중 오류가 발생했습니다.')
    }

    setIsRestoringOrder(false)
  }

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
      setCurrentPage('tossLogin')
    } else if (currentPage === 'tossLogin') {
      setCurrentPage('contactInput')
    } else if (currentPage === 'contactInput') {
      setCurrentPage('payment')
    } else if (currentPage === 'payment') {
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
    } else if (currentPage === 'tossLogin') {
      setCurrentPage('amuletType')
    } else if (currentPage === 'contactInput') {
      setCurrentPage('tossLogin')
    } else if (currentPage === 'payment') {
      setCurrentPage('contactInput')
    }
  }

  const handleRestart = () => {
    setUserData({})
    setCurrentPage('intro')
  }

  const handleBackToTypeSelect = () => {
    const { amuletType, amuletTypeTitle, tossUserInfo, orderId, email, phone, ...restData } = userData
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
      case 'tossLogin':
        return <TossLogin onNext={handleNext} onBack={handleBack} userData={userData} />
      case 'contactInput':
        return <ContactInput onNext={handleNext} onBack={handleBack} userData={userData} />
      case 'payment':
        return <AmuletPayment onNext={handleNext} onBack={handleBack} userData={userData} />
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <Loader />
        <p style={{ fontSize: '16px', color: '#8B95A1', margin: 0 }}>
          로딩 중...
        </p>
      </div>
    )
  }

  // 복구할 주문이 있으면 배너 표시
  if (pendingOrders.length > 0 && pendingOrderData && currentPage === 'intro') {
    return (
      <div style={{ minHeight: '100vh', background: '#fff' }}>
        {/* 복구 배너 */}
        <div style={{
          background: '#FFF8E6',
          padding: '16px 20px',
          borderBottom: '1px solid #FFE4B5'
        }}>
          <p style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#B86E00',
            margin: '0 0 8px 0'
          }}>
            이전에 완료되지 않은 결제가 있습니다
          </p>
          <p style={{
            fontSize: '13px',
            color: '#8B7355',
            margin: '0 0 12px 0',
            lineHeight: '1.5'
          }}>
            {pendingOrderData.amuletTypeTitle} 부적 ({pendingOrderData.name}님)
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleRestoreOrder}
              disabled={isRestoringOrder}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#fff',
                background: isRestoringOrder ? '#ccc' : '#B86E00',
                border: 'none',
                borderRadius: '8px',
                cursor: isRestoringOrder ? 'not-allowed' : 'pointer'
              }}
            >
              {isRestoringOrder ? '복원 중...' : '주문 복원하기'}
            </button>
            <button
              onClick={() => {
                clearPendingOrderData()
                setPendingOrders([])
              }}
              disabled={isRestoringOrder}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#8B7355',
                background: '#fff',
                border: '1px solid #E5D9C3',
                borderRadius: '8px',
                cursor: isRestoringOrder ? 'not-allowed' : 'pointer'
              }}
            >
              무시
            </button>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#8B7355',
            margin: '12px 0 0 0',
            lineHeight: '1.5'
          }}>
            복원이 안 되는 경우 <a href="mailto:admin@davinci-apps.online" style={{ color: '#B86E00' }}>admin@davinci-apps.online</a>으로 문의해 주세요
          </p>
        </div>

        {/* Intro 페이지 렌더링 */}
        {renderPage()}
      </div>
    )
  }

  return renderPage()
}
