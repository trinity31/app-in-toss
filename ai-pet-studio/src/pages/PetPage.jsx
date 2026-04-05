import { useState, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera } from '@apps-in-toss/web-framework'
import Landing from '../components/Landing'
import StyleGrid from '../components/StyleGrid'
import GeneratingProgress from '../components/GeneratingProgress'
import Result from '../components/Result'
import { API_ENDPOINTS, PET_SET_PRODUCT_SKU } from '../config/api'
import { PET_STYLE_SAMPLES } from '../config/styleSamples'

/**
 * 플로우: landing → styleShowcase → generating → result
 * 타입 선택 없이 9가지 스타일을 한 세트로 생성
 */

export default function PetPage() {
  const [page, setPage] = useState('landing')
  const [selectedImage, setSelectedImage] = useState(null)
  const [generatedImages, setGeneratedImages] = useState([])

  const selectedImageRef = useRef(null)

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
      // 타입 선택 없이 바로 샘플 쇼케이스
      setPage('styleShowcase')
    } catch (err) {
      console.error('사진 업로드 오류:', err)
      setPage('landing')
    }
  }

  // ── 세트 구매 → 생성 시작 ──

  const handlePurchase = async () => {
    try {
      // TODO: 인앱결제 연동
      // const { purchaseInAppProduct } = await import('@apps-in-toss/web-framework')
      // await purchaseInAppProduct({ sku: PET_SET_PRODUCT_SKU })

      const purchaseToken = `test-token-${Date.now()}`

      setPage('generating')
      await generateSet(purchaseToken)
    } catch (err) {
      console.error('결제 실패:', err)
    }
  }

  // ── 9장 세트 생성 ──

  const generateSet = async (purchaseToken) => {
    try {
      const base64 = await blobToBase64(selectedImageRef.current)

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
    } catch (err) {
      console.error('세트 생성 실패:', err)
      setPage('styleShowcase')
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

  const handleShare = async (imageId) => {
    await handleSave(imageId)
  }

  // ── 네비게이션 ──

  const handleRetry = () => {
    setPage('landing')
    setSelectedImage(null)
    selectedImageRef.current = null
    setGeneratedImages([])
  }

  const handleBackToLanding = () => {
    setSelectedImage(null)
    selectedImageRef.current = null
    setPage('landing')
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
      return <Landing onUpload={handleUpload} />

    case 'styleShowcase':
      return (
        <StyleGrid
          samples={PET_STYLE_SAMPLES}
          onPurchase={handlePurchase}
          onBack={handleBackToLanding}
        />
      )

    case 'generating':
      return <GeneratingProgress />

    case 'result':
      return (
        <Result
          images={generatedImages}
          onSave={handleSave}
          onSaveAll={handleSaveAll}
          onShare={handleShare}
          onRetry={handleRetry}
        />
      )

    default:
      return <Landing onUpload={handleUpload} />
  }
}
