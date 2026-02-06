import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchAlbumPhotos, saveBase64Data, openCamera } from '@apps-in-toss/web-framework'
import { colors } from '@toss/tds-colors'
import Intro from '../components/Intro'
import Loading from '../components/Loading'
import Result from '../components/Result'
import NewYearPayment from '../components/NewYearPayment'
import TossLogin from '../components/TossLogin'
import { API_ENDPOINTS, NEWYEAR_PRODUCT_SKU } from '../config/api'
import { usePendingOrderStorage, shouldSkipAutoRestore } from '../hooks/usePendingOrderStorage'

// 연하장 썸네일 이미지
import { illustrationImg, animeImg, chineseImg } from '../config/images'

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

function getUserKey() {
  return localStorage.getItem('newyear_user_key')
}

function saveUserKey(userKey) {
  localStorage.setItem('newyear_user_key', userKey)
}

export default function NewYearPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedCardType, setSelectedCardType] = useState('new-year-card-illustration')
  const [maxPhotos, setMaxPhotos] = useState(3)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [isRestoring, setIsRestoring] = useState(false)
  const [tossUserInfo, setTossUserInfo] = useState(null)
  const [productPrice, setProductPrice] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const selectedCardTypeRef = useRef('new-year-card-illustration')

  const {
    loading: pendingLoading,
    pendingOrderData,
    clearPendingOrderData,
  } = usePendingOrderStorage()

  // 앱 시작 시 미완료 주문 확인
  useEffect(() => {
    async function checkPendingOrders() {
      if (pendingLoading) return

      if (shouldSkipAutoRestore()) {
        console.log('[NewYearPage] 미완료 주문 확인 건너뛰기 (테스트 모드)')
        return
      }

      if (pendingOrderData) {
        try {
          const { IAP } = await import('@apps-in-toss/web-framework')
          const response = await IAP.getPendingOrders()
          const orders = Array.isArray(response)
            ? response
            : response?.orders || response?.pendingOrders || []

          if (orders?.length > 0) {
            setPendingOrders(orders)
          } else {
            clearPendingOrderData()
          }
        } catch (err) {
          console.error('[NewYearPage] 미완료 주문 확인 실패:', err)
        }
      }
    }

    checkPendingOrders()
  }, [pendingLoading])

  // 상품 가격 미리 조회
  useEffect(() => {
    async function fetchPrice() {
      try {
        const { IAP } = await import('@apps-in-toss/web-framework')
        const response = await IAP.getProductItemList()
        const products = response?.products || response || []
        const product = (Array.isArray(products) ? products : []).find(p => p.sku === NEWYEAR_PRODUCT_SKU)
        if (product) setProductPrice(product.displayAmount)
      } catch (e) {
        console.log('[NewYearPage] 가격 조회 실패:', e)
      }
    }
    fetchPrice()
  }, [])

  // 히스토리 페이지에서 재생성 요청 시 자동 복구
  useEffect(() => {
    if (location.state?.restore && pendingOrderData && !pendingLoading) {
      // state 초기화 먼저 (뒤로가기 시 재실행 방지)
      navigate(location.pathname, { replace: true, state: {} })
      // 그 후 복구 실행
      handleRestoreOrder()
    }
  }, [location.state?.restore, pendingLoading])

  const handleAlbumSelect = async () => {
    try {
      setError(null)

      if (typeof fetchAlbumPhotos !== 'function') {
        setError('브라우저에서는 파일 선택 기능을 사용해주세요.')
        return
      }

      console.log('갤러리 열기 시작...')

      setLoadingMessage({
        title: '사진을 불러오고 있어요',
        description: '잠시만 기다려주세요'
      })
      setCurrentPage('loading')

      let photos;
      try {
        photos = await fetchAlbumPhotos({
          maxCount: maxPhotos,
          maxWidth: 384,
          base64: true
        })
      } catch (apiError) {
        console.error('fetchAlbumPhotos 에러:', apiError)
        setLoadingMessage(null)
        setCurrentPage('intro')
        return
      }

      if (!photos || photos.length === 0) {
        console.log('사진이 선택되지 않음')
        setLoadingMessage(null)
        setCurrentPage('intro')
        return
      }

      setLoadingMessage({
        title: '사진을 처리하고 있어요',
        description: '잠시만 기다려주세요'
      })

      const imageBlobs = await Promise.all(
        photos.map(async (photo) => {
          const normalizedDataUri = photo.dataUri.startsWith('data:')
            ? photo.dataUri
            : `data:image/jpeg;base64,${photo.dataUri}`

          const response = await fetch(normalizedDataUri)
          if (!response.ok) {
            throw new Error(`이미지 로드 실패: ${response.statusText}`)
          }

          return await response.blob()
        })
      )

      setSelectedImages(imageBlobs)
      setLoadingMessage(null)
      setCurrentPage('selection')

    } catch (err) {
      console.error('이미지 선택 오류:', err)
      setError(`이미지를 선택하는 중 오류가 발생했습니다: ${err.message}`)
      setLoadingMessage(null)
      setCurrentPage('intro')
    }
  }

  const handleCameraSelect = async () => {
    try {
      setError(null)

      if (typeof openCamera !== 'function') {
        setError('카메라 기능을 사용할 수 없습니다.')
        return
      }

      console.log('카메라 열기 시작...')

      setLoadingMessage({
        title: '카메라를 불러오고 있어요',
        description: '잠시만 기다려주세요'
      })
      setCurrentPage('loading')

      let photo;
      try {
        photo = await openCamera({
          maxWidth: 384,
          base64: true
        })
      } catch (apiError) {
        console.error('openCamera 에러:', apiError)
        setLoadingMessage(null)
        setCurrentPage('intro')
        return
      }

      if (!photo || !photo.dataUri) {
        console.log('사진이 촬영되지 않음')
        setLoadingMessage(null)
        setCurrentPage('intro')
        return
      }

      setLoadingMessage({
        title: '사진을 처리하고 있어요',
        description: '잠시만 기다려주세요'
      })

      const normalizedDataUri = photo.dataUri.startsWith('data:')
        ? photo.dataUri
        : `data:image/jpeg;base64,${photo.dataUri}`

      const response = await fetch(normalizedDataUri)
      const imageBlob = await response.blob()
      setSelectedImages([imageBlob])
      setLoadingMessage(null)
      setCurrentPage('selection')

    } catch (err) {
      console.error('카메라 촬영 오류:', err)
      setError(`카메라 촬영 중 오류가 발생했습니다: ${err.message}`)
      setLoadingMessage(null)
      setCurrentPage('intro')
    }
  }

  const uploadAndGenerateCard = async (imageFiles, cardType) => {
    console.log('API 호출 시작...')
    console.log('이미지 파일:', imageFiles)
    console.log('연하장 타입:', cardType)

    if (imageFiles.length === 1) {
      // 단일 이미지 처리
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const dataUrl = reader.result
          const base64Data = dataUrl.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(imageFiles[0])
      })

      console.log('Base64 변환 완료, 길이:', base64.length)

      const requestBody = {
        imageBase64: base64,
        mimeType: imageFiles[0].type || 'image/jpeg',
        profileType: cardType
      }

      const response = await fetch(API_ENDPOINTS.GENERATE_PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 에러 응답:', errorText)
        throw new Error(`API 호출 실패 (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data)

      if (data.success && data.image && data.image.data) {
        const imageDataUri = `data:${data.image.mimeType};base64,${data.image.data}`
        return imageDataUri
      } else {
        throw new Error(data.error || '이미지를 생성하지 못했습니다.')
      }
    } else {
      // 다중 이미지 처리
      const images = await Promise.all(
        imageFiles.map(async (file) => {
          const reader = new FileReader()
          const base64 = await new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const dataUrl = reader.result
              const base64Data = dataUrl.split(',')[1]
              resolve(base64Data)
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })

          return {
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg'
          }
        })
      )

      console.log('다중 Base64 변환 완료')

      const requestBody = {
        images: images,
        profileType: cardType
      }

      const response = await fetch(API_ENDPOINTS.GENERATE_PROFILE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      console.log('응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API 에러 응답:', errorText)
        throw new Error(`API 호출 실패 (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data)

      if (data.success && data.image && data.image.data) {
        const imageDataUri = `data:${data.image.mimeType};base64,${data.image.data}`
        return imageDataUri
      } else {
        throw new Error(data.error || '이미지를 생성하지 못했습니다.')
      }
    }
  }

  // Cloudflare Images에 백그라운드 업로드 (fire-and-forget)
  const uploadToCloudflare = (imageDataUri, cardType) => {
    const userKey = tossUserInfo?.userKey || getUserKey()
    if (!userKey) {
      console.error('[NewYearPage] Cloudflare 업로드 실패: userKey 없음')
      return
    }
    const base64Data = imageDataUri.split(',')[1]
    fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64Data,
        userId: userKey,
        cardType,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log('[NewYearPage] Cloudflare 업로드 성공:', data.imageId)
        } else {
          console.error('[NewYearPage] Cloudflare 업로드 실패:', data.error)
        }
      })
      .catch(err => console.error('[NewYearPage] Cloudflare 업로드 에러:', err))
  }

  const generateCard = async () => {
    if (!selectedImages || selectedImages.length === 0) {
      setError('사진을 다시 선택해주세요')
      setCurrentPage('error')
      return
    }

    try {
      const imageDataUri = await uploadAndGenerateCard(selectedImages, selectedCardTypeRef.current)
      clearPendingOrderData()
      // Cloudflare Images에 백그라운드 업로드
      uploadToCloudflare(imageDataUri, selectedCardTypeRef.current)
      setGeneratedImageUrl(imageDataUri)
      setCurrentPage('result')
    } catch (err) {
      console.error('연하장 생성 실패', err)
      setError(`연하장 생성 중 오류가 발생했습니다: ${err.message}. 앱을 다시 시작하면 추가 결제 없이 재시도할 수 있습니다.`)
      setCurrentPage('intro')
    }
  }

  // 미완료 주문 복구
  const handleRestoreOrder = async () => {
    if (!pendingOrderData) return

    setIsRestoring(true)
    setLoadingMessage({
      title: '연하장 이미지 생성 중...',
      description: '잠시만 기다려주세요'
    })
    setCurrentPage('loading')

    try {
      // Base64 데이터에서 Blob으로 변환
      const imageBlobs = await Promise.all(
        pendingOrderData.selectedImages.map(async (dataUri) => {
          const response = await fetch(dataUri)
          return await response.blob()
        })
      )

      const cardType = pendingOrderData.selectedCardType
      const imageDataUri = await uploadAndGenerateCard(imageBlobs, cardType)

      // 성공 시 IAP 완료 처리
      const { IAP } = await import('@apps-in-toss/web-framework')
      for (const order of pendingOrders) {
        const orderId = order.orderId || order
        try {
          await IAP.completeProductGrant({ params: { orderId } })
        } catch (completeErr) {
          console.error('[NewYearPage] completeProductGrant 에러:', completeErr)
        }
      }

      clearPendingOrderData()
      setPendingOrders([])
      // Cloudflare Images에 백그라운드 업로드
      uploadToCloudflare(imageDataUri, cardType)
      setGeneratedImageUrl(imageDataUri)
      setCurrentPage('result')
    } catch (err) {
      console.error('[NewYearPage] 복구 실패:', err)
      setError(`이미지 생성 실패: ${err.message}. 다시 시도해주세요.`)
      setCurrentPage('intro')
    } finally {
      setIsRestoring(false)
      setLoadingMessage(null)
    }
  }

  const handleReset = () => {
    setCurrentPage('intro')
    setSelectedImages([])
    setGeneratedImageUrl(null)
    setError(null)
  }

  const handleCardTypeSelect = (cardType, maxCount) => {
    setSelectedCardType(cardType)
    selectedCardTypeRef.current = cardType
    setMaxPhotos(maxCount)
    setCurrentPage('tossLogin')
  }

  const handleBackToIntro = () => {
    setSelectedImages([])
    setSelectedCardType('new-year-card-single')
    selectedCardTypeRef.current = 'new-year-card-single'
    setMaxPhotos(1)
    setCurrentPage('intro')
  }

  const handleSave = async () => {
    try {
      if (!generatedImageUrl) {
        alert('저장할 이미지가 없습니다.')
        return
      }

      if (typeof saveBase64Data !== 'function') {
        alert('이미지 저장 기능을 사용할 수 없습니다.')
        return
      }

      console.log('이미지 저장 시작...')

      const base64Data = generatedImageUrl.split(',')[1]

      await saveBase64Data({
        data: base64Data,
        fileName: `newyear_${Date.now()}.png`,
        mimeType: 'image/png'
      })

      console.log('이미지 저장 완료')

    } catch (err) {
      console.error('이미지 저장 오류:', err)
      if (err.message && !err.message.toLowerCase().includes('cancel')) {
        alert(`이미지 저장 중 오류가 발생했습니다: ${err.message}`)
      }
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <div>
            {/* 미완료 주문 복구 배너 */}
            {pendingOrders.length > 0 && pendingOrderData && (
              <div style={{
                background: '#FFF8E6',
                padding: '16px 20px',
                borderBottom: '1px solid #FFE4B5'
              }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: '#B86E00', margin: '0 0 8px 0' }}>
                  이전에 결제하신 연하장이 있습니다
                </p>
                <p style={{ fontSize: '13px', color: '#8B7355', margin: '0 0 12px 0' }}>
                  이미지 생성에 실패했습니다. 추가 결제 없이 다시 시도할 수 있습니다.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleRestoreOrder}
                    disabled={isRestoring}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      background: isRestoring ? '#ccc' : '#B86E00',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: isRestoring ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isRestoring ? '이미지 생성 중...' : '다시 생성하기'}
                  </button>
                  <button
                    onClick={() => {
                      clearPendingOrderData()
                      setPendingOrders([])
                    }}
                    disabled={isRestoring}
                    style={{
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#8B7355',
                      background: '#fff',
                      border: '1px solid #E5D9C3',
                      borderRadius: '8px',
                      cursor: isRestoring ? 'not-allowed' : 'pointer'
                    }}
                  >
                    무시
                  </button>
                </div>
              </div>
            )}
            <div style={{
              padding: '12px 20px',
              borderBottom: `1px solid ${colors.grey200}`,
            }}>
              <button
                onClick={() => navigate('/newyear/history')}
                style={{
                  width: '100%',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: colors.blue600,
                  background: colors.blue50,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '18px' }}>&#128444;</span>
                이전에 만든 연하장 보기
              </button>
            </div>
            <Intro
              onNext={(type) => {
                if (type === 'album') {
                  handleAlbumSelect()
                } else if (type === 'camera') {
                  handleCameraSelect()
                }
              }}
              error={error}
              pageType="newyear"
            />
          </div>
        )
      case 'selection':
        return (
          <NewYearSelection
            selectedImages={selectedImages}
            onSelect={handleCardTypeSelect}
            onBack={handleBackToIntro}
            productPrice={productPrice}
          />
        )
      case 'tossLogin':
        return (
          <TossLogin
            onBack={() => setCurrentPage('selection')}
            onNext={({ tossUserInfo: userInfo }) => {
              setTossUserInfo(userInfo)
              saveUserKey(userInfo.userKey)
              setCurrentPage('payment')
            }}
          />
        )
      case 'payment':
        return (
          <NewYearPayment
            selectedImages={selectedImages}
            selectedCardType={selectedCardType}
            onBack={() => setCurrentPage('tossLogin')}
            onNext={() => {
              setLoadingMessage({
                title: '연하장 생성 중...',
                description: '잠시만 기다려주세요...'
              })
              setCurrentPage('loading')
              generateCard()
            }}
          />
        )
      case 'loading':
        return (
          <Loading
            title={loadingMessage?.title}
            description={loadingMessage?.description}
          />
        )
      case 'result':
        return (
          <Result
            imageUrl={generatedImageUrl}
            petType={selectedCardType}
            onClose={handleReset}
            onSave={handleSave}
          />
        )
      default:
        return (
          <Intro
            onNext={(type) => {
              if (type === 'album') {
                handleAlbumSelect()
              } else if (type === 'camera') {
                handleCameraSelect()
              }
            }}
            error={error}
            pageType="newyear"
          />
        )
    }
  }

  return <>{renderPage()}</>
}

