import { useState, useEffect } from 'react'
import { Loader } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import { NEWYEAR_PRODUCT_SKU } from '../config/api'
import { usePendingOrderStorage } from '../hooks/usePendingOrderStorage'

const CARD_TYPE_LABELS = {
  'new-year-card-illustration': '심플하고 따뜻한 느낌의 일러스트',
  'new-year-card-anime': '일본 만화풍',
  'new-year-card-chinese': '화려한 중국풍',
}

export default function NewYearPayment({ onNext, onBack, selectedImages, selectedCardType }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState(null)
  const [productInfo, setProductInfo] = useState(null)
  const { savePendingOrderData, clearPendingOrderData } = usePendingOrderStorage()

  useEffect(() => {
    async function initializePayment() {
      try {
        setIsLoading(true)
        const { IAP } = await import('@apps-in-toss/web-framework')
        const response = await IAP.getProductItemList()

        if (response?.products) {
          const product = response.products.find(p => p.sku === NEWYEAR_PRODUCT_SKU)
          if (product) {
            setProductInfo(product)
          } else {
            console.error('[NewYearPayment] SKU에 해당하는 상품을 찾을 수 없습니다:', NEWYEAR_PRODUCT_SKU)
            console.log('[NewYearPayment] 등록된 상품 목록:', response.products.map(p => p.sku))
            setError('상품 정보를 찾을 수 없습니다. 관리자에게 문의해 주세요.')
          }
        }
      } catch (err) {
        console.error('[NewYearPayment] 상품 정보 조회 실패:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initializePayment()
  }, [])

  const handlePurchase = async () => {
    if (isPurchasing) return

    const sku = productInfo?.sku || NEWYEAR_PRODUCT_SKU
    if (!sku) {
      setError('상품 SKU가 설정되지 않았습니다')
      return
    }

    setIsPurchasing(true)
    setError(null)

    // 결제 전 이미지 데이터를 Base64로 변환하여 localStorage에 저장 (복원용)
    try {
      const imageDataUris = await Promise.all(
        selectedImages.map(async (blob) => {
          const reader = new FileReader()
          return new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        })
      )

      savePendingOrderData({
        selectedImages: imageDataUris,
        selectedCardType,
        timestamp: Date.now(),
        productSku: sku,
      })
    } catch (err) {
      console.error('[NewYearPayment] 이미지 저장 실패:', err)
      setError('이미지 처리 중 오류가 발생했습니다.')
      setIsPurchasing(false)
      return
    }

    const { IAP } = await import('@apps-in-toss/web-framework')

    const cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku,
        processProductGrant: () => {
          return true
        },
      },
      onEvent: (event) => {
        cleanup?.()
        setIsPurchasing(false)

        if (event.type === 'success') {
          const orderId = event.data?.orderId
          onNext({ orderId })
        }
      },
      onError: (error) => {
        cleanup?.()
        setIsPurchasing(false)

        const errorMsg = error.message || ''
        if (errorMsg.includes('서버') || errorMsg.includes('processProductGrant')) {
          setError('결제가 완료되었지만 서버 전송에 실패했습니다. 앱을 다시 시작하면 자동으로 복구됩니다.')
        } else {
          setError(error.message || '결제에 실패했습니다. 다시 시도해 주세요.')
        }
      },
    })
  }

  const cardTypeLabel = CARD_TYPE_LABELS[selectedCardType] || selectedCardType

  return (
    <>
      <div style={{ padding: '20px 20px 140px', background: colors.white, minHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{
          fontSize: '22px',
          lineHeight: '1.4',
          fontWeight: 'bold',
          color: '#191F28',
          margin: '0 0 12px 0',
        }}>
          결제 정보를 확인해 주세요
        </h1>

        <div style={{
          background: '#F7F8FA',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
        }}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '4px' }}>상품</p>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#191F28', margin: 0 }}>
              AI 연하장 - {cardTypeLabel}
            </p>
          </div>

          {selectedImages && selectedImages.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '8px' }}>선택한 사진</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedImages.map((image, index) => (
                  <div key={index} style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `1px solid ${colors.grey200}`,
                  }}>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`선택된 이미지 ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '12px',
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: '#6B7684', margin: 0 }}>
              상품 정보를 불러오는 중...
            </p>
          </div>
        ) : (
          productInfo && (
            <div style={{
              background: colors.orange50,
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <div>
                <p style={{ fontSize: '13px', color: '#6B7684', marginBottom: '4px' }}>결제 금액</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: colors.red500, margin: 0 }}>
                  {productInfo.displayAmount}
                </p>
              </div>
            </div>
          )
        )}

        {isPurchasing && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            gap: '16px',
          }}>
            <Loader />
            <p style={{ fontSize: '14px', color: '#6B7684', margin: 0 }}>
              결제 진행 중...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FEF2F2',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px',
          }}>
            <p style={{ fontSize: '14px', color: '#F04452', margin: 0, fontWeight: '600' }}>
              {error}
            </p>
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
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
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
            opacity: isPurchasing ? 0.5 : 1,
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
            background: isPurchasing || isLoading ? colors.grey400 : colors.red500,
            border: 'none',
            borderRadius: '8px',
            cursor: isPurchasing || isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {productInfo?.displayAmount
            ? `${productInfo.displayAmount} 결제하기`
            : '결제하기'}
        </button>
      </div>
    </>
  )
}
