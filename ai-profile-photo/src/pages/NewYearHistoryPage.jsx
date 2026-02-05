import { useState, useEffect } from 'react'
import { saveBase64Data } from '@apps-in-toss/web-framework'
import { colors } from '@toss/tds-colors'
import { useNavigate } from 'react-router-dom'
import { API_ENDPOINTS } from '../config/api'

export default function NewYearHistoryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

  if (loading) {
    return (
      <div style={{
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

  if (error || images.length === 0) {
    return (
      <div style={{
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
      }}>
        <p style={{ fontSize: '16px', color: colors.grey500, marginBottom: '20px' }}>
          {error || '생성된 연하장이 없습니다'}
        </p>
        <button
          onClick={() => navigate('/newyear')}
          style={{
            padding: '14px 28px',
            backgroundColor: colors.red500,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          연하장 만들기
        </button>
      </div>
    )
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      minHeight: '100vh',
      backgroundColor: colors.white,
      boxSizing: 'border-box',
    }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        ))}
      </div>
    </div>
  )
}
