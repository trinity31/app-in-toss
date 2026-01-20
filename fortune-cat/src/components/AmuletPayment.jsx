import { useState, useEffect } from 'react'
import { Loader } from '@toss/tds-mobile'

// /saju-reading 경로를 제거하여 base URL 추출
const API_BASE_URL = import.meta.env.VITE_SAJU_AI_ENDPOINT.replace('/saju-reading', '')
const AMULET_PRODUCT_SKU = import.meta.env.VITE_AMULET_PRODUCT_SKU

export default function AmuletPayment({ onNext, onBack, userData }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState(null)
  const [productInfo, setProductInfo] = useState(null)

  // 상품 정보 조회
  useEffect(() => {
    async function fetchProductInfo() {
      try {
        setIsLoading(true)
        const { IAP } = await import('@apps-in-toss/web-framework')
        const response = await IAP.getProductItemList()

        if (response?.products) {
          const amuletProduct = response.products.find(p => p.sku === AMULET_PRODUCT_SKU)
          if (amuletProduct) {
            setProductInfo(amuletProduct)
          } else {
            // SKU가 없으면 첫 번째 상품 사용 (개발용)
            setProductInfo(response.products[0] || null)
          }
        }
      } catch (err) {
        console.error('[AmuletPayment] 상품 정보 조회 실패:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductInfo()
  }, [])

  const handlePurchase = async () => {
    const sku = productInfo?.sku || AMULET_PRODUCT_SKU
    console.log('[AmuletPayment] SKU:', sku)

    if (!sku) {
      setError('상품 SKU가 설정되지 않았습니다')
      return
    }

    setIsPurchasing(true)
    setError(null)

    const { IAP } = await import('@apps-in-toss/web-framework')

    // 인앱결제 요청 (콜백 기반 API)
    const cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku,
        // 결제 성공 시 상품 지급 로직 실행
        processProductGrant: async ({ orderId }) => {
          console.log('[AmuletPayment] 상품 지급 로직 실행:', orderId)

          // birthdate 형식 변환 (문자열 → 정수)
          const bd = userData.birthdate
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
            userKey: userData.tossUserInfo?.userKey,
            tossName: userData.tossUserInfo?.name,
            phone: userData.phone,
            email: userData.email,
            name: userData.name,
            birthdate: formattedBirthdate,
            gender: userData.gender,
            amuletType: userData.amuletType,
            amuletTypeTitle: userData.amuletTypeTitle,
            productSku: sku,
          }
          console.log('[AmuletPayment] 요청 데이터:', JSON.stringify(requestBody, null, 2))

          try {
            // 백엔드 API 호출하여 부적 주문 등록
            const response = await fetch(`${API_BASE_URL}/amulet-order`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
              console.error('[AmuletPayment] 주문 등록 실패')
              return false
            }

            console.log('[AmuletPayment] 주문 등록 성공')
            return true
          } catch (err) {
            console.error('[AmuletPayment] 주문 등록 에러:', err)
            return false
          }
        },
      },
      onEvent: (event) => {
        console.log('[AmuletPayment] 이벤트:', event)
        cleanup?.()
        setIsPurchasing(false)

        if (event.type === 'success') {
          // 결과 화면으로 이동
          onNext({
            orderId: event.data?.orderId,
          })
        }
      },
      onError: (error) => {
        console.error('[AmuletPayment] 결제 에러:', error)
        cleanup?.()
        setIsPurchasing(false)
        setError(error.message || '결제에 실패했습니다. 다시 시도해 주세요.')
      },
    })
  }

  return (
    <>
      <div style={{ padding: '20px 20px 100px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          결제 정보를 확인해 주세요
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7684', lineHeight: '1.6', margin: '0 0 32px 0' }}>
          결제 완료 후 24시간 이내에<br />
          문자로 부적 이미지를 보내드립니다
        </p>

        <div style={{
          background: '#F7F8FA',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '4px' }}>상품</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#191F28', margin: 0 }}>
              {userData.amuletTypeTitle} 부적
            </p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '4px' }}>신청자</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#191F28', margin: 0 }}>
              {userData.name}님
            </p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '4px' }}>이메일</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#191F28', margin: 0 }}>
              {userData.email}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '4px' }}>휴대폰 번호</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#191F28', margin: 0 }}>
              {userData.phone}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '12px'
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: '#6B7684', margin: 0 }}>상품 정보를 불러오는 중...</p>
          </div>
        ) : productInfo && (
          <div style={{
            background: 'var(--color-primary-light)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <p style={{ fontSize: '13px', color: '#6B7684', marginBottom: '4px' }}>결제 금액</p>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', margin: 0 }}>
                {productInfo.displayAmount}
              </p>
            </div>
          </div>
        )}

        {isPurchasing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            gap: '16px'
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: '#6B7684', margin: 0 }}>결제 진행 중...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <p style={{ fontSize: '14px', color: '#F04452', margin: 0 }}>{error}</p>
          </div>
        )}
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
          disabled={isPurchasing}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: isPurchasing ? 'not-allowed' : 'pointer',
            opacity: isPurchasing ? 0.5 : 1
          }}
        >
          이전
        </button>
        <button
          onClick={handlePurchase}
          disabled={isPurchasing || isLoading}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: isPurchasing || isLoading ? 'var(--color-disabled)' : 'var(--color-primary)',
            border: 'none',
            borderRadius: '8px',
            cursor: isPurchasing || isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {productInfo?.displayAmount ? `${productInfo.displayAmount} 결제하기` : '결제하기'}
        </button>
      </div>
    </>
  )
}
