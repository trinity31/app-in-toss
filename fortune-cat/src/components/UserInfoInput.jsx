import { useState, useEffect, useRef } from 'react'

export default function UserInfoInput({ onNext, onBack, initialUserInfo = {} }) {
  const [name, setName] = useState(initialUserInfo?.name || '')
  const [year, setYear] = useState(initialUserInfo?.birthdate?.year || '')
  const [month, setMonth] = useState(initialUserInfo?.birthdate?.month || '')
  const [day, setDay] = useState(initialUserInfo?.birthdate?.day || '')
  const [birthdayType, setBirthdayType] = useState(initialUserInfo?.birthdate?.birthdayType || 'solar')
  const [period, setPeriod] = useState('')
  const [hour12, setHour12] = useState('')
  const [minuteRange, setMinuteRange] = useState('')
  const [selectedGender, setSelectedGender] = useState(initialUserInfo?.gender || null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)

  const isValid = name.trim() && year && month && day && selectedGender

  useEffect(() => {
    if (initialUserInfo?.name) setName(initialUserInfo.name)
    if (initialUserInfo?.birthdate?.year) setYear(initialUserInfo.birthdate.year)
    if (initialUserInfo?.birthdate?.month) setMonth(initialUserInfo.birthdate.month)
    if (initialUserInfo?.birthdate?.day) setDay(initialUserInfo.birthdate.day)
    if (initialUserInfo?.birthdate?.birthdayType) setBirthdayType(initialUserInfo.birthdate.birthdayType)
    if (initialUserInfo?.gender) setSelectedGender(initialUserInfo.gender)

    if (initialUserInfo?.birthdate?.hour !== undefined && initialUserInfo?.birthdate?.hour !== null && initialUserInfo?.birthdate?.hour !== '') {
      const hour24 = parseInt(initialUserInfo.birthdate.hour)
      if (hour24 === 0) {
        setPeriod('AM')
        setHour12('12')
      } else if (hour24 < 12) {
        setPeriod('AM')
        setHour12(String(hour24))
      } else if (hour24 === 12) {
        setPeriod('PM')
        setHour12('12')
      } else {
        setPeriod('PM')
        setHour12(String(hour24 - 12))
      }
    }

    if (initialUserInfo?.birthdate?.minute !== undefined && initialUserInfo?.birthdate?.minute !== null && initialUserInfo?.birthdate?.minute !== '') {
      const min = parseInt(initialUserInfo.birthdate.minute)
      if (min < 30) {
        setMinuteRange('0-29')
      } else {
        setMinuteRange('30-59')
      }
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const offset = windowHeight - viewportHeight
        setKeyboardHeight(offset)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  const handleSubmit = () => {
    if (!isValid) return

    let hour24 = null
    let minute = null

    if (period && hour12) {
      const h = parseInt(hour12)
      if (period === 'AM') {
        hour24 = h === 12 ? '00' : String(h).padStart(2, '0')
      } else {
        hour24 = h === 12 ? '12' : String(h + 12)
      }
    }

    if (minuteRange === '0-29') {
      minute = '15'
    } else if (minuteRange === '30-59') {
      minute = '45'
    }

    onNext({
      name: name.trim(),
      birthdate: {
        year,
        month,
        day,
        birthdayType,
        hour: hour24,
        minute: minute,
        period: period ? period.toLowerCase() : 'unknown',
        hour12: hour12 || null,
        minuteRange: minuteRange || null
      },
      gender: selectedGender
    })
  }

  const handleYearChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setYear(value.slice(0, 4))
    if (value.length === 4) {
      monthRef.current?.focus()
    }
  }

  const handleMonthChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setMonth(value.slice(0, 2))
    if (value.length === 2) {
      dayRef.current?.focus()
    }
  }

  const handleDayChange = (e) => {
    const value = e.target.value.replace(/\D/g, '')
    setDay(value.slice(0, 2))
  }

  return (
    <>
      <div style={{ padding: '20px 20px 140px' }}>
        {/* 이름 입력 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          이름을 입력해주세요
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 또는 닉네임"
          style={{
            width: '100%',
            padding: '16px 0',
            fontSize: '20px',
            border: 'none',
            borderBottom: '2px solid #E5E8EB',
            outline: 'none',
            color: '#191F28',
            boxSizing: 'border-box'
          }}
        />

        {/* 생년월일 입력 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '32px 0 12px 0' }}>
          생년월일을 입력해 주세요
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <input
            ref={yearRef}
            type="text"
            inputMode="numeric"
            placeholder="1995"
            value={year}
            onChange={handleYearChange}
            style={{
              width: '40%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E8EB' }}
          />
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>.</span>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="09"
            value={month}
            onChange={handleMonthChange}
            style={{
              width: '25%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E8EB' }}
          />
          <span style={{ color: '#8B95A1', fontSize: '20px' }}>.</span>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            placeholder="12"
            value={day}
            onChange={handleDayChange}
            style={{
              width: '25%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E8EB' }}
          />
        </div>

        {/* 양력/음력 선택 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={() => setBirthdayType('solar')}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: birthdayType === 'solar' ? 'bold' : 'normal',
              color: birthdayType === 'solar' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: birthdayType === 'solar' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${birthdayType === 'solar' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            양력
          </button>
          <button
            onClick={() => setBirthdayType('lunar')}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: birthdayType === 'lunar' ? 'bold' : 'normal',
              color: birthdayType === 'lunar' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: birthdayType === 'lunar' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${birthdayType === 'lunar' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            음력
          </button>
        </div>

        {/* 태어난 시간 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 8px 0' }}>
          태어난 시간을 선택해 주세요
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7684', margin: '0 0 12px 0' }}>모르면 비워두세요</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ flex: '1 1 0' }}>
            <button
              onClick={() => setActiveMenu('period')}
              style={{
                width: '100%',
                padding: '16px 12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                color: period ? '#191F28' : '#8B95A1',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                minHeight: '52px',
                boxSizing: 'border-box'
              }}
            >
              {period === 'AM' ? '오전' : period === 'PM' ? '오후' : '시간대'}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
              </svg>
            </button>
          </div>
          <div style={{ flex: '1 1 0' }}>
            <button
              onClick={() => setActiveMenu('hour')}
              style={{
                width: '100%',
                padding: '16px 12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                color: hour12 ? '#191F28' : '#8B95A1',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                minHeight: '52px',
                boxSizing: 'border-box'
              }}
            >
              {hour12 ? `${hour12}시` : '시'}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
              </svg>
            </button>
          </div>
          <div style={{ flex: '1 1 0' }}>
            <button
              onClick={() => setActiveMenu('minute')}
              style={{
                width: '100%',
                padding: '16px 12px',
                fontSize: '16px',
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                color: minuteRange ? '#191F28' : '#8B95A1',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                minHeight: '52px',
                boxSizing: 'border-box'
              }}
            >
              {minuteRange === '0-29' ? '0~29분' : minuteRange === '30-59' ? '30~59분' : '분'}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 성별 선택 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 12px 0' }}>
          성별을 선택해 주세요
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setSelectedGender('female')}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: selectedGender === 'female' ? 'bold' : 'normal',
              color: selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'female' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'female' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            여성
          </button>
          <button
            onClick={() => setSelectedGender('male')}
            style={{
              flex: 1,
              padding: '16px',
              fontSize: '16px',
              fontWeight: selectedGender === 'male' ? 'bold' : 'normal',
              color: selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-700)',
              background: selectedGender === 'male' ? 'var(--color-primary-light)' : 'var(--color-white)',
              border: `2px solid ${selectedGender === 'male' ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            남성
          </button>
        </div>
      </div>

      {/* 커스텀 드롭다운 모달 */}
      {activeMenu && (
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
            onClick={() => setActiveMenu(null)}
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
              {activeMenu === 'period' && '시간대 선택'}
              {activeMenu === 'hour' && '시간 선택'}
              {activeMenu === 'minute' && '분 선택'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
              {activeMenu === 'period' && (
                <>
                  <button
                    onClick={() => { setPeriod('AM'); setActiveMenu(null) }}
                    style={modalButtonStyle}
                  >
                    오전
                  </button>
                  <button
                    onClick={() => { setPeriod('PM'); setActiveMenu(null) }}
                    style={modalButtonStyle}
                  >
                    오후
                  </button>
                </>
              )}

              {activeMenu === 'hour' &&
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <button
                    key={h}
                    onClick={() => { setHour12(String(h)); setActiveMenu(null) }}
                    style={modalButtonStyle}
                  >
                    {h}시
                  </button>
                ))}

              {activeMenu === 'minute' && (
                <>
                  <button
                    onClick={() => { setMinuteRange('0-29'); setActiveMenu(null) }}
                    style={modalButtonStyle}
                  >
                    0~29분
                  </button>
                  <button
                    onClick={() => { setMinuteRange('30-59'); setActiveMenu(null) }}
                    style={modalButtonStyle}
                  >
                    30~59분
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setActiveMenu(null)}
              style={{
                width: '100%',
                marginTop: '20px',
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

      {/* 하단 버튼 */}
      <div style={{
        position: 'fixed',
        bottom: `${keyboardHeight}px`,
        left: 0,
        right: 0,
        padding: '16px 20px calc(24px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'bottom 0.2s ease-out'
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
          disabled={!isValid}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            background: isValid ? 'var(--color-primary)' : 'var(--color-disabled)',
            border: 'none',
            borderRadius: '8px',
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          다음
        </button>
      </div>
    </>
  )
}

const modalButtonStyle = {
  width: '100%',
  padding: '16px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#191F28',
  background: '#fff',
  border: '1px solid #E5E8EB',
  borderRadius: '12px',
  cursor: 'pointer',
  textAlign: 'center'
}
