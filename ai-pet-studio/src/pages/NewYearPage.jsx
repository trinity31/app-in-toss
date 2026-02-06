import { useState, useEffect, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, IAP } from '@apps-in-toss/web-framework'
import { colors } from '@toss/tds-colors'
import { useLocation, useNavigate } from 'react-router-dom'
import Intro from '../components/Intro'
import Loading from '../components/Loading'
import Result from '../components/Result'
import TossLogin from '../components/TossLogin'
import NewYearPayment from '../components/NewYearPayment'
import { API_ENDPOINTS } from '../config/const'
import { usePendingOrderStorage, shouldSkipAutoRestore } from '../hooks/usePendingOrderStorage'

// 연하장 썸네일 이미지
import catKoreaMaleImg from '../assets/images/newyear/cat_korea_male.png'
import catKoreaFemaleImg from '../assets/images/newyear/cat_korea_female.png'
import catJapanImg from '../assets/images/newyear/cat_japan.png'
import catChinaImg from '../assets/images/newyear/cat_china.png'
import dogKoreaMaleImg from '../assets/images/newyear/dog_korea_male.png'
import dogKoreaFemaleImg from '../assets/images/newyear/dog_korea_female.png'
import dogJapanImg from '../assets/images/newyear/dog_japan.png'
import dogChinaImg from '../assets/images/newyear/dog_china.png'

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

