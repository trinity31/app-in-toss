import { useState, useRef, useEffect } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, IAP } from '@apps-in-toss/web-framework'
import Landing from '../components/Landing'
import TypeSelection from '../components/TypeSelection'
import StyleGrid from '../components/StyleGrid'
import GeneratingProgress from '../components/GeneratingProgress'
import Result from '../components/Result'
import TossLogin from '../components/TossLogin'
import { API_ENDPOINTS, PROFILE_PRODUCT_SKU, IMAGE_ENDPOINTS, IMAGE_BUCKET } from '../config/api'
import { getSamplesForType } from '../config/styleSamples'

/**
 * 플로우: landing → typeSelect → tossLogin → styleShowcase → generating → result
 *
 * 1. 사진 업로드
 * 2. 프로필 타입 선택 (전문가, SNS 등)
 * 3. 토스 로그인
 * 4. 샘플 이미지 쇼케이스 (정적, API 비용 0) → 세트 구매
 * 5. 결제 후 6장 고화질 생성 (API 6회)
 * 6. 결과 갤러리 → 저장
 */

export default function ProfilePage() {
  const [page, setPage] = useState('landing')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProfileType, setSelectedProfileType] = useState(null)
  const [generatedImages, setGeneratedImages] = useState([])
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  const [failedStyles, setFailedStyles] = useState([])
  const [error, setError] = useState(null)

  const selectedImageRef = useRef(null)
  const userIdRef = useRef(localStorage.getItem('profile_photo_user_key'))
  const purchaseOrderIdRef = useRef(null)

  // ── 앱 진입 시 미결 주문 확인 ──

  useEffect(() => {
    const failedVariations = localStorage.getItem('profile_photo_failed_styles')
    const savedImage = localStorage.getItem('profile_photo_pending_image')
    if (failedVariations && savedImage) {
      console.log('[ProfilePage] 미완성 생성 발견')
      setHasPendingOrder(true)
      setSelectedProfileType(localStorage.getItem('profile_photo_pending_type'))
      setPage('result')
    }
  }, [])

  // ── 미결 주문 복구 실행 ──

  const handleRestorePending = async () => {
    const savedImage = localStorage.getItem('profile_photo_pending_image')
    if (!savedImage) {
      localStorage.removeItem('profile_photo_failed_styles')
      localStorage.removeItem('profile_photo_pending_type')
      setHasPendingOrder(false)
      return
    }

    setPage('generating')

    try {
      const failedVariations = JSON.parse(localStorage.getItem('profile_photo_failed_styles') || '[]')
      const profileType = localStorage.getItem('profile_photo_pending_type') || 'professional'
      const body = {
        imageBase64: savedImage,
        mimeType: 'image/jpeg',
        profileType,
        purchaseToken: 'restore-' + Date.now(),
      }
      if (failedVariations.length > 0 && failedVariations[0] !== 'all') {
        body.variations = failedVariations
        body.count = failedVariations.length
      } else {
        body.count = 6
      }

      const res = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success && data.images?.length) {
        if (userIdRef.current) {
          for (const img of data.images) {
            uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
          }
        }

        if (!data.errors?.length) {
          localStorage.removeItem('profile_photo_pending_image')
          localStorage.removeItem('profile_photo_failed_styles')
          localStorage.removeItem('profile_photo_pending_type')
          setHasPendingOrder(false)
        } else {
          const stillFailed = data.errors.map(e => e.variation || e.style)
          localStorage.setItem('profile_photo_failed_styles', JSON.stringify(stillFailed))
        }

        const images = data.images.map(img => ({
          id: img.id,
          label: img.label,
          imageUrl: `data:${img.mimeType};base64,${img.data}`,
        }))
        setGeneratedImages(images)
        setPage('result')
      } else {
        setError('이미지 생성에 실패했습니다. 다시 시도해 주세요.')
        setPage('result')
      }
    } catch (err) {
      console.error('[ProfilePage] 미결 주문 복구 실패:', err)
      setError('복구에 실패했습니다. 다시 시도해 주세요.')
      setPage('result')
    }
  }

  const handleDismissPending = () => {
    localStorage.removeItem('profile_photo_pending_image')
    localStorage.removeItem('profile_photo_failed_styles')
    localStorage.removeItem('profile_photo_pending_type')
    setHasPendingOrder(false)
    setPage('landing')
  }

  // ── 사진 업로드 ──

  const processPhoto = async (dataUri) => {
    const normalizedDataUri = dataUri.startsWith('data:')
      ? dataUri
      : `data:image/jpeg;base64,${dataUri}`
    const response = await fetch(normalizedDataUri)
    if (!response.ok) throw new Error('이미지 로드 실패')
    return response.blob()
  }

  const handleUpload = async (type) => {
    try {
      let photoData = null

      if (type === 'camera') {
        if (typeof openCamera !== 'function') return
        const photo = await openCamera({ maxWidth: 384, base64: true })
        if (!photo?.dataUri) return
        photoData = photo.dataUri
      } else {
        if (typeof fetchAlbumPhotos !== 'function') return
        const photos = await fetchAlbumPhotos({ maxCount: 1, maxWidth: 384, base64: true })
        if (!photos?.length) return
        photoData = photos[0].dataUri
      }

      const blob = await processPhoto(photoData)
      setSelectedImage(blob)
      selectedImageRef.current = blob
      setPage('typeSelect')
    } catch (err) {
      console.error('사진 업로드 오류:', err)
      setError('사진을 불러오는 중 오류가 발생했습니다')
      setPage('landing')
    }
  }

  // ── 프로필 타입 선택 → 토스 로그인 ──

  const handleTypeSelect = (profileTypeId) => {
    setSelectedProfileType(profileTypeId)
    setPage('tossLogin')
  }

  // ── 토스 로그인 완료 콜백 ──

  const handleLoginComplete = ({ userKey }) => {
    const uid = String(userKey)
    userIdRef.current = uid
    localStorage.setItem('profile_photo_user_key', uid)
    setPage('styleShowcase')
  }

  // ── 세트 구매 → 생성 시작 ──

  const handlePurchase = () => {
    const cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: PROFILE_PRODUCT_SKU,
        processProductGrant: ({ orderId }) => {
          purchaseOrderIdRef.current = orderId
          return true
        },
      },
      onEvent: (event) => {
        if (event.type === 'success') {
          cleanup()
          setPage('generating')
          generateSet(purchaseOrderIdRef.current)
        }
      },
      onError: (iapError) => {
        console.error('인앱결제 실패:', iapError)
        console.log('[IAP onError] type:', typeof iapError)
        console.log('[IAP onError] JSON:', JSON.stringify(iapError, null, 2))
        console.log('[IAP onError] code:', iapError?.code)
        console.log('[IAP onError] message:', iapError?.message)
        console.log('[IAP onError] errorCode:', iapError?.errorCode)
        const errorStr = String(iapError?.code || iapError?.errorCode || iapError?.message || iapError || '')

        if (errorStr.includes('PRODUCT_NOT_GRANTED') || errorStr.includes('VERIFICATION_FAILED') || errorStr.includes('processProductGrant')) {
          if (selectedImageRef.current && !localStorage.getItem('profile_photo_pending_image')) {
            blobToBase64(selectedImageRef.current).then(base64 => {
              localStorage.setItem('profile_photo_pending_image', base64)
              localStorage.setItem('profile_photo_failed_styles', JSON.stringify(['all']))
              localStorage.setItem('profile_photo_pending_type', selectedProfileType)
            }).catch(() => {})
          }
          setError('결제가 완료되었지만 사진 생성에 실패했습니다. 추가 결제 없이 다시 시도할 수 있습니다.')
          setHasPendingOrder(true)
          setPage('result')
        } else {
          setError('결제가 취소되었거나 실패했습니다')
          setPage('styleShowcase')
        }
        cleanup()
      },
    })
  }

  // ── 6장 세트 생성 ──

  const generateSet = async (purchaseToken) => {
    try {
      const base64 = await blobToBase64(selectedImageRef.current)

      // 원본 사진을 localStorage에 저장 (재생성용)
      localStorage.setItem('profile_photo_pending_image', base64)
      localStorage.setItem('profile_photo_pending_type', selectedProfileType)

      const response = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: selectedImageRef.current.type || 'image/jpeg',
          profileType: selectedProfileType,
          count: 6,
          purchaseToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `생성 실패 (${response.status})`)
      }

      const data = await response.json()

      if (!data.success || !data.images?.length) {
        throw new Error('이미지 생성에 실패했습니다')
      }

      const images = data.images.map(img => ({
        id: img.id,
        label: img.label,
        imageUrl: `data:${img.mimeType};base64,${img.data}`,
      }))

      setGeneratedImages(images)
      setPage('result')

      // 백그라운드로 Supabase에 업로드
      for (const img of data.images) {
        uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
      }

      // 실패한 변형 저장
      if (data.errors?.length > 0) {
        const failed = data.errors.map(e => ({ id: e.variation || e.style, label: e.label || e.variation || e.style }))
        setFailedStyles(failed)
        localStorage.setItem('profile_photo_failed_styles', JSON.stringify(data.errors.map(e => e.variation || e.style)))
      } else {
        localStorage.removeItem('profile_photo_pending_image')
        localStorage.removeItem('profile_photo_failed_styles')
        localStorage.removeItem('profile_photo_pending_type')
      }
    } catch (err) {
      console.error('세트 생성 실패:', err)
      localStorage.setItem('profile_photo_failed_styles', JSON.stringify(['all']))
      setError('사진 생성 중 오류가 발생했습니다. 추가 결제 없이 다시 시도할 수 있습니다.')
      setHasPendingOrder(true)
      setPage('result')
    }
  }

  // ── 실패한 변형 재생성 (결과 화면에서 호출) ──

  const handleRetryFailedFromResult = async () => {
    const savedImage = localStorage.getItem('profile_photo_pending_image')
    const storedFailed = JSON.parse(localStorage.getItem('profile_photo_failed_styles') || '[]')
    if (!savedImage || storedFailed.length === 0) return

    setPage('generating')

    try {
      const profileType = localStorage.getItem('profile_photo_pending_type') || 'professional'
      const body = {
        imageBase64: savedImage,
        mimeType: 'image/jpeg',
        profileType,
        purchaseToken: 'retry-' + Date.now(),
      }
      if (storedFailed[0] !== 'all') {
        body.variations = storedFailed
      }
      body.count = storedFailed[0] === 'all' ? 6 : storedFailed.length

      const response = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('재생성 실패')
      const data = await response.json()

      if (!data.success || !data.images?.length) throw new Error('재생성 실패')

      for (const img of data.images) {
        uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
      }

      const newImages = data.images.map(img => ({
        id: img.id,
        label: img.label,
        imageUrl: `data:${img.mimeType};base64,${img.data}`,
      }))
      setGeneratedImages(prev => [...prev, ...newImages])

      if (data.errors?.length) {
        const stillFailed = data.errors.map(e => ({ id: e.variation || e.style, label: e.label || e.variation || e.style }))
        setFailedStyles(stillFailed)
        localStorage.setItem('profile_photo_failed_styles', JSON.stringify(data.errors.map(e => e.variation || e.style)))
      } else {
        setFailedStyles([])
        localStorage.removeItem('profile_photo_pending_image')
        localStorage.removeItem('profile_photo_failed_styles')
        localStorage.removeItem('profile_photo_pending_type')
        setHasPendingOrder(false)
      }

      setPage('result')
    } catch (err) {
      console.error('재생성 실패:', err)
      setError('재생성에 실패했습니다. 다시 시도해 주세요.')
      setPage('result')
    }
  }

  // ── 저장 ──

  const handleSave = async (imageId) => {
    try {
      const img = generatedImages.find(i => i.id === imageId)
      if (!img || typeof saveBase64Data !== 'function') return

      const base64Data = img.imageUrl.split(',')[1]
      await saveBase64Data({
        data: base64Data,
        fileName: `profile_${imageId}_${Date.now()}.png`,
        mimeType: 'image/png',
      })
    } catch (err) {
      if (!err.message?.toLowerCase().includes('cancel')) {
        console.error('저장 오류:', err)
      }
    }
  }

  const handleSaveAll = async () => {
    for (const img of generatedImages) {
      await handleSave(img.id)
    }
  }

  // ── 네비게이션 ──

  const handleRetry = () => {
    setPage('typeSelect')
    setSelectedProfileType(null)
    setGeneratedImages([])
    setFailedStyles([])
  }

  const handleBackToTypeSelect = () => {
    setSelectedProfileType(null)
    setPage('typeSelect')
  }

  const handleBackToLanding = () => {
    setSelectedImage(null)
    selectedImageRef.current = null
    setSelectedProfileType(null)
    setPage('landing')
  }

  // ── Supabase 업로드 ──

  const uploadToSupabase = async (base64Data, userId, styleId) => {
    try {
      await fetch(IMAGE_ENDPOINTS.UPLOAD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          userId,
          cardType: styleId,
          bucket: IMAGE_BUCKET,
        }),
      })
    } catch (err) {
      console.error('Supabase 업로드 실패:', err)
    }
  }

  // ── 유틸 ──

  const blobToBase64 = (blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

  // ── 렌더링 ──

  const currentSamples = selectedProfileType
    ? getSamplesForType(selectedProfileType)
    : []

  const typeNameMap = {
    sns: 'SNS 프로필', professional: '전문가 프로필', artist: '아티스트 프로필',
    dating: '소개팅 프로필', nomad: '디지털 노마드', creative: '크리에이티브',
  }
  const typeName = typeNameMap[selectedProfileType] || selectedProfileType

  switch (page) {
    case 'landing':
      return (
        <Landing
          onUpload={handleUpload}
          error={error}
          onDismissError={() => setError(null)}
        />
      )

    case 'typeSelect':
      return (
        <TypeSelection
          selectedImage={selectedImage}
          onSelect={handleTypeSelect}
          onBack={handleBackToLanding}
        />
      )

    case 'tossLogin':
      return (
        <TossLogin
          onNext={handleLoginComplete}
          onBack={handleBackToTypeSelect}
        />
      )

    case 'styleShowcase':
      return (
        <StyleGrid
          samples={currentSamples}
          typeName={typeName}
          onPurchase={handlePurchase}
          onBack={handleBackToTypeSelect}
        />
      )

    case 'generating':
      return <GeneratingProgress />

    case 'result':
      return (
        <Result
          images={generatedImages}
          failedStyles={failedStyles}
          onRetryFailed={handleRetryFailedFromResult}
          typeName={typeName}
          onSave={handleSave}
          onSaveAll={handleSaveAll}
          onRetry={handleRetry}
          hasPendingOrder={hasPendingOrder}
          onRestore={handleRestorePending}
          onDismissPending={handleDismissPending}
          error={error}
          onDismissError={() => setError(null)}
        />
      )

    default:
      return <Landing onUpload={handleUpload} />
  }
}
