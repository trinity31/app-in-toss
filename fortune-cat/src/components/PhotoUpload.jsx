import { useState } from 'react'

export default function PhotoUpload({ onNext, onBack }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePhotoSelect = async () => {
    try {
      setIsLoading(true)

      // Apps in Toss 프레임워크의 fetchAlbumPhotos API 호출
      const { fetchAlbumPhotos } = await import('@apps-in-toss/framework')

      // 권한 확인
      const permission = await fetchAlbumPhotos.getPermission()

      if (permission !== 'allowed') {
        const requestedPermission = await fetchAlbumPhotos.openPermissionDialog()
        if (requestedPermission !== 'allowed') {
          alert('앨범 접근 권한이 필요합니다.')
          return
        }
      }

      // 사진 선택
      const photos = await fetchAlbumPhotos({ maxWidth: 360, base64: true })

      if (photos && photos.length > 0) {
        const photo = photos[0]
        setSelectedPhoto({
          id: photo.id,
          previewUri: `data:image/jpeg;base64,${photo.dataUri}`,
          dataUri: photo.dataUri
        })
      }
    } catch (error) {
      console.error('사진 선택 실패:', error)
      alert('사진을 가져오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (selectedPhoto) {
      onNext({ photo: selectedPhoto })
    }
  }

  return (
    <>
      <div style={{ padding: '20px 20px 0', marginBottom: '120px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 24px 0' }}>
          얼굴 사진을 선택해 주세요
        </h1>

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
            onClick={handlePhotoSelect}
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
            {isLoading ? '사진을 불러오는 중...' : '앨범에서 사진 선택하기'}
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
        <button
          onClick={handleSubmit}
          disabled={!selectedPhoto}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: selectedPhoto ? 'var(--color-primary)' : 'var(--color-disabled)',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedPhoto ? 'pointer' : 'not-allowed'
          }}
        >
          다음
        </button>
      </div>
    </>
  )
}
