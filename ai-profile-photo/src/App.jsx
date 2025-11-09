import { useState } from 'react'
import { fetchAlbumPhotos, saveBase64Data, openCamera } from '@apps-in-toss/web-framework'
import IntroPage from './intro_page'
import SelectionPage from './selection_page'
import LoadingPage from './loading_page'
import ResultPage from './result_page'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('intro')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedProfileType, setSelectedProfileType] = useState('professional')
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [error, setError] = useState(null)

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

  const uploadAndGenerateProfile = async (imageFile, profileType) => {
    try {
      console.log('API 호출 시작...')
      console.log('이미지 파일:', imageFile)
      console.log('프로필 타입:', profileType)

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

      const requestBody = {
        imageBase64: base64,
        mimeType: imageFile.type || 'image/jpeg',
        profileType: profileType
      }

      console.log('요청 데이터:', {
        mimeType: requestBody.mimeType,
        base64Length: requestBody.imageBase64.length
      })

      const apiUrl = 'https://ai-profile-photo-api.vercel.app/api/generate-profile-photo'

       //const apiUrl = 'http://192.168.0.26:3000/api/generate-profile-photo'

      console.log('API URL:', apiUrl)

      const response = await fetch(apiUrl, {
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
        // Base64 이미지를 Data URI로 변환
        const imageDataUri = `data:${data.image.mimeType};base64,${data.image.data}`
        setGeneratedImageUrl(imageDataUri)
        setCurrentPage('result')
      } else {
        throw new Error(data.error || '이미지를 생성하지 못했습니다.')
      }

    } catch (err) {
      console.error('API 호출 오류 상세:', err)
      console.error('오류 스택:', err.stack)
      setError(`프로필 사진 생성 중 오류가 발생했습니다: ${err.message}`)
      setCurrentPage('intro')
    }
  }

  const handleReset = () => {
    setCurrentPage('intro')
    setSelectedImage(null)
    setSelectedProfileType('professional')
    setGeneratedImageUrl(null)
    setError(null)
  }

  const handleProfileTypeSelect = async (profileType) => {
    setSelectedProfileType(profileType)
    setCurrentPage('loading')

    // API 호출 - profileType을 직접 전달
    await uploadAndGenerateProfile(selectedImage, profileType)
  }

  const handleBackToIntro = () => {
    setSelectedImage(null)
    setSelectedProfileType('professional')
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
          <IntroPage
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
          <SelectionPage
            selectedImage={selectedImage}
            onSelect={handleProfileTypeSelect}
            onBack={handleBackToIntro}
          />
        )
      case 'loading':
        return <LoadingPage />
      case 'result':
        return (
          <ResultPage
            imageUrl={generatedImageUrl}
            onClose={handleReset}
            onSave={handleSave}
          />
        )
      default:
        return (
          <IntroPage
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
    <div className="App">
      {renderPage()}
    </div>
  )
}

export default App
