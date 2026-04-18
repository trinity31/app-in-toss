import { useState, useEffect, useRef } from 'react'

export default function UserInfoInput({ onNext, onBack, initialUserInfo = {}, isCompatibility = false }) {
  const [name, setName] = useState(initialUserInfo?.name || '')
  const [year, setYear] = useState(initialUserInfo?.birthdate?.year || '')
  const [month, setMonth] = useState(initialUserInfo?.birthdate?.month || '')
  const [day, setDay] = useState(initialUserInfo?.birthdate?.day || '')
  const [birthdayType, setBirthdayType] = useState(initialUserInfo?.birthdate?.birthdayType || 'solar')
  const [isLeapMonth, setIsLeapMonth] = useState(Boolean(initialUserInfo?.birthdate?.isLeapMonth))
  const [period, setPeriod] = useState('')
  const [hour12, setHour12] = useState('')
  const [minuteRange, setMinuteRange] = useState('')
  const [selectedGender, setSelectedGender] = useState(initialUserInfo?.gender || null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [inputStep, setInputStep] = useState(1)
  const [myInfo, setMyInfo] = useState(null)
  const [myInfoFields, setMyInfoFields] = useState(null)

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
    if (initialUserInfo?.birthdate?.isLeapMonth !== undefined) setIsLeapMonth(Boolean(initialUserInfo.birthdate.isLeapMonth))
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

    const personData = {
      name: name.trim(),
      birthdate: {
        year,
        month,
        day,
        birthdayType,
        isLeapMonth: birthdayType === 'lunar' ? isLeapMonth : false,
        hour: hour24,
        minute: minute,
        period: period ? period.toLowerCase() : 'unknown',
        hour12: hour12 || null,
        minuteRange: minuteRange || null
      },
      gender: selectedGender
    }

    if (isCompatibility && inputStep === 1) {
      setMyInfo(personData)
      setMyInfoFields({ name, year, month, day, birthdayType, period, hour12, minuteRange, selectedGender })
      setName('')
      setYear('')
      setMonth('')
      setDay('')
      setBirthdayType('solar')
      setPeriod('')
      setHour12('')
      setMinuteRange('')
      setSelectedGender(null)
      setInputStep(2)
      window.scrollTo(0, 0)
      return
    }

    if (isCompatibility && inputStep === 2) {
      onNext({
        ...myInfo,
        partnerName: personData.name,
        partnerBirthdate: personData.birthdate,
        partnerGender: personData.gender
      })
      return
    }

    onNext(personData)
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
        {isCompatibility && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            padding: '12px 16px',
            background: inputStep === 1 ? '#EFF6FF' : '#FFF1F2',
            borderRadius: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>{inputStep === 1 ? '👤' : '💕'}</span>
            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-gray-700)' }}>
              {inputStep === 1 ? '나의 정보 입력' : '상대방 정보 입력'}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-gray-500)', marginLeft: 'auto' }}>
              {inputStep} / 2
            </span>
          </div>
        )}

        {/* 이름 입력 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 12px 0' }}>
          이름을 입력해주세요
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 또는 닉네임"
          aria-label="이름"
          style={{
            width: '100%',
            padding: '16px 0',
            fontSize: '20px',
            border: 'none',
            borderBottom: '2px solid var(--color-gray-200)',
            outline: 'none',
            color: 'var(--color-gray-700)',
            boxSizing: 'border-box'
          }}
        />

        {/* 생년월일 입력 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '32px 0 12px 0' }}>
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
            aria-label="출생 연도"
            style={{
              width: '40%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-gray-200)' }}
          />
          <span style={{ color: 'var(--color-gray-400)', fontSize: '20px' }}>.</span>
          <input
            ref={monthRef}
            type="text"
            inputMode="numeric"
            placeholder="09"
            value={month}
            onChange={handleMonthChange}
            aria-label="출생 월"
            style={{
              width: '25%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-gray-200)' }}
          />
          <span style={{ color: 'var(--color-gray-400)', fontSize: '20px' }}>.</span>
          <input
            ref={dayRef}
            type="text"
            inputMode="numeric"
            placeholder="12"
            value={day}
            onChange={handleDayChange}
            aria-label="출생 일"
            style={{
              width: '25%',
              padding: '14px',
              fontSize: '20px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: '8px',
              outline: 'none',
              textAlign: 'center',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-gray-200)' }}
          />
        </div>

        {/* 양력/음력 선택 */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <button
            onClick={() => setBirthdayType('solar')}
            aria-pressed={birthdayType === 'solar'}
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
            aria-pressed={birthdayType === 'lunar'}
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

        {/* 평달/윤달 선택 (음력일 때만) */}
        {birthdayType === 'lunar' && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', marginTop: '-20px' }}>
            <button
              onClick={() => setIsLeapMonth(false)}
              aria-pressed={!isLeapMonth}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '15px',
                fontWeight: !isLeapMonth ? 'bold' : 'normal',
                color: !isLeapMonth ? 'var(--color-primary)' : 'var(--color-gray-700)',
                background: !isLeapMonth ? 'var(--color-primary-light)' : 'var(--color-white)',
                border: `2px solid ${!isLeapMonth ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              평달
            </button>
            <button
              onClick={() => setIsLeapMonth(true)}
              aria-pressed={isLeapMonth}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '15px',
                fontWeight: isLeapMonth ? 'bold' : 'normal',
                color: isLeapMonth ? 'var(--color-primary)' : 'var(--color-gray-700)',
                background: isLeapMonth ? 'var(--color-primary-light)' : 'var(--color-white)',
                border: `2px solid ${isLeapMonth ? 'var(--color-primary)' : 'var(--color-gray-200)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              윤달
            </button>
          </div>
        )}

        {/* 태어난 시간 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 8px 0' }}>
          태어난 시간을 선택해 주세요
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', margin: '0 0 12px 0' }}>모르면 비워두세요</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ flex: '1 1 0' }}>
            <button
              onClick={() => setActiveMenu('period')}
              style={{
                width: '100%',
                padding: '16px 12px',
                fontSize: '16px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                color: period ? 'var(--color-gray-700)' : 'var(--color-gray-400)',
                background: 'var(--color-white)',
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
                <path d="M8 11L3 6h10L8 11z" fill="var(--color-gray-400)"/>
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
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                color: hour12 ? 'var(--color-gray-700)' : 'var(--color-gray-400)',
                background: 'var(--color-white)',
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
                <path d="M8 11L3 6h10L8 11z" fill="var(--color-gray-400)"/>
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
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                color: minuteRange ? 'var(--color-gray-700)' : 'var(--color-gray-400)',
                background: 'var(--color-white)',
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
                <path d="M8 11L3 6h10L8 11z" fill="var(--color-gray-400)"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 성별 선택 */}
        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 12px 0' }}>
          성별을 선택해 주세요
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setSelectedGender('female')}
            aria-pressed={selectedGender === 'female'}
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
            aria-pressed={selectedGender === 'male'}
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
              background: 'var(--color-white)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '28px 20px calc(28px + env(safe-area-inset-bottom))',
              zIndex: 2001
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 20px 0', textAlign: 'center' }}>
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
                color: 'var(--color-gray-700)',
                background: 'var(--color-gray-100)',
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
        background: 'var(--color-white)',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'bottom 0.2s ease-out'
      }}>
        <button
          onClick={() => {
            if (isCompatibility && inputStep === 2) {
              if (myInfoFields) {
                setName(myInfoFields.name)
                setYear(myInfoFields.year)
                setMonth(myInfoFields.month)
                setDay(myInfoFields.day)
                setBirthdayType(myInfoFields.birthdayType)
                setPeriod(myInfoFields.period)
                setHour12(myInfoFields.hour12)
                setMinuteRange(myInfoFields.minuteRange)
                setSelectedGender(myInfoFields.selectedGender)
              }
              setInputStep(1)
              window.scrollTo(0, 0)
            } else {
              onBack()
            }
          }}
          style={{
            flex: 1,
            padding: '16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'var(--color-gray-700)',
            background: 'var(--color-gray-100)',
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
            color: 'var(--color-white)',
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
  color: 'var(--color-gray-700)',
  background: 'var(--color-white)',
  border: '1px solid var(--color-gray-200)',
  borderRadius: '12px',
  cursor: 'pointer',
  textAlign: 'center'
}
