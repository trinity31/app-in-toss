import { useState } from 'react'

const fortuneTypes = [
  {
    id: 'basic',
    title: '사주로 보는 내 모습',
    description: '내가 이렇게 예쁘다고?',
    image: '/images/basic-fortune.png'
  },
  {
    id: 'animal',
    title: '내 사주의 동물상',
    description: '내 사주를 닮은 동물은?',
    image: '/images/animal-fortune.png'
  },
  {
    id: 'nature',
    title: '내 사주를 닮은 자연',
    description: '내 사주를 자연으로 표현하면?',
    image: '/images/nature-fortune.png'
  },
  {
    id: 'travel',
    title: '나를 살려주는 여행지',
    description: '행운을 가져다 주는 여행지 알아보기',
    image: '/images/travel-fortune.png'
  },
  {
    id: 'lookbook',
    title: '나만의 룩북',
    description: '운을 좋게 해주는 나만의 패션 스타일',
    image: '/images/lookbook-fortune.png'
  },
  {
    id: 'travel-lookbook',
    title: '여행 룩북',
    description: '나만을 위한 여행지와 패션을 한번에!',
    image: '/images/travel-lookbook-fortune.png'
  },
  {
    id: 'food',
    title: '행운의 음식',
    description: '내 운을 향상시켜 주는 음식',
    image: '/images/food-fortune.png'
  },
  {
    id: 'hobby',
    title: '운명의 취미',
    description: '내 운을 향상시켜 주는 취미는?',
    image: '/images/hobby-fortune.png'
  },
  {
    id: 'job',
    title: '꿈의 직업',
    description: '나를 살려주는 직업과 커리어 추천',
    image: '/images/job-fortune.png'
  }
]

export default function FortuneTypeSelect({ onNext, onBack }) {
  const [selectedType, setSelectedType] = useState(null)

  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId)
    setTimeout(() => {
      onNext({ fortuneType: typeId })
    }, 500)
  }

  return (
    <>
      <div style={{ padding: '20px 20px 100px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          원하는 결과를 선택해 주세요
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {fortuneTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              disabled={selectedType !== null}
              style={{
                width: '100%',
                padding: '20px 0',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: '1px solid #F2F4F6',
                background: selectedType === type.id ? 'var(--color-primary-light)' : 'none',
                cursor: selectedType !== null ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: selectedType === type.id ? 'bold' : 'bold',
                  color: selectedType === type.id ? 'var(--color-primary)' : 'var(--color-gray-600)',
                  marginBottom: '4px',
                  transition: 'color 0.2s ease'
                }}>
                  {type.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: selectedType === type.id ? 'var(--color-primary)' : 'var(--color-gray-400)',
                  transition: 'color 0.2s ease'
                }}>
                  {type.description}
                </div>
              </div>
              <img
                src={type.image}
                alt={type.title}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: '#fff' }}>
        <button
          onClick={onBack}
          style={{
            width: '100%',
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
      </div>
    </>
  )
}
