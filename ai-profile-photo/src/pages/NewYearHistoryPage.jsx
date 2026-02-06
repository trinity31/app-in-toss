import { useState, useEffect } from 'react'
import { saveBase64Data } from '@apps-in-toss/web-framework'
import { colors } from '@toss/tds-colors'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../config/api'
import { usePendingOrderStorage } from '../hooks/usePendingOrderStorage'

export default function NewYearHistoryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const { pendingOrderData } = usePendingOrderStorage()

  useEffect(() => {
    async function fetchImages() {
      try {
        const userKey = localStorage.getItem('newyear_user_key')
        if (!userKey) {
          setLoading(false)
          return
        }
        const res = await fetch(`${API_ENDPOINTS.LIST_IMAGES}?userId=${encodeURIComponent(userKey)}`)
        const data = await res.json()

        if (data.success) {
          setImages(data.images || [])
        } else {
          setError('이미지 목록을 불러오지 못했습니다.')
        }
      } catch (err) {
        console.error('[NewYearHistoryPage] 이미지 목록 조회 실패:', err)
        setError('이미지 목록을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const handleSave = async (imageUrl) => {
    try {
      if (typeof saveBase64Data !== 'function') {
        alert('이미지 저장 기능을 사용할 수 없습니다.')
        return
      }

      const res = await fetch(imageUrl)
      const blob = await res.blob()
      const reader = new FileReader()
      const base64 = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      await saveBase64Data({
        data: base64,
        fileName: `newyear_${Date.now()}.png`,
        mimeType: 'image/png'
      })
    } catch (err) {
      console.error('이미지 저장 오류:', err)
      if (err.message && !err.message.toLowerCase().includes('cancel')) {
        alert(`이미지 저장 중 오류가 발생했습니다: ${err.message}`)
      }
    }
  }

  const handleRestore = () => {
    navigate('/newyear', { state: { restore: true } })
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setIsDeleting(true)
    try {
      const userKey = localStorage.getItem('newyear_user_key')
      const res = await fetch(
        `${API_ENDPOINTS.DELETE_IMAGE}?userId=${encodeURIComponent(userKey)}&filePath=${encodeURIComponent(deleteTarget.id)}`,
        { method: 'DELETE' }
      )
      const data = await res.json()

      if (data.success) {
        setImages(prev => prev.filter(img => img.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        alert('이미지 삭제에 실패했습니다.')
      }
    } catch (err) {
      console.error('[NewYearHistoryPage] 이미지 삭제 실패:', err)
      alert('이미지 삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  // 헤더 컴포넌트
  const Header = () => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
      <button
        onClick={() => navigate('/newyear')}
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          color: colors.grey700,
          background: 'transparent',
          border: `1px solid ${colors.grey300}`,
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        돌아가기
      </button>
      <h2 style={{
        flex: 1,
        fontSize: '18px',
        fontWeight: '700',
        color: colors.grey900,
        textAlign: 'center',
        margin: 0,
        paddingRight: '72px',
      }}>
        이전 결과
      </h2>
    </div>
  )

  if (loading) {
    return (
      <div style={{
        width: '100%',
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
      }}>
        <p style={{ fontSize: '16px', color: colors.grey500 }}>불러오는 중...</p>
      </div>
    )
  }

  const hasPendingOrder = !!pendingOrderData
  const hasImages = images.length > 0

  if (!hasImages && !hasPendingOrder) {
    return (
      <div style={{
        width: '100%',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: colors.white,
        boxSizing: 'border-box',
      }}>
        <Header />
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: colors.grey50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            fontSize: '36px',
          }}>
            <span>&#127912;</span>
          </div>
          <p style={{
            fontSize: '18px',
            fontWeight: '600',
            color: colors.grey900,
            margin: '0 0 8px 0',
          }}>
            {error || '아직 만든 연하장이 없어요'}
          </p>
          <p style={{
            fontSize: '14px',
            color: colors.grey500,
            margin: '0 0 32px 0',
            lineHeight: '1.5',
          }}>
            사진을 올리고 나만의 연하장을 만들어 보세요
          </p>
          <button
            onClick={() => navigate('/newyear')}
            style={{
              padding: '14px 32px',
              backgroundColor: colors.red500,
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            연하장 만들러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: colors.white,
      boxSizing: 'border-box',
    }}>
      <Header />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 미완료 주문 (실패한 생성) 카드 */}
        {hasPendingOrder && (
          <div style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            backgroundColor: colors.orange50,
            border: `1px solid ${colors.orange200}`,
          }}>
            <div style={{
              height: '200px',
              backgroundColor: colors.grey100,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}>
              <span style={{ fontSize: '48px', opacity: 0.5 }}>&#127912;</span>
              <p style={{ fontSize: '14px', color: colors.grey500, margin: 0 }}>
                이미지 생성이 완료되지 않았어요
              </p>
            </div>
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '13px', color: colors.orange600, margin: 0, fontWeight: '600' }}>
                미완성 연하장
              </p>
              <button
                onClick={handleRestore}
                style={{
                  padding: '8px 16px',
                  backgroundColor: colors.orange500,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                재생성
              </button>
            </div>
          </div>
        )}

        {/* 성공한 이미지 목록 */}
        {images.map((image) => (
          <div key={image.id} style={{
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            backgroundColor: colors.grey50,
          }}>
            <img
              src={image.url}
              alt="생성된 연하장"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <p style={{ fontSize: '13px', color: colors.grey500, margin: 0 }}>
                {new Date(image.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric', month: 'long', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setDeleteTarget(image)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: colors.grey100,
                    color: colors.grey600,
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  삭제
                </button>
                <button
                  onClick={() => handleSave(image.url)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#db5c7f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: colors.white,
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: colors.grey900,
              margin: '0 0 8px 0',
            }}>
              연하장을 삭제할까요?
            </p>
            <p style={{
              fontSize: '14px',
              color: colors.grey500,
              margin: '0 0 24px 0',
            }}>
              삭제된 이미지는 복구할 수 없어요
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: colors.grey100,
                  color: colors.grey700,
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: colors.red500,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                {isDeleting ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
