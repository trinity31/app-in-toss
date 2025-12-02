import { useState } from 'react'

export default function PhotoUpload({ onNext, onBack }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  console.log('[PhotoUpload] 렌더링 - selectedPhoto:', selectedPhoto, 'isMenuOpen:', isMenuOpen)

  const handleAlbumSelect = async () => {
    setIsMenuOpen(false)
    try {
      setIsLoading(true)

      // Apps in Toss 프레임워크의 fetchAlbumPhotos API 호출
      const { fetchAlbumPhotos } = await import('@apps-in-toss/web-framework')

      // 권한 확인
      const permission = await fetchAlbumPhotos.getPermission()

      if (permission !== 'allowed') {
        const requestedPermission = await fetchAlbumPhotos.openPermissionDialog()
        if (requestedPermission !== 'allowed') {
          alert('앨범 접근 권한이 필요합니다.')
          return
        }
      }

      // 사진 선택 (한 장만)
      const photos = await fetchAlbumPhotos({ maxCount: 1, maxWidth: 360, base64: true })

      console.log('선택된 사진:', photos)

      if (!photos || photos.length === 0) {
        console.log('[PhotoUpload] 사진이 선택되지 않음 (취소 또는 빈 배열)')
        alert('사진을 선택하지 않았거나, 선택한 사진을 불러올 수 없습니다. 다른 사진을 선택해주세요.')
        return
      }

      if (photos && photos.length > 0) {
        const photo = photos[0]
        console.log('사진 정보:', photo)
        console.log('dataUri 존재 여부:', !!photo.dataUri)

        // dataUri 정규화 (data: 접두사 확인)
        const normalizedDataUri = photo.dataUri?.startsWith('data:')
          ? photo.dataUri
          : `data:image/jpeg;base64,${photo.dataUri}`

        setSelectedPhoto({
          id: photo.id,
          previewUri: normalizedDataUri,
          dataUri: photo.dataUri
        })
        console.log('사진 설정 완료:', normalizedDataUri.substring(0, 50))
      }
    } catch (error) {
      console.error('사진 선택 실패:', error)
      alert('사진을 가져오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCameraSelect = async () => {
    setIsMenuOpen(false)
    try {
      setIsLoading(true)

      // Apps in Toss 프레임워크의 openCamera API 호출
      const { openCamera } = await import('@apps-in-toss/web-framework')

      // 카메라로 사진 촬영 (한 장만)
      const photo = await openCamera({ maxWidth: 360, base64: true })

      console.log('촬영된 사진:', photo)

      if (photo && photo.dataUri) {
        console.log('사진 정보:', photo)
        console.log('dataUri 존재 여부:', !!photo.dataUri)

        // dataUri 정규화 (data: 접두사 확인)
        const normalizedDataUri = photo.dataUri?.startsWith('data:')
          ? photo.dataUri
          : `data:image/jpeg;base64,${photo.dataUri}`

        setSelectedPhoto({
          id: photo.id || Date.now().toString(),
          previewUri: normalizedDataUri,
          dataUri: photo.dataUri
        })
        console.log('사진 설정 완료:', normalizedDataUri.substring(0, 50))
      }
    } catch (error) {
      console.error('카메라 촬영 실패:', error)
      alert('사진을 촬영하는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (selectedPhoto) {
      onNext({ photo: selectedPhoto })
    }
  }

  const handleSkip = () => {
    onNext({ photo: null })
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0', marginBottom: '120px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 8px 0' }}>
          얼굴 사진을 선택해 주세요
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7684', margin: '0 0 24px 0' }}>사진을 올리면 본인 얼굴을 반영해서 만들어 드려요</p>

        {selectedPhoto ? (
          <div style={{ marginBottom: '24px' }}>
            <img
              src={selectedPhoto.previewUri}
              alt="선택된 사진"
              style={{
                width: '100%',
                borderRadius: '12px',
                maxHeight: '400px',
                objectFit: 'cover'
              }}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 'normal',
                color: '#8B95A1',
                background: '#F2F4F6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              다시 선택하기
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              console.log('[PhotoUpload] 사진 선택 버튼 클릭')
              setIsMenuOpen(true)
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '60px 20px',
              fontSize: '16px',
              fontWeight: 'normal',
              color: '#8B95A1',
              background: '#F2F4F6',
              border: '2px dashed #E5E8EB',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'center'
            }}
          >
            {isLoading ? '사진을 불러오는 중...' : '사진 선택하기'}
          </button>
        )}
      </div>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={onBack}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          이전
        </button>
        {selectedPhoto ? (
          <button
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            다음
          </button>
        ) : (
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#8B95A1',
              background: '#fff',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            건너뛰기
          </button>
        )}
      </div>

      {/* 사진 선택 메뉴 모달 */}
      {isMenuOpen && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000
            }}
            onClick={() => setIsMenuOpen(false)}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: '#fff',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '28px 20px calc(28px + env(safe-area-inset-bottom))',
              zIndex: 2001
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#191F28', margin: '0 0 20px 0', textAlign: 'center' }}>
              사진 선택
            </h3>

            <button
              onClick={() => {
                console.log('[PhotoUpload] 카메라 버튼 클릭')
                handleCameraSelect()
              }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#191F28',
                background: '#fff',
                border: '1px solid #E5E8EB',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>📷</span>
              사진 촬영
            </button>

            <button
              onClick={() => {
                console.log('[PhotoUpload] 앨범 버튼 클릭')
                handleAlbumSelect()
              }}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#191F28',
                background: '#fff',
                border: '1px solid #E5E8EB',
                borderRadius: '12px',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '24px' }}>🖼️</span>
              앨범에서 선택
            </button>

            <button
              onClick={() => setIsMenuOpen(false)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#191F28',
                background: '#F2F4F6',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </>
      )}
    </>
  )
}
