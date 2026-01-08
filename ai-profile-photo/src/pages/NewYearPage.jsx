import { useState, useEffect, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, GoogleAdMob } from '@apps-in-toss/web-framework'
import { Modal, Button } from '@toss/tds-mobile'
import { colors } from '@toss/tds-colors'
import Intro from '../components/Intro'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { API_ENDPOINTS, AD_GROUP_ID } from '../config/api'

// 연하장 썸네일 이미지
import { illustrationImg, animeImg, chineseImg } from '../config/images'

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

const AD_WAIT_TIMEOUT_MS = 10000;

export default function NewYearPage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [selectedImages, setSelectedImages] = useState([])
  const [selectedCardType, setSelectedCardType] = useState('new-year-card-illustration')
  const [maxPhotos, setMaxPhotos] = useState(3)
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
  const selectedCardTypeRef = useRef('new-year-card-illustration')
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
                console.log('✅ 보상형 광고 완료 - 연하장 생성 진행')
                setLoadingMessage({
                  title: '연하장 생성 중...',
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
                  generateCard()
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
                title: '연하장 생성 중...',
                description: '잠시만 기다려주세요...'
              })
              setCurrentPage('loading')
              generateCard()
              loadAd()
              break
          }
        },
        onError: (showError) => {
          console.error('❌ 광고 표시 에러:', showError)
          console.warn('⚠️ 광고 표시 에러 발생 - 광고 없이 진행')
          setLoadingMessage({
            title: '연하장 생성 중...',
            description: '잠시만 기다려주세요...'
          })
          setCurrentPage('loading')
          generateCard()
          loadAd()
        }
      })
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setLoadingMessage({
        title: '연하장 생성 중...',
        description: '잠시만 기다려주세요...'
      })
      setCurrentPage('loading')
      generateCard()
      loadAd()
    }
  }

  const generateCard = async () => {
    if (!selectedImages || selectedImages.length === 0) {
      setError('사진을 다시 선택해주세요')
      setCurrentPage('error')
      return
    }

    try {
      const imageDataUri = await uploadAndGenerateCard(selectedImages, selectedCardTypeRef.current)
      setGeneratedImageUrl(imageDataUri)
      setCurrentPage('result')
    } catch (err) {
      console.error('연하장 생성 실패', err)
      setError(`연하장 생성 중 오류가 발생했습니다: ${err.message}`)
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
    setSelectedImages([])
    adPlayCountRef.current = 0
    preloadedImageUrlRef.current = null
    setGeneratedImageUrl(null)
    setError(null)

    loadAd()
  }

  const handleCardTypeSelect = async (cardType, maxCount) => {
    setSelectedCardType(cardType)
    selectedCardTypeRef.current = cardType
    setMaxPhotos(maxCount)
    adPlayCountRef.current = 0

    try {
      const isSupported = GoogleAdMob?.showAppsInTossAdMob?.isSupported?.()

      if (isSupported !== true) {
        console.warn('광고 표시 기능 미지원. isSupported:', isSupported)
        setCurrentPage('loading')
        generateCard()
        return
      }

      if (adLoaded === false) {
        console.log('⏳ 광고 로드 대기 중 - 로딩 화면 표시')
        setCurrentPage('loading')
        setWaitingForAd(true)

        adWaitTimeoutRef.current = setTimeout(() => {
          console.warn(`⚠️ 광고 로드 타임아웃 (${AD_WAIT_TIMEOUT_MS / 1000}초) - 광고 없이 진행`)
          setWaitingForAd(false)
          generateCard()
        }, AD_WAIT_TIMEOUT_MS)

        return
      }

      showAd()
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setCurrentPage('loading')
      generateCard()
    }
  }

  const handleBackToIntro = () => {
    setSelectedImages([])
    setSelectedCardType('new-year-card-single')
    selectedCardTypeRef.current = 'new-year-card-single'
    setMaxPhotos(1)
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
            selectedImages={selectedImages}
            onSelect={handleCardTypeSelect}
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
function NewYearSelection({ selectedImages, onSelect, onBack }) {
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
