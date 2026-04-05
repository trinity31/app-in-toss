import { useState, useRef } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera } from '@apps-in-toss/web-framework'
import Landing from '../components/Landing'
import TypeSelection from '../components/TypeSelection'
import StyleGrid from '../components/StyleGrid'
import GeneratingProgress from '../components/GeneratingProgress'
import Result from '../components/Result'
import { API_ENDPOINTS, PROFILE_PRODUCT_SKU } from '../config/api'
import { getSamplesForType } from '../config/styleSamples'

/**
 * 최종 플로우: landing → typeSelect → styleShowcase → generating → result
 *
 * 1. 사진 업로드
 * 2. 프로필 타입 선택 (전문가, SNS 등)
 * 3. 샘플 이미지 쇼케이스 (정적, API 비용 0) → 세트 구매
 * 4. 결제 후 6장 고화질 생성 (API 6회)
 * 5. 결과 갤러리 → 저장/공유
 */

export default function ProfilePage() {
  const [page, setPage] = useState('landing')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProfileType, setSelectedProfileType] = useState(null)
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
      setPage('typeSelect')
    } catch (err) {
      console.error('사진 업로드 오류:', err)
      setPage('landing')
    }
  }

  // ── 프로필 타입 선택 → 샘플 쇼케이스 ──

  const handleTypeSelect = (profileTypeId) => {
    setSelectedProfileType(profileTypeId)
    setPage('styleShowcase')
  }

  // ── 세트 구매 → 생성 시작 ──

  const handlePurchase = async () => {
    try {
      // TODO: 인앱결제 연동
      // const { purchaseInAppProduct } = await import('@apps-in-toss/web-framework')
      // const receipt = await purchaseInAppProduct({ sku: PROFILE_PRODUCT_SKU })
      // const purchaseToken = receipt.token

      // 임시: 결제 시뮬레이션
      const purchaseToken = `test-token-${Date.now()}`

      // 결제 성공 → 생성 시작
      setPage('generating')
      await generateSet(purchaseToken)
    } catch (err) {
      console.error('결제 실패:', err)
    }
  }

  // ── 6장 세트 생성 (서버 세트 API 사용) ──

  const generateSet = async (purchaseToken) => {
    try {
      const base64 = await blobToBase64(selectedImageRef.current)

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

      // 서버 응답을 프론트 포맷으로 변환
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

  // ── 개별 저장 ──

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

  // ── 전체 저장 ──

  const handleSaveAll = async () => {
    for (const img of generatedImages) {
      await handleSave(img.id)
    }
  }

  // ── 개별 공유 ──

  const handleShare = async (imageId) => {
    // TODO: 공유 API 연동
    await handleSave(imageId)
  }

  // ── 네비게이션 ──

  const handleRetry = () => {
    setPage('typeSelect')
    setSelectedProfileType(null)
    setGeneratedImages([])
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

  // 타입 이름 (표시용)
  const typeNameMap = {
    sns: 'SNS 프로필', professional: '전문가 프로필', artist: '아티스트 프로필',
    dating: '소개팅 프로필', nomad: '디지털 노마드', creative: '크리에이티브',
  }
  const typeName = typeNameMap[selectedProfileType] || selectedProfileType

  switch (page) {
    case 'landing':
      return <Landing onUpload={handleUpload} />

    case 'typeSelect':
      return (
        <TypeSelection
          selectedImage={selectedImage}
          onSelect={handleTypeSelect}
          onBack={handleBackToLanding}
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
          typeName={typeName}
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
