import { useState, useEffect } from 'react'
import { ListHeader, StepperRow } from '@toss/tds-mobile'
import { adaptive } from '@toss/tds-colors'
import animalFortune from '../assets/images/animal-fortune.png'
import basicFortune from '../assets/images/basic-fortune.png'
import foodFortune from '../assets/images/food-fortune.png'
import hobbyFortune from '../assets/images/hobby-fortune.png'
import jobFortune from '../assets/images/job-fortune.png'
import lookbookFortune from '../assets/images/lookbook-fortune.png'
import natureFortune from '../assets/images/nature-fortune.png'
import travelFortune from '../assets/images/travel-fortune.png'
import travelLookbookFortune from '../assets/images/travel-lookbook-fortune.png'

const images = [
  animalFortune,
  basicFortune,
  foodFortune,
  hobbyFortune,
  jobFortune,
  lookbookFortune,
  natureFortune,
  travelFortune,
  travelLookbookFortune,
]

export default function Intro({ onNext }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 8px 0' }}>
          AI 로 만드는 사주 이미지
        </h1>
        <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#6B7684', margin: 0 }}>
          나만의 특별한 사주 이미지와 개운 아이템을 찾아보세요
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '16px' }}>
        <button
          onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="이전"
        >
          <svg width="16" height="48" viewBox="0 0 16 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L4 24L12 42" stroke="#B0B8C1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <img
          src={images[currentIndex]}
          alt=""
          style={{ width: '240px', height: '240px', objectFit: 'cover', borderRadius: '16px', transition: 'opacity 0.5s ease-in-out' }}
        />
        <button
          onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          aria-label="다음"
        >
          <svg width="16" height="48" viewBox="0 0 16 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6L12 24L4 42" stroke="#B0B8C1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div style={{ height: '24px' }} />

      <ListHeader
        title={
          <ListHeader.TitleParagraph
            color={adaptive.grey800}
            fontWeight="bold"
            typography="t5"
          >
            이렇게 사용해요
          </ListHeader.TitleParagraph>
        }
        descriptionPosition="bottom"
      />

      <StepperRow
        left={<StepperRow.NumberIcon number={1} />}
        center={
          <StepperRow.Texts
            type="A"
            title="생년월일과 태어난 시간을 입력하고"
            description=""
          />
        }
      />
      <StepperRow
        left={<StepperRow.NumberIcon number={2} />}
        center={
          <StepperRow.Texts
            type="A"
            title="원하는 풀이 타입 선택 하면"
            description=""
          />
        }
      />
      <StepperRow
        left={<StepperRow.NumberIcon number={3} />}
        center={
          <StepperRow.Texts
            type="A"
            title="나만의 멋진 사주 이미지 완성!"
            description=""
          />
        }
        hideLine={true}
      />

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px', background: '#fff' }}>
        <button
          onClick={onNext}
          style={{
            width: '100%',
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
      </div>
    </>
  );
}