// 연하장 선택 컴포넌트
function NewYearSelection({ selectedImages, onSelect, onBack, productPrice }) {
  const [selectedType, setSelectedType] = useState(null)

  const cardTypes = [
    {
      id: 'new-year-card-illustration',
      title: '심플하고 따뜻한 느낌의 일러스트',
      description: '따뜻한 일러스트 스타일',
      thumbnail: illustrationImg,
      maxPhotos: 3,
      color: colors.orange50
    },
    {
      id: 'new-year-card-anime',
      title: '일본 만화풍',
      description: '애니메이션 스타일',
      thumbnail: animeImg,
      maxPhotos: 3,
      color: colors.pink50
    },
    {
      id: 'new-year-card-chinese',
      title: '화려한 중국풍',
      description: '전통 중국 스타일',
      thumbnail: chineseImg,
      maxPhotos: 3,
      color: colors.red50
    }
  ]

  return (
    <div style={styles.container}>
      <Spacing size={20} />

      <Spacing size={20} />

      <h2 style={styles.title}>어떤 스타일로 생성할까요?</h2>

      <Spacing size={20} />

      {selectedImages && selectedImages.length > 0 && (
        <div style={styles.previewContainer}>
          {selectedImages.map((image, index) => (
            <div key={index} style={styles.previewImageWrapper}>
              <img
                src={URL.createObjectURL(image)}
                alt={`선택된 이미지 ${index + 1}`}
                style={styles.previewImage}
              />
            </div>
          ))}
        </div>
      )}

      <Spacing size={30} />

      <div style={styles.typeList}>
        {cardTypes.map((type) => (
          <div key={type.id} style={styles.typeListItem}>
            <div
              style={{
                ...styles.typeCard,
                backgroundColor: selectedType === type.id ? type.color : colors.white,
                border: selectedType === type.id ? `2px solid ${colors.blue500}` : `1px solid ${colors.grey200}`,
              }}
              onClick={() => {
                setSelectedType(type.id)
              }}
            >
              <div style={styles.typeThumbnailWrapper}>
                <img
                  src={type.thumbnail}
                  alt={type.title}
                  style={styles.typeThumbnail}
                />
              </div>
              <div style={styles.typeTextContainer}>
                <h3 style={styles.typeTitle}>{type.title}</h3>
                <p style={styles.typeDescription}>{type.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Spacing size={100} />

      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.button,
            opacity: selectedType ? 1 : 0.5,
            cursor: selectedType ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            if (!selectedType) return

            const selectedCardType = cardTypes.find(t => t.id === selectedType)
            onSelect(selectedType, selectedCardType.maxPhotos)
          }}
          disabled={!selectedType}
        >
          {productPrice ? `${productPrice}으로 생성하기` : '결제하고 생성하기'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    width: '100%',
    padding: '20px',
    background: `linear-gradient(180deg, ${colors.red50} 0%, ${colors.green50} 100%)`,
    paddingBottom: '120px',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.grey900,
    textAlign: 'center',
    margin: 0,
  },
  previewContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
  },
  previewImageWrapper: {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    overflow: 'hidden',
    border: `2px solid ${colors.grey200}`,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  typeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
  },
  typeListItem: {
    width: '100%',
  },
  typeCard: {
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  typeThumbnailWrapper: {
    width: '80px',
    minWidth: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: colors.grey100,
  },
  typeThumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  typeTextContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    textAlign: 'left',
  },
  typeTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: colors.grey900,
    margin: 0,
  },
  typeDescription: {
    fontSize: '13px',
    fontWeight: 400,
    color: colors.grey600,
    margin: 0,
  },
  buttonContainer: {
    width: 'calc(100% - 40px)',
    maxWidth: '400px',
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  button: {
    width: '100%',
    padding: '16px',
    backgroundColor: colors.red500,
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'opacity 0.2s ease',
  },
}