export default function NewYearPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedPetType, setSelectedPetType] = useState('new-year-card-cat-korea')
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)
  const [loadingMessage, setLoadingMessage] = useState(null)
  const [tossUserInfo, setTossUserInfo] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [isRestoring, setIsRestoring] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const selectedPetTypeRef = useRef('new-year-card-cat-korea')
  const { loading: pendingLoading, pendingOrderData, clearPendingOrderData } = usePendingOrderStorage()

  // 미완료 주문 확인
  useEffect(() => {
    async function checkPendingOrders() {
      if (pendingLoading) return

      if (shouldSkipAutoRestore()) {
        console.log('[NewYearPage] 미완료 주문 확인 건너뛰기 (테스트 모드)')
        return
      }

      if (pendingOrderData) {
        try {
          const response = await IAP.getPendingOrders()
          const orders = Array.isArray(response)
            ? response
            : response?.orders || response?.pendingOrders || []

          if (orders?.length > 0) {
            console.log('[NewYearPage] 미완료 주문 발견:', orders.length)
            setPendingOrders(orders)
          }
          // pendingOrderData가 있으면 IAP pending order 여부와 관계없이 복구 가능
          // (이미지 생성 실패 시 IAP는 완료되었지만 pendingOrderData는 남아있음)
        } catch (err) {
          console.error('[NewYearPage] 미완료 주문 확인 실패:', err)
        }
      }
    }

    checkPendingOrders()
  }, [pendingLoading])

  // 복원 모드 처리
  useEffect(() => {
    if (location.state?.restore && pendingOrderData && !shouldSkipAutoRestore()) {
      console.log('[NewYearPage] 복원 모드 - 미완료 주문 복구 시작')
      handleRestoreOrder()
    }
  }, [location.state, pendingOrderData])

  const handleRestoreOrder = async () => {
    if (!pendingOrderData) return

    setIsRestoring(true)
    try {
      setLoadingMessage({
        title: '연하장 복구 중...',
        description: '이전에 생성하지 못한 연하장을 복구합니다'
      })
      setCurrentPage('loading')

      // Base64 데이터를 Blob으로 변환
      const imageBlobs = await Promise.all(
        pendingOrderData.selectedImages.map(async (dataUri) => {
          const res = await fetch(dataUri)
          return res.blob()
        })
      )

      setSelectedImages(imageBlobs)
      setSelectedPetType(pendingOrderData.selectedCardType)
      selectedPetTypeRef.current = pendingOrderData.selectedCardType

      // 이미지 생성
      const imageDataUri = await uploadAndGeneratePet(imageBlobs[0], pendingOrderData.selectedCardType)
      setGeneratedImageUrl(imageDataUri)

      // Supabase에 업로드
      const userKey = localStorage.getItem('pet_newyear_user_key')
      if (userKey) {
        await uploadToSupabase(imageDataUri, userKey, pendingOrderData.selectedCardType)
      }

      // IAP 완료 처리
      for (const order of pendingOrders) {
        try {
          await IAP.completeProductGrant({ params: { orderId: order.orderId } })
        } catch (err) {
          console.error('[NewYearPage] IAP 완료 처리 실패:', err)
        }
      }

      // 데이터 정리
      clearPendingOrderData()
      setPendingOrders([])
      setCurrentPage('result')

    } catch (err) {
      console.error('[NewYearPage] 복원 실패:', err)
      setError(`복원 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    } finally {
      setIsRestoring(false)
    }
  }

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
          maxCount: 1,
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

      const photo = photos[0]
      const normalizedDataUri = photo.dataUri.startsWith('data:')
        ? photo.dataUri
        : `data:image/jpeg;base64,${photo.dataUri}`

      const response = await fetch(normalizedDataUri)
      if (!response.ok) {
        throw new Error(`이미지 로드 실패: ${response.statusText}`)
      }

      const imageBlob = await response.blob()
      setSelectedImages([imageBlob])
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

  const uploadAndGeneratePet = async (imageFile, petType) => {
    console.log('API 호출 시작...')
    console.log('이미지 파일:', imageFile)
    console.log('반려동물 타입:', petType)

    const reader = new FileReader()
    const base64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const dataUrl = reader.result
        const base64Data = dataUrl.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(imageFile)
    })

    console.log('Base64 변환 완료, 길이:', base64.length)

    const requestBody = {
      imageBase64: base64,
      mimeType: imageFile.type || 'image/jpeg',
      petType: petType
    }

    const response = await fetch(API_ENDPOINTS.GENERATE_PET_PHOTO, {
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

  const uploadToSupabase = async (imageDataUri, userId, cardType) => {
    try {
      const base64Data = imageDataUri.split(',')[1]
      const response = await fetch(API_ENDPOINTS.UPLOAD_IMAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          userId,
          cardType,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        console.error('[uploadToSupabase] 업로드 실패:', data)
      } else {
        console.log('[uploadToSupabase] 업로드 성공:', data.imageId)
      }
    } catch (err) {
      console.error('[uploadToSupabase] 에러:', err)
    }
  }

  const generatePet = async () => {
    if (!selectedImages || selectedImages.length === 0) {
      setError('사진을 다시 선택해주세요')
      setCurrentPage('intro')
      return
    }

    try {
      const imageDataUri = await uploadAndGeneratePet(selectedImages[0], selectedPetTypeRef.current)
      setGeneratedImageUrl(imageDataUri)

      // Supabase에 업로드
      const userKey = localStorage.getItem('pet_newyear_user_key')
      if (userKey) {
        await uploadToSupabase(imageDataUri, userKey, selectedPetTypeRef.current)
      }

      // pendingOrderData 삭제
      clearPendingOrderData()

      setCurrentPage('result')
    } catch (err) {
      console.error('사진 생성 실패', err)
      setError(`사진 생성 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  const handleReset = () => {
    setCurrentPage('intro')
    setSelectedImages([])
    setSelectedPetType('new-year-card-cat-korea')
    selectedPetTypeRef.current = 'new-year-card-cat-korea'
    setGeneratedImageUrl(null)
    setError(null)
    setTossUserInfo(null)
  }

  const handleCardTypeSelect = (petType) => {
    setSelectedPetType(petType)
    selectedPetTypeRef.current = petType

    // 이미 로그인된 경우 바로 결제 페이지로
    const existingUserKey = localStorage.getItem('pet_newyear_user_key')
    if (existingUserKey) {
      setTossUserInfo({ userKey: existingUserKey })
      setCurrentPage('payment')
    } else {
      setCurrentPage('tossLogin')
    }
  }

  const handleTossLoginSuccess = ({ tossUserInfo }) => {
    setTossUserInfo(tossUserInfo)
    localStorage.setItem('pet_newyear_user_key', tossUserInfo.userKey)
    setCurrentPage('payment')
  }

  const handlePaymentSuccess = ({ orderId }) => {
    console.log('[NewYearPage] 결제 성공, orderId:', orderId)
    setLoadingMessage({
      title: '펫 연하장 생성 중...',
      description: '잠시만 기다려주세요'
    })
    setCurrentPage('loading')
    generatePet()
  }

  const handleBackToIntro = () => {
    setSelectedImages([])
    setSelectedPetType('new-year-card-cat-korea')
    selectedPetTypeRef.current = 'new-year-card-cat-korea'
    setCurrentPage('intro')
  }

  const handleBackToSelection = () => {
    setCurrentPage('selection')
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
        fileName: `pet_newyear_${Date.now()}.png`,
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

  const handleHistoryClick = () => {
    navigate('/newyear/history')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <div>
            {/* 미완료 주문 복구 배너 */}
            {pendingOrderData && (
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
            {/* 이전에 만든 연하장 보기 버튼 */}
            <div style={{
              padding: '0 20px',
            }}>
              <button
                onClick={handleHistoryClick}
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
                }}
              >
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
            selectedImage={selectedImages[0]}
            onSelect={handleCardTypeSelect}
            onBack={handleBackToIntro}
          />
        )
      case 'tossLogin':
        return (
          <TossLogin
            onNext={handleTossLoginSuccess}
            onBack={handleBackToSelection}
          />
        )
      case 'payment':
        return (
          <NewYearPayment
            onNext={handlePaymentSuccess}
            onBack={handleBackToSelection}
            selectedImages={selectedImages}
            selectedCardType={selectedPetType}
          />
        )
      case 'loading':
        return (
          <Loading
            error={false}
            onRetry={() => {}}
            title={loadingMessage?.title}
            description={loadingMessage?.description}
          />
        )
      case 'result':
        return (
          <Result
            imageUrl={generatedImageUrl}
            petType={selectedPetType}
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

  return renderPage()
}

// 연말 특별 선택 컴포넌트
function NewYearSelection({ selectedImage, onSelect, onBack }) {
  const [selectedType, setSelectedType] = useState(null)
  const [selectedGender, setSelectedGender] = useState(null)

  const petTypes = [
    // 고양이 3종
    {
      id: 'new-year-card-cat-korea',
      title: '한국 고양이 연하장',
      description: '한복 입은 고양이',
      thumbnail: catKoreaMaleImg,
      thumbnailMale: catKoreaMaleImg,
      thumbnailFemale: catKoreaFemaleImg,
      color: colors.orange50,
      hasGenderOption: true
    },
    // 강아지 3종
    {
      id: 'new-year-card-dog-korea',
      title: '한국 강아지 연하장',
      description: '한복 입은 강아지',
      thumbnail: dogKoreaMaleImg,
      thumbnailMale: dogKoreaMaleImg,
      thumbnailFemale: dogKoreaFemaleImg,
      color: colors.blue50,
      hasGenderOption: true
    },
    {
      id: 'new-year-card-cat-japan',
      title: '일본 고양이 연하장',
      description: '마네키네코 스타일',
      thumbnail: catJapanImg,
      color: colors.red50
    },
    {
      id: 'new-year-card-dog-japan',
      title: '일본 강아지 연하장',
      description: '일본 복강아지',
      thumbnail: dogJapanImg,
      color: colors.purple50
    },
    {
      id: 'new-year-card-cat-china',
      title: '중국 고양이 연하장',
      description: '중국 전통 고양이',
      thumbnail: catChinaImg,
      color: colors.yellow50
    },
    {
      id: 'new-year-card-dog-china',
      title: '중국 강아지 연하장',
      description: '중국 사자개 스타일',
      thumbnail: dogChinaImg,
      color: colors.green50
    }
  ]

  return (
    <div style={styles.container}>
      <Spacing size={20} />

      <Spacing size={20} />

      <h2 style={styles.title}>어떤 스타일로 생성할까요?</h2>

      <Spacing size={20} />

      {selectedImage && (
        <div style={styles.previewContainer}>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="선택된 이미지"
            style={styles.previewImage}
          />
        </div>
      )}

      <Spacing size={30} />

      <div style={styles.typeList}>
        {petTypes.map((type) => (
          <div key={type.id} style={styles.typeListItem}>
            <div
              style={{
                ...styles.typeCard,
                backgroundColor: selectedType === type.id ? type.color : colors.white,
                border: selectedType === type.id ? `2px solid ${colors.blue500}` : `1px solid ${colors.grey200}`,
              }}
              onClick={() => {
                setSelectedType(type.id)
                // 한국풍이 아니면 성별 초기화
                if (!type.hasGenderOption) {
                  setSelectedGender(null)
                }
              }}
            >
              <div style={styles.typeThumbnailWrapper}>
                <img
                  src={
                    selectedType === type.id && type.hasGenderOption && selectedGender
                      ? selectedGender === 'male'
                        ? type.thumbnailMale
                        : type.thumbnailFemale
                      : type.thumbnail
                  }
                  alt={type.title}
                  style={styles.typeThumbnail}
                />
              </div>
              <div style={styles.typeTextContainer}>
                <h3 style={styles.typeTitle}>{type.title}</h3>
                <p style={styles.typeDescription}>{type.description}</p>

                {/* 성별 선택 UI - 텍스트 아래에 표시 */}
                {selectedType === type.id && type.hasGenderOption && (
                  <div style={styles.genderSelector}>
                    <div style={styles.genderButtonGroup}>
                      <button
                        style={{
                          ...styles.genderButton,
                          backgroundColor: selectedGender === 'male'
                            ? colors.blue100
                            : colors.grey50,
                          border: selectedGender === 'male'
                            ? `2px solid ${colors.blue500}`
                            : `1px solid ${colors.grey200}`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGender('male');
                        }}
                      >
                        남아
                      </button>
                      <button
                        style={{
                          ...styles.genderButton,
                          backgroundColor: selectedGender === 'female'
                            ? colors.blue100
                            : colors.grey50,
                          border: selectedGender === 'female'
                            ? `2px solid ${colors.blue500}`
                            : `1px solid ${colors.grey200}`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGender('female');
                        }}
                      >
                        여아
                      </button>
                    </div>
                  </div>
                )}
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
            opacity: (() => {
              if (!selectedType) return 0.5
              const selectedPetType = petTypes.find(t => t.id === selectedType)
              if (selectedPetType?.hasGenderOption && !selectedGender) return 0.5
              return 1
            })(),
            cursor: (() => {
              if (!selectedType) return 'not-allowed'
              const selectedPetType = petTypes.find(t => t.id === selectedType)
              if (selectedPetType?.hasGenderOption && !selectedGender) return 'not-allowed'
              return 'pointer'
            })()
          }}
          onClick={() => {
            if (!selectedType) return

            const selectedPetType = petTypes.find(t => t.id === selectedType)

            // 한국풍이고 성별이 선택된 경우 타입 변환
            let finalPetType = selectedType
            if (selectedPetType?.hasGenderOption && selectedGender) {
              finalPetType = `${selectedType}-${selectedGender}`
            } else if (selectedPetType?.hasGenderOption && !selectedGender) {
              // 한국풍인데 성별 미선택 시 실행 안 함
              return
            }

            onSelect(finalPetType)
          }}
          disabled={(() => {
            if (!selectedType) return true
            const selectedPetType = petTypes.find(t => t.id === selectedType)
            if (selectedPetType?.hasGenderOption && !selectedGender) return true
            return false
          })()}
        >
          결제하고 생성하기
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
  header: {
    width: '100%',
    maxWidth: '400px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: colors.grey700,
    border: `1px solid ${colors.grey300}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: colors.grey900,
    textAlign: 'center',
    margin: 0,
  },
  previewContainer: {
    width: '120px',
    height: '120px',
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
  typeIconWrapper: {
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  genderSelector: {
    paddingTop: '12px',
  },
  genderButtonGroup: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
  },
  genderButton: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e5e8eb',
  },
}
