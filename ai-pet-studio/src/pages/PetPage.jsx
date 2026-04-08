import { useState, useRef, useEffect } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera, IAP } from '@apps-in-toss/web-framework'
import Landing from '../components/Landing'
import GeneratingProgress from '../components/GeneratingProgress'
import Result from '../components/Result'
import History from '../components/History'
import TossLogin from '../components/TossLogin'
import { API_ENDPOINTS, PET_SET_PRODUCT_SKU, IMAGE_ENDPOINTS, IMAGE_BUCKET } from '../config/api'

/**
 * 플로우: landing → styleShowcase → generating → result
 * 타입 선택 없이 9가지 스타일을 한 세트로 생성
 */

export default function PetPage() {
  const [page, setPage] = useState('landing')
  const [generatedImages, setGeneratedImages] = useState([])
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  const [failedStyles, setFailedStyles] = useState([])
  const [error, setError] = useState(null)

  const selectedImageRef = useRef(null)
  const userIdRef = useRef(localStorage.getItem('pet_profile_user_key'))
  const purchaseOrderIdRef = useRef(null)

  // ── 앱 진입 시 미결 주문 확인 (localStorage만 — IAP 호출 없음) ──

  useEffect(() => {
    const failedStyles = localStorage.getItem('pet_profile_failed_styles')
    const savedImage = localStorage.getItem('pet_profile_pending_image')
    if (failedStyles && savedImage) {
      console.log('[PetPage] 미완성 생성 발견')
      setHasPendingOrder(true)
      setPage('result')
    }
  }, [])

  // ── 미결 주문 복구 실행 ──

  const handleRestorePending = async () => {
    const savedImage = localStorage.getItem('pet_profile_pending_image')
    if (!savedImage) {
      // 원본 사진이 없으면 정리만
      localStorage.removeItem('pet_profile_failed_styles')
      setHasPendingOrder(false)
      return
    }

    setPage('generating')

    try {
      const failedStyles = JSON.parse(localStorage.getItem('pet_profile_failed_styles') || '[]')
      const body = {
        imageBase64: savedImage,
        mimeType: 'image/jpeg',
        purchaseToken: 'restore-' + Date.now(),
      }
      if (failedStyles.length > 0 && failedStyles[0] !== 'all') {
        body.styles = failedStyles
        body.count = failedStyles.length
      } else {
        body.count = 9
      }

      const res = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success && data.images?.length) {
        // Supabase 업로드
        if (userIdRef.current) {
          for (const img of data.images) {
            uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
          }
        }

        if (!data.errors?.length) {
          localStorage.removeItem('pet_profile_pending_image')
          localStorage.removeItem('pet_profile_failed_styles')
          setHasPendingOrder(false)
        } else {
          const stillFailed = data.errors.map(e => e.style)
          localStorage.setItem('pet_profile_failed_styles', JSON.stringify(stillFailed))
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
        setPage('landing')
      }
    } catch (err) {
      console.error('[PetPage] 미결 주문 복구 실패:', err)
      setError('복구에 실패했습니다. 다시 시도해 주세요.')
      setPage('landing')
    }
  }

  const handleDismissPending = () => {
    localStorage.removeItem('pet_profile_pending_image')
    localStorage.removeItem('pet_profile_failed_styles')
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
      selectedImageRef.current = blob
      // 업로드 후 토스 로그인 페이지로 이동
      setPage('tossLogin')
    } catch (err) {
      console.error('사진 업로드 오류:', err)
      setError('사진을 불러오는 중 오류가 발생했습니다')
      setPage('landing')
    }
  }

  // ── 토스 로그인 완료 콜백 ──

  const handleLoginComplete = ({ userKey }) => {
    const uid = String(userKey)
    userIdRef.current = uid
    localStorage.setItem('pet_profile_user_key', uid)
    handlePurchase()
  }

  // ── 세트 구매 → 생성 시작 ──

  const handlePurchase = () => {
    const cleanup = IAP.createOneTimePurchaseOrder({
      options: {
        sku: PET_SET_PRODUCT_SKU,
        processProductGrant: ({ orderId }) => {
          // 즉시 true 반환 (30초 제한), 생성은 onEvent에서 처리
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
          // 결제 완료 + 지급 실패 → 원본 사진 저장 후 복구 가능 상태로
          if (selectedImageRef.current && !localStorage.getItem('pet_profile_pending_image')) {
            blobToBase64(selectedImageRef.current).then(base64 => {
              localStorage.setItem('pet_profile_pending_image', base64)
              localStorage.setItem('pet_profile_failed_styles', JSON.stringify(['all']))
            }).catch(() => {})
          }
          setError('결제가 완료되었지만 사진 생성에 실패했습니다. 추가 결제 없이 다시 시도할 수 있습니다.')
          setHasPendingOrder(true)
          setPage('result')
        } else {
          setError('결제가 취소되었거나 실패했습니다')
          setPage('landing')
        }
        cleanup()
      },
    })
  }

  // ── 9장 세트 생성 ──

  const generateSet = async (purchaseToken) => {
    try {
      const base64 = await blobToBase64(selectedImageRef.current)

      // 원본 사진을 localStorage에 저장 (재생성용)
      localStorage.setItem('pet_profile_pending_image', base64)

      const response = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: selectedImageRef.current.type || 'image/jpeg',
          count: 9,
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

      // 실패한 스타일 저장 (errors가 있으면)
      if (data.errors?.length > 0) {
        const failed = data.errors.map(e => ({ id: e.style, label: e.label || e.style }))
        setFailedStyles(failed)
        localStorage.setItem('pet_profile_failed_styles', JSON.stringify(data.errors.map(e => e.style)))
      } else {
        // 전부 성공 시 pending 데이터 제거
        localStorage.removeItem('pet_profile_pending_image')
        localStorage.removeItem('pet_profile_failed_styles')
      }
    } catch (err) {
      console.error('세트 생성 실패:', err)
      // 전체 실패 시 모든 스타일을 실패로 기록
      localStorage.setItem('pet_profile_failed_styles', JSON.stringify(['all']))
      setError('사진 생성 중 오류가 발생했습니다. 추가 결제 없이 다시 시도할 수 있습니다.')
      setHasPendingOrder(true)
      setPage('result')
    }
  }

  // ── 실패한 스타일 재생성 (결과 화면에서 호출) ──

  const handleRetryFailedFromResult = async () => {
    const savedImage = localStorage.getItem('pet_profile_pending_image')
    const storedFailed = JSON.parse(localStorage.getItem('pet_profile_failed_styles') || '[]')
    if (!savedImage || storedFailed.length === 0) return

    setPage('generating')

    try {
      const body = {
        imageBase64: savedImage,
        mimeType: 'image/jpeg',
        purchaseToken: 'retry-' + Date.now(),
      }
      if (storedFailed[0] !== 'all') {
        body.styles = storedFailed
      }
      body.count = storedFailed[0] === 'all' ? 9 : storedFailed.length

      const response = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('재생성 실패')
      const data = await response.json()

      if (!data.success || !data.images?.length) throw new Error('재생성 실패')

      // Supabase 업로드
      for (const img of data.images) {
        uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
      }

      // 새로 성공한 이미지를 기존 목록에 합치기
      const newImages = data.images.map(img => ({
        id: img.id,
        label: img.label,
        imageUrl: `data:${img.mimeType};base64,${img.data}`,
      }))
      setGeneratedImages(prev => [...prev, ...newImages])

      // 여전히 실패한 스타일 업데이트
      if (data.errors?.length) {
        const stillFailed = data.errors.map(e => ({ id: e.style, label: e.label || e.style }))
        setFailedStyles(stillFailed)
        localStorage.setItem('pet_profile_failed_styles', JSON.stringify(data.errors.map(e => e.style)))
      } else {
        setFailedStyles([])
        localStorage.removeItem('pet_profile_pending_image')
        localStorage.removeItem('pet_profile_failed_styles')
        setHasPendingOrder(false)
      }

      setPage('result')
    } catch (err) {
      console.error('재생성 실패:', err)
      setError('재생성에 실패했습니다. 다시 시도해 주세요.')
      setPage('result')
    }
  }

  // ── 실패한 스타일 재생성 (히스토리에서 호출) ──

  const handleRetryFailed = async () => {
    const savedImage = localStorage.getItem('pet_profile_pending_image')
    const failedStyles = JSON.parse(localStorage.getItem('pet_profile_failed_styles') || '[]')

    if (!savedImage || failedStyles.length === 0) return

    setPage('generating')

    try {
      const body = {
        imageBase64: savedImage,
        mimeType: 'image/jpeg',
        purchaseToken: 'retry-' + Date.now(),
      }
      // 'all'이면 전체 재생성, 아니면 실패한 스타일만
      if (failedStyles[0] !== 'all') {
        body.styles = failedStyles
      }
      body.count = failedStyles[0] === 'all' ? 9 : failedStyles.length

      const response = await fetch(API_ENDPOINTS.GENERATE_SET, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) throw new Error('재생성 실패')
      const data = await response.json()

      if (!data.success || !data.images?.length) throw new Error('재생성 실패')

      // Supabase 업로드
      for (const img of data.images) {
        uploadToSupabase(img.data, userIdRef.current, img.id).catch(() => {})
      }

      // 성공 시 pending 데이터 제거
      if (!data.errors?.length) {
        localStorage.removeItem('pet_profile_pending_image')
        localStorage.removeItem('pet_profile_failed_styles')
      } else {
        // 여전히 실패한 스타일 업데이트
        const stillFailed = data.errors.map(e => e.style)
        localStorage.setItem('pet_profile_failed_styles', JSON.stringify(stillFailed))
      }

      setPage('history')
    } catch (err) {
      console.error('재생성 실패:', err)
      setPage('history')
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
        fileName: `pet_${imageId}_${Date.now()}.png`,
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
    setPage('landing')
    selectedImageRef.current = null
    setGeneratedImages([])
    setFailedStyles([])
    setHasPendingOrder(false)
    setError(null)
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

  switch (page) {
    case 'landing':
      return (
        <Landing
          onUpload={handleUpload}
          onHistory={() => setPage(userIdRef.current ? 'history' : 'historyLogin')}
          error={error}
          onDismissError={() => setError(null)}
        />
      )

    case 'tossLogin':
      return (
        <TossLogin
          onNext={handleLoginComplete}
          onBack={() => setPage('landing')}
        />
      )

    case 'historyLogin':
      return (
        <TossLogin
          onNext={({ userKey }) => {
            const uid = String(userKey)
            userIdRef.current = uid
            localStorage.setItem('pet_profile_user_key', uid)
            setPage('history')
          }}
          onBack={() => setPage('landing')}
        />
      )

    case 'history':
      return <History userId={userIdRef.current} onBack={() => setPage('landing')} onRetryFailed={handleRetryFailed} />

    case 'generating':
      return <GeneratingProgress />

    case 'result':
      return (
        <Result
          images={generatedImages}
          failedStyles={failedStyles}
          onRetryFailed={handleRetryFailedFromResult}
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
