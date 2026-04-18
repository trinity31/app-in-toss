import { useState, useEffect, useRef } from 'react'

export default function BirthdateInput({ name, onNext, onBack, initialBirthdate = {} }) {
  const [year, setYear] = useState(initialBirthdate?.year || '')
  const [month, setMonth] = useState(initialBirthdate?.month || '')
  const [day, setDay] = useState(initialBirthdate?.day || '')
  const [birthdayType, setBirthdayType] = useState(initialBirthdate?.birthdayType || 'solar')
  const [isLeapMonth, setIsLeapMonth] = useState(Boolean(initialBirthdate?.isLeapMonth))
  const [period, setPeriod] = useState('')
  const [hour12, setHour12] = useState('')
  const [minuteRange, setMinuteRange] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [activeMenu, setActiveMenu] = useState(null)

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)

  const isValid = year && month && day

  useEffect(() => {
    if (initialBirthdate?.year) setYear(initialBirthdate.year)
    if (initialBirthdate?.month) setMonth(initialBirthdate.month)
    if (initialBirthdate?.day) setDay(initialBirthdate.day)
    if (initialBirthdate?.birthdayType) setBirthdayType(initialBirthdate.birthdayType)
    if (initialBirthdate?.isLeapMonth !== undefined) setIsLeapMonth(Boolean(initialBirthdate.isLeapMonth))

    // 24시간 형식에서 12시간 형식으로 변환
    if (initialBirthdate?.hour !== undefined && initialBirthdate?.hour !== null && initialBirthdate?.hour !== '') {
      const hour24 = parseInt(initialBirthdate.hour)
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

    // 분 범위 설정
    if (initialBirthdate?.minute !== undefined && initialBirthdate?.minute !== null && initialBirthdate?.minute !== '') {
      const min = parseInt(initialBirthdate.minute)
      if (min < 30) {
        setMinuteRange('0-29')
      } else {
        setMinuteRange('30-59')
      }
    }
  }, [
    initialBirthdate?.year,
    initialBirthdate?.month,
    initialBirthdate?.day,
    initialBirthdate?.hour,
    initialBirthdate?.minute
  ])

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
    if (isValid) {
      let hour24 = null
      let minute = null

      // 12시간 형식을 24시간 형식으로 변환
      if (period && hour12) {
        const h = parseInt(hour12)
        if (period === 'AM') {
          hour24 = h === 12 ? '00' : String(h).padStart(2, '0')
        } else {
          hour24 = h === 12 ? '12' : String(h + 12)
        }
      }

      // 분 범위를 중간값으로 변환
      if (minuteRange === '0-29') {
        minute = '15'
      } else if (minuteRange === '30-59') {
        minute = '45'
      }

      onNext({
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
        }
      })
    }
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
      <div style={{ padding: '20px 20px 0', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '0 0 24px 0' }}>
          생년월일을 입력해 주세요
        </h1>

        <div style={{ marginBottom: '32px' }}>
          {/* <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#4E5968', marginBottom: '8px' }}>
            생년월일
          </label> */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              ref={yearRef}
              type="text"
              inputMode="numeric"
              placeholder="1995"
              value={year}
              onChange={handleYearChange}
              style={{
                width: '40%',
                padding: '16px',
                fontSize: '24px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-gray-200)'
              }}
            />
            <span style={{ color: 'var(--color-gray-400)', fontSize: '24px' }}>.</span>
            <input
              ref={monthRef}
              type="text"
              inputMode="numeric"
              placeholder="09"
              value={month}
              onChange={handleMonthChange}
              style={{
                width: '25%',
                padding: '16px',
                fontSize: '24px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-gray-200)'
              }}
            />
            <span style={{ color: 'var(--color-gray-400)', fontSize: '24px' }}>.</span>
            <input
              ref={dayRef}
              type="text"
              inputMode="numeric"
              placeholder="12"
              value={day}
              onChange={handleDayChange}
              style={{
                width: '25%',
                padding: '16px',
                fontSize: '24px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-gray-200)'
              }}
            />
          </div>
        </div>

        {/* 양력/음력 선택 */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setBirthdayType('solar')}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                color: birthdayType === 'solar' ? '#fff' : 'var(--color-gray-700)',
                background: birthdayType === 'solar' ? 'var(--color-primary)' : '#F7F8FA',
                border: birthdayType === 'solar' ? 'none' : '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              양력
            </button>
            <button
              onClick={() => setBirthdayType('lunar')}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                color: birthdayType === 'lunar' ? '#fff' : 'var(--color-gray-700)',
                background: birthdayType === 'lunar' ? 'var(--color-primary)' : '#F7F8FA',
                border: birthdayType === 'lunar' ? 'none' : '1px solid var(--color-gray-200)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              음력
            </button>
          </div>

          {birthdayType === 'lunar' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setIsLeapMonth(false)}
                aria-pressed={!isLeapMonth}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: !isLeapMonth ? '#fff' : 'var(--color-gray-700)',
                  background: !isLeapMonth ? 'var(--color-primary)' : '#F7F8FA',
                  border: !isLeapMonth ? 'none' : '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                평달
              </button>
              <button
                onClick={() => setIsLeapMonth(true)}
                aria-pressed={isLeapMonth}
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: isLeapMonth ? '#fff' : 'var(--color-gray-700)',
                  background: isLeapMonth ? 'var(--color-primary)' : '#F7F8FA',
                  border: isLeapMonth ? 'none' : '1px solid var(--color-gray-200)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                윤달
              </button>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: 'var(--color-gray-700)', margin: '40px 0 8px 0' }}>
          태어난 시간을 선택해 주세요
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-gray-500)', margin: '0 0 16px 0' }}>모르면 비워두세요</p>

        <div style={{ margin: '0 -20px' }}>
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 0' }}>
            <button
              onClick={() => setActiveMenu('period')}
              style={{
                width: '100%',
                padding: '20px 12px',
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
                minHeight: '56px',
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
                padding: '20px 12px',
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
                minHeight: '56px',
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
                padding: '20px 12px',
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
                minHeight: '56px',
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
          </div>
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
                    onClick={() => {
                      setPeriod('AM')
                      setActiveMenu(null)
                    }}
                    style={{
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
                    }}
                  >
                    오전
                  </button>
                  <button
                    onClick={() => {
                      setPeriod('PM')
                      setActiveMenu(null)
                    }}
                    style={{
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
                    }}
                  >
                    오후
                  </button>
                </>
              )}

              {activeMenu === 'hour' &&
                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                  <button
                    key={h}
                    onClick={() => {
                      setHour12(String(h))
                      setActiveMenu(null)
                    }}
                    style={{
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
                    }}
                  >
                    {h}시
                  </button>
                ))}

              {activeMenu === 'minute' && (
                <>
                  <button
                    onClick={() => {
                      setMinuteRange('0-29')
                      setActiveMenu(null)
                    }}
                    style={{
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
                    }}
                  >
                    0~29분
                  </button>
                  <button
                    onClick={() => {
                      setMinuteRange('30-59')
                      setActiveMenu(null)
                    }}
                    style={{
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
                    }}
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
          onClick={onBack}
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
