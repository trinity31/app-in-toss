import { useState, useEffect, useRef } from 'react'
import { Menu } from '@toss/tds-mobile'

export default function BirthdateInput({ name, onNext, onBack, initialBirthdate = {} }) {
  const [year, setYear] = useState(initialBirthdate?.year || '')
  const [month, setMonth] = useState(initialBirthdate?.month || '')
  const [day, setDay] = useState(initialBirthdate?.day || '')
  const [period, setPeriod] = useState('')
  const [hour12, setHour12] = useState('')
  const [minuteRange, setMinuteRange] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [periodMenuOpen, setPeriodMenuOpen] = useState(false)
  const [hourMenuOpen, setHourMenuOpen] = useState(false)
  const [minuteMenuOpen, setMinuteMenuOpen] = useState(false)

  const yearRef = useRef(null)
  const monthRef = useRef(null)
  const dayRef = useRef(null)

  const isValid = year && month && day

  useEffect(() => {
    if (initialBirthdate?.year) setYear(initialBirthdate.year)
    if (initialBirthdate?.month) setMonth(initialBirthdate.month)
    if (initialBirthdate?.day) setDay(initialBirthdate.day)

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
          hour: hour24,
          minute: minute
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
        <h1 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '0 0 24px 0' }}>
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
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E8EB'
              }}
            />
            <span style={{ color: '#8B95A1', fontSize: '24px' }}>.</span>
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
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E8EB'
              }}
            />
            <span style={{ color: '#8B95A1', fontSize: '24px' }}>.</span>
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
                border: '1px solid #E5E8EB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                textAlign: 'center'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-primary)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E5E8EB'
              }}
            />
          </div>
        </div>

        <h2 style={{ fontSize: '22px', lineHeight: '1.4', fontWeight: 'bold', color: '#191F28', margin: '40px 0 8px 0' }}>
          태어난 시간을 선택해 주세요
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7684', margin: '0 0 16px 0' }}>모르면 비워두세요</p>

        <div style={{ margin: '0 -20px' }}>
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', gap: '1px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <Menu.Trigger
              open={periodMenuOpen}
              onOpen={() => setPeriodMenuOpen(true)}
              onClose={() => setPeriodMenuOpen(false)}
              placement="bottom-start"
              dropdown={
                <Menu.Dropdown header={<Menu.Header>시간대</Menu.Header>}>
                  <Menu.DropdownCheckItem
                    checked={period === 'AM'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPeriod('AM')
                        setPeriodMenuOpen(false)
                      }
                    }}
                  >
                    오전
                  </Menu.DropdownCheckItem>
                  <Menu.DropdownCheckItem
                    checked={period === 'PM'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setPeriod('PM')
                        setPeriodMenuOpen(false)
                      }
                    }}
                  >
                    오후
                  </Menu.DropdownCheckItem>
                </Menu.Dropdown>
              }
            >
              <div
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '8px',
                  color: period ? '#191F28' : '#8B95A1',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {period === 'AM' ? '오전' : period === 'PM' ? '오후' : '오전/오후'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
                </svg>
              </div>
            </Menu.Trigger>
          </div>

          <div style={{ flex: 1 }}>
            <Menu.Trigger
              open={hourMenuOpen}
              onOpen={() => setHourMenuOpen(true)}
              onClose={() => setHourMenuOpen(false)}
              placement="bottom-start"
              dropdown={
                <Menu.Dropdown
                  header={<Menu.Header>시간 선택</Menu.Header>}
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                    <Menu.DropdownCheckItem
                      key={h}
                      checked={hour12 === String(h)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setHour12(String(h))
                          setHourMenuOpen(false)
                        }
                      }}
                    >
                      {h}시
                    </Menu.DropdownCheckItem>
                  ))}
                </Menu.Dropdown>
              }
            >
              <div
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '8px',
                  color: hour12 ? '#191F28' : '#8B95A1',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {hour12 ? `${hour12}시` : '시'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
                </svg>
              </div>
            </Menu.Trigger>
          </div>

          <div style={{ flex: 1.1 }}>
            <Menu.Trigger
              open={minuteMenuOpen}
              onOpen={() => setMinuteMenuOpen(true)}
              onClose={() => setMinuteMenuOpen(false)}
              placement="bottom-start"
              dropdown={
                <Menu.Dropdown header={<Menu.Header>분 선택</Menu.Header>}>
                  <Menu.DropdownCheckItem
                    checked={minuteRange === '0-29'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMinuteRange('0-29')
                        setMinuteMenuOpen(false)
                      }
                    }}
                  >
                    0~29분
                  </Menu.DropdownCheckItem>
                  <Menu.DropdownCheckItem
                    checked={minuteRange === '30-59'}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setMinuteRange('30-59')
                        setMinuteMenuOpen(false)
                      }
                    }}
                  >
                    30~59분
                  </Menu.DropdownCheckItem>
                </Menu.Dropdown>
              }
            >
              <div
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '18px',
                  border: '1px solid #E5E8EB',
                  borderRadius: '8px',
                  color: minuteRange ? '#191F28' : '#8B95A1',
                  background: '#fff',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                {minuteRange === '0-29' ? '0~29분' : minuteRange === '30-59' ? '30~59분' : '분'}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 11L3 6h10L8 11z" fill="#8B95A1"/>
                </svg>
              </div>
            </Menu.Trigger>
          </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'fixed',
        bottom: `${keyboardHeight}px`,
        left: 0,
        right: 0,
        padding: '16px 20px calc(16px + env(safe-area-inset-bottom))',
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
