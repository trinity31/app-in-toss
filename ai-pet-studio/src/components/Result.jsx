import { useEffect, useRef, useState } from 'react';
import { colors } from '@toss/tds-colors';

// 연하장 타입 확인 헬퍼
// nano-banana-pro 모델 전환으로 모든 연하장 타입이 AI 생성 텍스트 사용
// Canvas 텍스트 오버레이는 더 이상 사용하지 않음
const isNewYearCard = () => {
  return false;
};

// 타입별 텍스트 스타일
const getTextStyle = (petType) => {
  // 한국풍: 검정색
  if (petType.includes('korea')) {
    return {
      fillColor: '#000000', // 검정색
      strokeColor: '#FFFFFF' // 흰색 (가독성을 위한 얇은 테두리)
    };
  }

  // 일본풍: 빨강/금색
  if (petType.includes('japan')) {
    return {
      fillColor: '#DC143C', // 진홍색
      strokeColor: '#FFD700' // 금색
    };
  }

  // 중국풍: 금색/빨강 (더 화려하게)
  if (petType.includes('china')) {
    return {
      fillColor: '#FFD700', // 밝은 금색
      strokeColor: '#C80000' // 진한 빨강
    };
  }

  // 기본값
  return {
    fillColor: '#000000',
    strokeColor: '#FFFFFF'
  };
};

