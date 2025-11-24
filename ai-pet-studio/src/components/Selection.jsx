import { useState, useEffect } from 'react';
import { Asset } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { Analytics } from '@apps-in-toss/web-framework';
import { API_ENDPOINTS } from '../config/const';

const Spacing = ({ size }) => <div style={{ height: `${size}px` }} />;

// 스크롤바 스타일을 위한 CSS 추가
const scrollbarStyle = `
  .dropdown-menu::-webkit-scrollbar {
    width: 10px;
    -webkit-appearance: none;
  }
  .dropdown-menu::-webkit-scrollbar-track {
    background: ${colors.grey100};
    border-radius: 5px;
    margin: 4px 0;
  }
  .dropdown-menu::-webkit-scrollbar-thumb {
    background: ${colors.grey400};
    border-radius: 5px;
    border: 2px solid ${colors.grey100};
  }
  .dropdown-menu::-webkit-scrollbar-thumb:hover {
    background: ${colors.grey500};
  }
  .dropdown-menu {
    scrollbar-width: thin;
    scrollbar-color: ${colors.grey400} ${colors.grey100};
  }
`;

// Fallback 반려동물 타입 (API 실패 시 사용)
const FALLBACK_PET_TYPES = [
  {
    id: 'masterpiece',
    title: '명화 속 주인공',
    description: '고전 명화 스타일',
    icon: 'u1F3A8.png' // 🎨
  },
  {
    id: 'halloween',
    title: '할로윈 마녀',
    description: '귀엽고 재미있는 할로윈',
    icon: 'u1F383.png' // 🎃
  },
  {
    id: 'superhero',
    title: '슈퍼히어로',
    description: '멋진 히어로 컨셉',
    icon: 'u1F9B8.png' // 🦸
  },
  {
    id: 'royal',
    title: '왕족/귀족',
    description: '우아하고 고귀한 느낌',
    icon: 'u1F451.png' // 👑
  },
  {
    id: 'cartoon',
    title: '만화 캐릭터',
    description: '귀여운 애니메이션',
    icon: 'u1F3AC.png' // 🎬
  }
];

export default function SelectionPage({ selectedImage, onSelect, onBack }) {
  const [selectedType, setSelectedType] = useState('masterpiece');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [petTypes, setPetTypes] = useState(FALLBACK_PET_TYPES);

  // 반려동물 타입 목록 가져오기 (백그라운드에서 실행)
  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        console.log('반려동물 타입 목록 가져오기 시작...');

        // 10초 타임아웃 설정 (Vercel cold start + 네트워크 지연 고려)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(API_ENDPOINTS.GET_PET_TYPES, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status}`);
        }

        const data = await response.json();
        console.log('반려동물 타입 API 응답:', data);

        if (data.success && data.profileTypes) {
          setPetTypes(data.profileTypes);
          console.log('반려동물 타입 목록 업데이트 완료:', data.profileTypes.length, '개');
        } else {
          console.warn('API 응답이 올바르지 않음, fallback 사용');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('반려동물 타입 API 타임아웃, fallback 사용');
        } else {
          console.error('반려동물 타입 목록 가져오기 실패, fallback 사용:', error);
        }
        // 이미 FALLBACK_PET_TYPES로 초기화되어 있으므로 추가 작업 불필요
      }
    };

    fetchPetTypes();
  }, []);

  // 스크롤바 스타일 추가
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleTypeSelect = (typeId) => {
    // 타입 선택 이벤트 로깅
    Analytics.click({
      button_name: 'pet_type_select',
      pet_type: typeId
    });

    setSelectedType(typeId);
    setIsDropdownOpen(false);
  };

  const handleGenerate = () => {
    onSelect(selectedType);
  };

  // selectedImage를 미리보기용 URL로 변환
  const imagePreviewUrl = selectedImage ? URL.createObjectURL(selectedImage) : null;
  const selectedTypeInfo = petTypes.find(type => type.id === selectedType) || petTypes[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      width: '100%',
      padding: '20px',
      backgroundColor: colors.white,
      paddingBottom: '40px',
      boxSizing: 'border-box',
    }}>
      <Spacing size={8} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: colors.grey900,
          textAlign: 'center',
          margin: 0,
          lineHeight: 1.4,
          letterSpacing: '-0.5px',
        }}>
          어떤 스타일로 생성할까요?
        </h1>

        <Spacing size={12} />

      </div>

      <Spacing size={16} />

      {/* 사진 미리보기 */}
      {imagePreviewUrl && (
        <div style={{
          width: '50%',
          maxWidth: '300px',
          aspectRatio: '3/4',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}>
          <img
            src={imagePreviewUrl}
            alt="선택한 사진"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      <Spacing size={16} />

      {/* 프로필 타입 선택 드롭다운 */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
      }}>
        {/* <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: colors.grey900,
          marginBottom: '8px',
        }}>
          프로필 스타일
        </label> */}

        {/* 드롭다운 버튼 */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: colors.white,
            border: `1px solid ${colors.grey200}`,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
            color: colors.grey900,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.orange50,
              borderRadius: '50%',
            }}>
              <Asset.Image
                frameShape={Asset.frameShape.CleanW24}
                backgroundColor="transparent"
                src={`https://static.toss.im/2d-emojis/png/4x/${selectedTypeInfo.icon}`}
                aria-hidden={true}
                style={{ aspectRatio: '1/1', width: '20px', height: '20px' }}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600 }}>{selectedTypeInfo.title}</div>
              <div style={{ fontSize: '13px', color: colors.grey600, fontWeight: 400 }}>
                {selectedTypeInfo.description}
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '20px',
            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>
            ▼
          </span>
        </button>

        {/* 드롭다운 메뉴 */}
        {isDropdownOpen && (
          <div style={{ position: 'relative' }}>
            <div
              className="dropdown-menu"
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: 0,
                right: 0,
                backgroundColor: colors.white,
                border: `1px solid ${colors.grey200}`,
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'scroll',
                overflowX: 'hidden',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {petTypes.map((type, index) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: selectedType === type.id ? colors.orange50 : colors.white,
                  border: 'none',
                  borderBottom: index < petTypes.length - 1 ? `1px solid ${colors.grey100}` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type.id) {
                    e.currentTarget.style.backgroundColor = colors.grey50;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedType === type.id ? colors.orange50 : colors.white;
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.orange50,
                  borderRadius: '50%',
                  flexShrink: 0,
                }}>
                  <Asset.Image
                    frameShape={Asset.frameShape.CleanW24}
                    backgroundColor="transparent"
                    src={`https://static.toss.im/2d-emojis/png/4x/${type.icon}`}
                    aria-hidden={true}
                    style={{ aspectRatio: '1/1', width: '20px', height: '20px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: colors.grey900,
                    marginBottom: '2px',
                  }}>
                    {type.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 400,
                    color: colors.grey600,
                  }}>
                    {type.description}
                  </div>
                </div>
                {selectedType === type.id && (
                  <span style={{ fontSize: '18px' }}>✓</span>
                )}
              </button>
            ))}
            </div>
          </div>
        )}
      </div>

      <Spacing size={32} />

      {/* 버튼 영역 */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <button
          onClick={handleGenerate}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#FF8C42',
            color: colors.white,
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          광고 보고 반려동물 사진 생성하기
        </button>

        <button
          onClick={onBack}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: colors.grey100,
            color: colors.grey900,
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          다시 선택하기
        </button>
      </div>
    </div>
  );
}
