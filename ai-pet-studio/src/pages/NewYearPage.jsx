import { useState, useEffect, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, GoogleAdMob } from '@apps-in-toss/web-framework'
import { Modal, Button, Asset } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import Intro from '../components/Intro'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { API_ENDPOINTS, AD_GROUP_ID, AD_WAIT_TIMEOUT_MS } from '../config/const'

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
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedPetType, setSelectedPetType] = useState('new-year-card-cat-korea')
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)

  // 광고 관련 상태
  const [adLoaded, setAdLoaded] = useState(false)
  const [waitingForAd, setWaitingForAd] = useState(false)
  const [adLoadError, setAdLoadError] = useState(false)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(null)

  // Refs
  const cleanupRef = useRef(undefined)
  const adWaitTimeoutRef = useRef(undefined)
  const rewardEarnedRef = useRef(false)
  const adPlayCountRef = useRef(0)
  const selectedPetTypeRef = useRef('new-year-card-cat-korea')
  const preloadedImageUrlRef = useRef(null)

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
      setSelectedImage(imageBlob)
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
      setSelectedImage(imageBlob)
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

  const loadAd = () => {
    try {
      console.log('\n📥 광고 로드 시도')

      const isSupported = GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.()
      console.log('🔍 loadAppsInTossAdMob.isSupported():', isSupported)

      if (isSupported !== true) {
        console.warn('❌ 광고 기능 미지원. isSupported:', isSupported)
        return
      }

      cleanupRef.current?.()
      cleanupRef.current = undefined

      setAdLoaded(false)
      console.log('🔄 광고 로드 시작...')

      const cleanup = GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          if (event.type === 'loaded') {
            console.log('✅ 광고 로드 완료:', event.data)
            setAdLoaded(true)
          }
        },
        onError: (loadError) => {
          console.error('❌ 광고 로드 실패:', loadError)
          setAdLoaded(false)
          setAdLoadError(true)
        }
      })

      cleanupRef.current = cleanup
    } catch (loadError) {
      console.error('⚠️ 광고 로드 예외:', loadError)
      setAdLoaded(false)
      setAdLoadError(true)
    }
  }

  const showAd = () => {
    try {
      console.log('✅ 광고 표시 시작')
      rewardEarnedRef.current = false

      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          console.log('광고 이벤트:', event.type)

          switch (event.type) {
            case 'userEarnedReward':
              console.log('🎁 보상 획득!', event.data)
              rewardEarnedRef.current = true
              break

            case 'dismissed':
              console.log('광고 닫힘')

              if (rewardEarnedRef.current) {
                console.log('✅ 보상형 광고 완료 - 사진 생성 진행')
                setLoadingMessage({
                  title: '펫 포토 카드 생성 중...',
                  description: '잠시만 기다려주세요...'
                })
                setCurrentPage('loading')

                if (preloadedImageUrlRef.current) {
                  console.log('✅ 미리 로드된 이미지 사용')
                  setGeneratedImageUrl(preloadedImageUrlRef.current)
                  setCurrentPage('result')
                  preloadedImageUrlRef.current = null
                } else {
                  console.log('⏳ 이미지 생성 대기 중')
                  generatePet()
                }

                loadAd()
              } else {
                console.warn('⚠️ 보상형 광고 중도 종료')
                setCurrentPage('intro')
                setError('광고를 끝까지 시청해주세요')
                loadAd()
              }
              break

            case 'failedToShow':
              console.warn('⚠️ 광고 표시 실패 - 광고 없이 진행:', event.data)
              setLoadingMessage({
                title: '펫 포토 카드 생성 중...',
                description: '잠시만 기다려주세요...'
              })
              setCurrentPage('loading')
              generatePet()
              loadAd()
              break
          }
        },
        onError: (showError) => {
          console.error('❌ 광고 표시 에러:', showError)
          console.warn('⚠️ 광고 표시 에러 발생 - 광고 없이 진행')
          setLoadingMessage({
            title: '펫 포토 카드 생성 중...',
            description: '잠시만 기다려주세요...'
          })
          setCurrentPage('loading')
          generatePet()
          loadAd()
        }
      })
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setLoadingMessage({
        title: '펫 포토 카드 생성 중...',
        description: '잠시만 기다려주세요...'
      })
      setCurrentPage('loading')
      generatePet()
      loadAd()
    }
  }

  const generatePet = async () => {
    if (!selectedImage) {
      setError('사진을 다시 선택해주세요')
      setCurrentPage('error')
      return
    }

    try {
      const imageDataUri = await uploadAndGeneratePet(selectedImage, selectedPetTypeRef.current)
      setGeneratedImageUrl(imageDataUri)
      setCurrentPage('result')
    } catch (err) {
      console.error('사진 생성 실패', err)
      setError(`사진 생성 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  useEffect(() => {
    loadAd()

    return () => {
      cleanupRef.current?.()
      cleanupRef.current = undefined

      if (adWaitTimeoutRef.current) {
        clearTimeout(adWaitTimeoutRef.current)
        adWaitTimeoutRef.current = undefined
      }
    }
  }, [])

  useEffect(() => {
    if (waitingForAd && adLoaded) {
      console.log('✅ 광고 로드 완료 - 광고 표시')
      setWaitingForAd(false)

      if (adWaitTimeoutRef.current) {
        clearTimeout(adWaitTimeoutRef.current)
        adWaitTimeoutRef.current = undefined
      }

      showAd()
    }
  }, [adLoaded, waitingForAd])

  const handleReset = () => {
    setCurrentPage('intro')
    setSelectedImage(null)
    setSelectedPetType('new-year-card-cat-korea')
    selectedPetTypeRef.current = 'new-year-card-cat-korea'
    adPlayCountRef.current = 0
    preloadedImageUrlRef.current = null
    setGeneratedImageUrl(null)
    setError(null)

    loadAd()
  }

  const handlePetTypeSelect = async (petType) => {
    setSelectedPetType(petType)
    selectedPetTypeRef.current = petType
    adPlayCountRef.current = 0

    try {
      const isSupported = GoogleAdMob?.showAppsInTossAdMob?.isSupported?.()

      if (isSupported !== true) {
        console.warn('광고 표시 기능 미지원. isSupported:', isSupported)
        setCurrentPage('loading')
        generatePet()
        return
      }

      if (adLoaded === false) {
        console.log('⏳ 광고 로드 대기 중 - 로딩 화면 표시')
        setCurrentPage('loading')
        setWaitingForAd(true)

        adWaitTimeoutRef.current = setTimeout(() => {
          console.warn(`⚠️ 광고 로드 타임아웃 (${AD_WAIT_TIMEOUT_MS / 1000}초) - 광고 없이 진행`)
          setWaitingForAd(false)
          generatePet()
        }, AD_WAIT_TIMEOUT_MS)

        return
      }

      showAd()
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setCurrentPage('loading')
      generatePet()
    }
  }

  const handleBackToIntro = () => {
    setSelectedImage(null)
    setSelectedPetType('new-year-card-cat-korea')
    selectedPetTypeRef.current = 'new-year-card-cat-korea'
    adPlayCountRef.current = 0
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

  const handleConfirmDialogConfirm = async () => {
    setIsConfirmDialogOpen(false)

    setWaitingForAd(true)
    setCurrentPage('loading')

    loadAd()

    adWaitTimeoutRef.current = setTimeout(() => {
      console.warn(`⚠️ 2번째 광고 로드 타임아웃 (${AD_WAIT_TIMEOUT_MS / 1000}초) - 광고 없이 진행`)
      setWaitingForAd(false)

      if (preloadedImageUrlRef.current) {
        console.log('✅ 미리 로드된 이미지 사용')
        setGeneratedImageUrl(preloadedImageUrlRef.current)
        setCurrentPage('result')
        preloadedImageUrlRef.current = null
      } else {
        console.log('⏳ 이미지 생성 대기 중')
        generatePet()
      }
    }, AD_WAIT_TIMEOUT_MS)

    console.log('🚀 두 번째 광고 로딩과 동시에 API 호출 시작')
    try {
      const imageDataUri = await uploadAndGeneratePet(selectedImage, selectedPetTypeRef.current)
      preloadedImageUrlRef.current = imageDataUri
      console.log('✅ API 응답 완료 - 이미지 미리 로드됨')
    } catch (err) {
      console.error('❌ 미리 로드 실패:', err)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'intro':
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
      case 'selection':
        return (
          <NewYearSelection
            selectedImage={selectedImage}
            onSelect={handlePetTypeSelect}
            onBack={handleBackToIntro}
          />
        )
      case 'loading':
        return (
          <Loading
            error={adLoadError}
            onRetry={loadAd}
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
          />
        )
    }
  }

  return (
    <>
      {renderPage()}
      <Modal
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) setIsConfirmDialogOpen(false)
        }}
      >
        <Modal.Overlay />
        <Modal.Content
          style={{
            padding: '32px 20px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            광고를 한 번 더 시청해주세요
          </h2>
          <p style={{ fontSize: '14px', color: '#4E5968', marginBottom: '24px', whiteSpace: 'pre-line' }}>
            {'광고를 시청하는 동안\n반려동물 사진을 생성할게요.'}
          </p>
          <Button
            display="block"
            color="primary"
            onClick={() => {
              setIsConfirmDialogOpen(false)
              handleConfirmDialogConfirm()
            }}
          >
            확인
          </Button>
        </Modal.Content>
      </Modal>
    </>
  )
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

      {/* <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          ← 타입 선택으로 돌아가기
        </button>
      </div> */}

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
                    {/* <Spacing size={8} /> */}
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
          광고 보고 생성하기
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
