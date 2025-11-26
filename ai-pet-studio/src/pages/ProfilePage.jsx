import { useState, useEffect, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, GoogleAdMob } from '@apps-in-toss/web-framework'
import Intro from '../components/Intro'
import Selection from '../components/Selection'
import Loading from '../components/Loading'
import Result from '../components/Result'
import { API_ENDPOINTS, AD_GROUP_ID, AD_WAIT_TIMEOUT_MS } from '../config/const'

export default function ProfilePage() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedPetType, setSelectedPetType] = useState('masterpiece')
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)

  // 광고 관련 상태
  const [adLoaded, setAdLoaded] = useState(false)
  const [waitingForAd, setWaitingForAd] = useState(false)

  // Refs
  const cleanupRef = useRef(undefined)
  const adWaitTimeoutRef = useRef(undefined)
  const rewardEarnedRef = useRef(false)
  const selectedPetTypeRef = useRef('masterpiece') // 선택한 반려동물 타입 저장

  const handleAlbumSelect = async () => {
    try {
      setError(null)

      // fetchAlbumPhotos 지원 여부 확인
      if (typeof fetchAlbumPhotos !== 'function') {
        // 브라우저 환경 - 파일 선택기 사용
        setError('브라우저에서는 파일 선택 기능을 사용해주세요.')
        return
      }

      console.log('갤러리 열기 시작...')

      // 갤러리에서 사진 선택
      const photos = await fetchAlbumPhotos({
        maxCount: 1,
        maxWidth: 384,  // 413 에러 방지를 위해 더 작게 리사이징
        base64: true    // Base64 형식으로
      })
      console.log('선택된 사진:', photos)

      if (!photos || photos.length === 0) {
        console.log('사진이 선택되지 않음')
        return // 사용자가 취소한 경우
      }

      const photo = photos[0]
      console.log('사진 정보:', photo)
      console.log('dataUri 존재 여부:', !!photo.dataUri)
      console.log('dataUri 길이:', photo.dataUri?.length)
      console.log('dataUri 시작 부분:', photo.dataUri?.substring(0, 100))

      // dataUri 정규화 (data: 접두사 확인)
      const normalizedDataUri = photo.dataUri.startsWith('data:')
        ? photo.dataUri
        : `data:image/jpeg;base64,${photo.dataUri}`

      console.log('dataUri를 Blob으로 변환 중...')

      // dataUri를 Blob으로 변환
      const response = await fetch(normalizedDataUri)
      console.log('fetch 응답 상태:', response.status, response.statusText)
      console.log('fetch 응답 ok:', response.ok)

      if (!response.ok) {
        throw new Error(`이미지 로드 실패: ${response.statusText}`)
      }

      const imageBlob = await response.blob()
      console.log('Blob 변환 완료:', imageBlob)
      console.log('Blob 크기:', imageBlob.size)
      console.log('Blob 타입:', imageBlob.type)

      setSelectedImage(imageBlob)
      // 갤러리 선택 후 용도 선택 페이지로 이동
      setCurrentPage('selection')

    } catch (err) {
      console.error('이미지 선택 오류 상세:', err)
      console.error('오류 이름:', err.name)
      console.error('오류 메시지:', err.message)
      console.error('오류 스택:', err.stack)
      setError(`이미지를 선택하는 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  const handleCameraSelect = async () => {
    try {
      setError(null)

      // openCamera API 지원 여부 확인
      if (typeof openCamera !== 'function') {
        setError('카메라 기능을 사용할 수 없습니다.')
        return
      }

      console.log('카메라 열기 시작...')

      // 카메라로 사진 촬영
      const photo = await openCamera({
        maxWidth: 384,  // 413 에러 방지를 위해 더 작게 리사이징
        base64: true    // Base64 형식으로
      })

      console.log('촬영된 사진:', photo)

      if (!photo || !photo.dataUri) {
        console.log('사진이 촬영되지 않음')
        return // 사용자가 취소한 경우
      }

      // dataUri 정규화 (data: 접두사 확인)
      const normalizedDataUri = photo.dataUri.startsWith('data:')
        ? photo.dataUri
        : `data:image/jpeg;base64,${photo.dataUri}`

      console.log('dataUri를 Blob으로 변환 중...')

      // dataUri를 Blob으로 변환
      const response = await fetch(normalizedDataUri)
      const imageBlob = await response.blob()
      console.log('Blob 변환 완료:', imageBlob)

      setSelectedImage(imageBlob)
      // 카메라 촬영 후 용도 선택 페이지로 이동
      setCurrentPage('selection')

    } catch (err) {
      console.error('카메라 촬영 오류 상세:', err)
      console.error('오류 이름:', err.name)
      console.error('오류 메시지:', err.message)
      setError(`카메라 촬영 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  const uploadAndGeneratePet = async (imageFile, petType) => {
    console.log('API 호출 시작...')
    console.log('이미지 파일:', imageFile)
    console.log('반려동물 타입:', petType)

    // Blob을 Base64로 변환
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

    // API 요청 바디 (모델은 서버에서 타입별로 자동 선택됨)
    const requestBody = {
      imageBase64: base64,
      mimeType: imageFile.type || 'image/jpeg',
      petType: petType
    }

    console.log('요청 데이터:', {
      mimeType: requestBody.mimeType,
      base64Length: requestBody.imageBase64.length,
      petType: requestBody.petType
    })

    console.log('API URL:', API_ENDPOINTS.GENERATE_PET_PHOTO)
    console.log('🔥 API 요청 본문:', JSON.stringify({
      petType: requestBody.petType,
      mimeType: requestBody.mimeType,
      hasModel: 'model' in requestBody ? '있음' : '없음 (서버 자동 선택)'
    }))

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
      // Base64 이미지를 Data URI로 변환하여 반환
      const imageDataUri = `data:${data.image.mimeType};base64,${data.image.data}`
      return imageDataUri
    } else {
      throw new Error(data.error || '이미지를 생성하지 못했습니다.')
    }
  }

  // 광고 로드 함수 (컴포넌트 마운트 시 실행)
  const loadAd = () => {
    try {
      console.log('\n📥 광고 로드 시도')

      // 광고 기능 지원 여부 확인
      const isSupported = GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.()
      console.log('🔍 loadAppsInTossAdMob.isSupported():', isSupported)

      if (isSupported !== true) {
        console.warn('❌ 광고 기능 미지원. isSupported:', isSupported)
        return
      }

      // 기존 cleanup 함수 실행
      cleanupRef.current?.()
      cleanupRef.current = undefined

      setAdLoaded(false)
      console.log('🔄 광고 로드 시작...')

      // 광고 로드
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
        }
      })

      cleanupRef.current = cleanup
    } catch (loadError) {
      console.error('⚠️ 광고 로드 예외:', loadError)
      setAdLoaded(false)
    }
  }

  // 광고 표시 함수
  const showAd = () => {
    try {
      console.log('✅ 광고 표시 시작')
      rewardEarnedRef.current = false

      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event) => {
          console.log('광고 이벤트:', event.type)

          switch (event.type) {
            case 'requested':
              console.log('✅ 광고 표시 요청 완료')
              break

            case 'show':
              console.log('✅ 광고 컨텐츠 표시 시작')
              break

            case 'impression':
              console.log('✅ 광고 노출 완료')
              break

            case 'clicked':
              console.log('✅ 광고 클릭됨')
              break

            case 'userEarnedReward':
              console.log('🎁 보상 획득!', event.data)
              rewardEarnedRef.current = true
              break

            case 'dismissed':
              console.log('광고 닫힘')

              // 보상 획득 여부 확인
              if (rewardEarnedRef.current) {
                console.log('✅ 보상형 광고 완료 - 반려동물 사진 생성 진행')
                setCurrentPage('loading')
                generatePet()
              } else {
                console.warn('⚠️ 보상형 광고 중도 종료 - 반려동물 사진 생성하지 않음')
                setCurrentPage('intro')
                setError('광고를 끝까지 시청해주세요')
              }

              // 다음 광고 로드
              loadAd()
              break

            case 'failedToShow':
              console.warn('⚠️ 광고 표시 실패 - 광고 없이 진행:', event.data)
              setCurrentPage('loading')
              generatePet()
              loadAd()
              break
          }
        },
        onError: (showError) => {
          console.error('❌ 광고 표시 에러:', showError)
          console.warn('⚠️ 광고 표시 에러 발생 - 광고 없이 진행')
          setCurrentPage('loading')
          generatePet()
          loadAd()
        }
      })
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setCurrentPage('loading')
      generatePet()
      loadAd()
    }
  }

  // 반려동물 사진 생성 함수
  const generatePet = async () => {
    if (!selectedImage) {
      setError('사진을 다시 선택해주세요')
      setCurrentPage('error')
      return
    }

    try {
      // ref에 저장된 petType 사용 (state 업데이트 타이밍 문제 방지)
      const imageDataUri = await uploadAndGeneratePet(selectedImage, selectedPetTypeRef.current)
      setGeneratedImageUrl(imageDataUri)
      setCurrentPage('result')
    } catch (err) {
      console.error('반려동물 사진 생성 실패', err)
      setError(`반려동물 사진 생성 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  // 컴포넌트 마운트 시 광고 로드 및 언마운트 시 정리
  useEffect(() => {
    loadAd()

    return () => {
      // cleanup 함수 호출
      cleanupRef.current?.()
      cleanupRef.current = undefined

      // 타이머 정리
      if (adWaitTimeoutRef.current) {
        clearTimeout(adWaitTimeoutRef.current)
        adWaitTimeoutRef.current = undefined
      }
    }
  }, [])

  // 광고 로드 완료 시 대기 중이었다면 광고 표시
  useEffect(() => {
    if (waitingForAd && adLoaded) {
      console.log('✅ 광고 로드 완료 - 광고 표시')
      setWaitingForAd(false)

      // 타이머 정리
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
    setSelectedPetType('masterpiece')
    selectedPetTypeRef.current = 'masterpiece' // ref도 초기화
    setGeneratedImageUrl(null)
    setError(null)

    // 다음 생성을 위해 광고 로드
    loadAd()
  }

  const handlePetTypeSelect = async (petType) => {
    setSelectedPetType(petType)
    selectedPetTypeRef.current = petType // ref에도 저장

    try {
      const isSupported = GoogleAdMob?.showAppsInTossAdMob?.isSupported?.()
      console.log('🔍 showAppsInTossAdMob.isSupported():', isSupported)
      console.log('📊 adLoaded 상태:', adLoaded)
      console.log('📝 선택된 반려동물 타입:', petType)

      if (isSupported !== true) {
        console.warn('광고 표시 기능 미지원. isSupported:', isSupported)
        setCurrentPage('loading')
        generatePet()
        return
      }

      // 광고 로드 중이라면 로딩 화면 표시하고 대기
      if (adLoaded === false) {
        console.log('⏳ 광고 로드 대기 중 - 로딩 화면 표시')
        setCurrentPage('loading')
        setWaitingForAd(true)

        // 최대 대기 시간 후 광고 없이 진행
        adWaitTimeoutRef.current = setTimeout(() => {
          console.warn(`⚠️ 광고 로드 타임아웃 (${AD_WAIT_TIMEOUT_MS / 1000}초) - 광고 없이 진행`)
          setWaitingForAd(false)
          generatePet()
        }, AD_WAIT_TIMEOUT_MS)

        return
      }

      // 광고가 이미 로드된 경우 바로 표시
      showAd()
    } catch (error) {
      console.error('❌ 광고 표시 중 예외 발생:', error)
      setCurrentPage('loading')
      generatePet()
    }
  }

  const handleBackToIntro = () => {
    setSelectedImage(null)
    setSelectedPetType('masterpiece')
    selectedPetTypeRef.current = 'masterpiece' // ref도 초기화
    setCurrentPage('intro')
  }

  const handleSave = async () => {
    try {
      if (!generatedImageUrl) {
        alert('저장할 이미지가 없습니다.')
        return
      }

      // saveBase64Data API 지원 여부 확인
      if (typeof saveBase64Data !== 'function') {
        alert('이미지 저장 기능을 사용할 수 없습니다.')
        return
      }

      console.log('이미지 저장 시작...')

      // Data URI에서 Base64 부분만 추출 (data:image/png;base64, 제거)
      const base64Data = generatedImageUrl.split(',')[1]

      // saveBase64Data API 호출
      await saveBase64Data({
        data: base64Data,
        fileName: `profile_${Date.now()}.png`,
        mimeType: 'image/png'
      })

      console.log('이미지 저장 완료')

    } catch (err) {
      console.error('이미지 저장 오류:', err)
      // 사용자가 취소한 경우는 에러 메시지 표시하지 않음
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
          />
        )
      case 'selection':
        return (
          <Selection
            selectedImage={selectedImage}
            onSelect={handlePetTypeSelect}
            onBack={handleBackToIntro}
          />
        )
      case 'loading':
        return <Loading />
      case 'result':
        return (
          <Result
            imageUrl={generatedImageUrl}
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

  return renderPage()
}