export default function ResultPage({ imageUrl, onClose, onSave, petType }) {
  const canvasRef = useRef(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);

  useEffect(() => {
    if (!imageUrl) return;

    // 연하장이 아니면 원본 이미지 사용
    if (!isNewYearCard(petType)) {
      setProcessedImageUrl(imageUrl);
      return;
    }

    // Canvas에 텍스트 오버레이
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      // Canvas 크기를 이미지 크기로 설정
      canvas.width = img.width;
      canvas.height = img.height;

      // 이미지 그리기
      ctx.drawImage(img, 0, 0);

      // 이미지 비율 계산 (세로/가로)
      const aspectRatio = img.height / img.width;
      const isSquare = aspectRatio >= 0.9 && aspectRatio <= 1.1; // 1:1 비율
      const isVertical = aspectRatio > 1.1; // 세로형

      // 타입별 텍스트 색상 및 폰트 설정
      const textStyle = getTextStyle(petType);

      // 텍스트 스타일 설정 - 더 큰 크기
      const fontSize = Math.floor(img.width * 0.12); // 8% → 12%로 증가

      // 타입별 폰트 설정
      let fontFamily = '"Noto Sans KR", sans-serif';
      let greetingFontFamily = fontFamily; // 인사말 전용 폰트 (일본풍만 다름)

      if (petType.includes('korea') || petType === 'new-year-card') {
        fontFamily = '"Nanum Pen Script", cursive'; // 궁서체
        greetingFontFamily = fontFamily;

        // 폰트 로딩 대기
        try {
          await document.fonts.load(`${fontSize}px "Nanum Pen Script"`);
        } catch (e) {
          console.warn('폰트 로딩 실패:', e);
        }
      } else if (petType.includes('japan')) {
        fontFamily = '"Hi Melody", cursive, "Noto Sans KR"'; // 귀여운 느낌
        greetingFontFamily = '"Hi Melody", cursive, "Noto Sans KR"'; // 인사말도 Hi Melody

        // Hi Melody 폰트 로딩 대기
        try {
          await document.fonts.load(`${fontSize}px "Hi Melody"`);
        } catch (e) {
          console.warn('Hi Melody 폰트 로딩 실패:', e);
        }
      } else if (petType.includes('china')) {
        fontFamily = '"Noto Sans KR", "Arial Black", sans-serif'; // 굵은 산세리프
        greetingFontFamily = fontFamily;
      }

      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textStyle.fillColor;
      ctx.strokeStyle = textStyle.strokeColor;
      ctx.lineWidth = Math.max(3, fontSize / 15); // 테두리도 두껍게
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // 텍스트 위치 설정 - 이미지 비율에 따라 조정
      const x = canvas.width / 2;
      let yearY, greetingY, yearFontSize, baseGreetingFontSize;

      if (isSquare) {
        // 1:1 정사각형 - 적절한 상단 여백과 간격
        yearY = canvas.height * 0.025; // 상단 2.5% (여백 확보)
        greetingY = canvas.height * 0.18; // 상단 16% (간격 조금 더 넓게)
        yearFontSize = Math.floor(img.width * 0.10); // 10% (크기 유지)
        baseGreetingFontSize = Math.floor(img.width * 0.10); // 10% (크기 유지)
      } else if (isVertical) {
        // 세로형 - 넉넉한 간격
        yearY = canvas.height * 0.05;
        greetingY = canvas.height * 0.16;
        yearFontSize = Math.floor(img.width * 0.10);
        baseGreetingFontSize = Math.floor(img.width * 0.10);
      } else {
        // 가로형 - 기본값
        yearY = canvas.height * 0.04;
        greetingY = canvas.height * 0.12;
        yearFontSize = Math.floor(img.width * 0.09);
        baseGreetingFontSize = Math.floor(img.width * 0.095);
      }

      // 2026 텍스트 그리기 (Noto Sans KR, 붉은색)
      if (petType.includes('korea') || petType === 'new-year-card') {
        // 한국풍은 2026을 Noto Sans KR + 붉은색으로
        ctx.font = `900 ${yearFontSize}px "Noto Sans KR", sans-serif`; // 900 weight로 더 진하게
        ctx.fillStyle = '#D32F2F'; // 더 부드러운 붉은색
        ctx.strokeStyle = '#FFFFFF'; // 흰색 테두리
        ctx.lineWidth = Math.max(2, yearFontSize / 20); // 얇은 테두리

        // 2026용 부드러운 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else {
        ctx.font = `bold ${yearFontSize}px ${fontFamily}`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }
      ctx.strokeText('2026', x, yearY);
      ctx.fillText('2026', x, yearY);

      // 새해 복 많이 받으세요 텍스트 그리기
      // 한국풍과 중국풍은 폰트 크기 조정
      let greetingFontSize = fontSize;
      if (petType.includes('korea') || petType === 'new-year-card') {
        greetingFontSize = baseGreetingFontSize; // 비율에 따라 계산된 크기 사용

        // 궁서체용 설정
        ctx.font = `bold ${greetingFontSize}px ${greetingFontFamily}`;
        ctx.fillStyle = textStyle.fillColor; // 검정색
        ctx.strokeStyle = textStyle.strokeColor; // 흰색
        ctx.lineWidth = Math.max(2, greetingFontSize / 20); // 얇은 테두리

        // 궁서체용 부드러운 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      } else if (petType.includes('china')) {
        greetingFontSize = Math.floor(img.width * 0.108); // 중국풍: 10.8%
        ctx.font = `bold ${greetingFontSize}px ${greetingFontFamily}`;
        ctx.fillStyle = textStyle.fillColor;
        ctx.strokeStyle = textStyle.strokeColor;
        ctx.lineWidth = Math.max(3, fontSize / 15);
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      } else {
        ctx.font = `bold ${greetingFontSize}px ${greetingFontFamily}`;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }
      ctx.strokeText('새해 복 많이 받으세요', x, greetingY);
      ctx.fillText('새해 복 많이 받으세요', x, greetingY);

      // Canvas를 Blob으로 변환
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
      }, 'image/png');
    };

    img.onerror = () => {
      console.error('이미지 로드 실패');
      setProcessedImageUrl(imageUrl);
    };

    img.src = imageUrl;
  }, [imageUrl, petType]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (processedImageUrl && processedImageUrl !== imageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
    };
  }, [processedImageUrl, imageUrl]);

  return (
    <div style={{
      padding: '20px',
      maxWidth: '500px',
      margin: '0 auto',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.white,
      boxSizing: 'border-box'
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {processedImageUrl ? (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src={processedImageUrl}
                alt="생성된 프로필 사진"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          ) : (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              aspectRatio: '2/3',
              borderRadius: '12px',
              backgroundColor: colors.grey100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.grey500
            }}>
              로딩 중...
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        }}>
        <button
          onClick={onClose}
          style={{
            padding: '16px',
            backgroundColor: colors.grey100,
            color: colors.grey900,
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          닫기
        </button>
        <button
          onClick={onSave}
          style={{
            padding: '16px',
            backgroundColor: '#FF8C42',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          공유하기
        </button>
      </div>
      </div>
    </div>
  );
}
