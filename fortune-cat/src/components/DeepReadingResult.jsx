import { useState, useCallback } from 'react'

import ReactMarkdown from 'react-markdown'
import * as Sentry from '@sentry/react'
import { Analytics } from '@apps-in-toss/web-framework'

// CommonMark에서 **text** 뒤에 바로 한글이 오면 bold 파싱 실패
// **'문서'**가 → **'문서'** 가 (공백 추가)
const normalizeMarkdown = (text) => {
  if (!text) return ''
  return text
    // ** text** → **text** (여는 ** 뒤 공백 제거)
    .replace(/\*\*\s+(.+?)\*\*/g, '**$1**')
    // **text**가 → **text** 가 (닫는 ** 뒤 비공백 앞에 공백 추가)
    .replace(/\*\*(.+?)\*\*(?=\S)/g, '**$1** ')
}

export default function DeepReadingResult({ userData, onRestart, onBackToTypeSelect }) {
  const { name, birthdate, fortuneResult, fortuneTypeTitle } = userData
  const [messages, setMessages] = useState([
    { role: 'assistant', content: fortuneResult.reading, followUpQuestions: fortuneResult.follow_up_questions }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // callback ref: 로딩 표시가 DOM에 마운트되면 스크롤
  // setTimeout으로 사용자 메시지 버블의 레이아웃 완료를 기다린 후 스크롤
  const loadingIndicatorRef = useCallback((node) => {
    if (node) {
      setTimeout(() => {
        node.scrollIntoView({ behavior: 'smooth' })
      }, 150)
    }
  }, [])

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isSending) return

    const userMessage = messageText.trim()
    setInputMessage('')

    Analytics.click({ button_name: 'deep_reading_chat' })

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsSending(true)

    try {
      const apiKey = import.meta.env.VITE_SAJU_AI_API_KEY
      const baseUrl = import.meta.env.VITE_API_BASE_URL
      const endpoint = `${baseUrl}/deep-reading/chat`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: fortuneResult.thread_id,
          message: userMessage,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`채팅 API 호출 실패: ${response.status} ${errorText}`)
      }

      const result = await response.json()

      setMessages(prev => [...prev, { role: 'assistant', content: result.reading, followUpQuestions: result.follow_up_questions }])

    } catch (error) {
      console.error('채팅 메시지 전송 오류:', error)
      Sentry.captureException(error, {
        extra: {
          threadId: fortuneResult.thread_id,
          userMessage,
        }
      })

      setMessages(prev => [...prev, {
        role: 'error',
        content: '메시지 전송에 실패했습니다. 다시 시도해 주세요.'
      }])
    } finally {
      setIsSending(false)
    }
  }

  const handleSendMessage = () => sendMessage(inputMessage)

  const handleFollowUpClick = (question) => sendMessage(question)

  const handleBackToTypeSelect = () => {
    Analytics.click({ button_name: 'back_to_type_select' })
    onBackToTypeSelect()
  }

  const markdownComponents = {
    h2: ({node, ...props}) => (
      <h2 style={{
        fontSize: '17px',
        fontWeight: 'bold',
        color: 'var(--color-primary)',
        marginTop: '20px',
        marginBottom: '10px',
        lineHeight: '1.4'
      }} {...props} />
    ),
    h3: ({node, ...props}) => (
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#191F28',
        marginTop: '16px',
        marginBottom: '8px',
        lineHeight: '1.4'
      }} {...props} />
    ),
    p: ({node, ...props}) => (
      <p style={{
        marginBottom: '12px',
        lineHeight: '1.8'
      }} {...props} />
    ),
    ul: ({node, ...props}) => (
      <ul style={{
        paddingLeft: '20px',
        marginBottom: '12px'
      }} {...props} />
    ),
    ol: ({node, ...props}) => (
      <ol style={{
        paddingLeft: '20px',
        marginBottom: '12px'
      }} {...props} />
    ),
    li: ({node, ...props}) => (
      <li style={{
        marginBottom: '6px',
        lineHeight: '1.7'
      }} {...props} />
    ),
    strong: ({node, ...props}) => (
      <strong style={{
        fontWeight: '700',
        color: '#191F28'
      }} {...props} />
    ),
    em: ({node, ...props}) => (
      <em style={{
        fontStyle: 'italic',
        color: 'var(--color-primary)'
      }} {...props} />
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 헤더 */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#fff',
        borderBottom: '1px solid #E5E8EB',
        padding: '20px 24px',
        zIndex: 100
      }}>
        <h1 style={{
          fontSize: '22px',
          fontWeight: 'bold',
          color: '#191F28',
          marginBottom: '4px'
        }}>
          {name}님의 {fortuneTypeTitle || '2026 신년 운세'}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#8B95A1',
          margin: 0
        }}>
          {birthdate.year}년 {birthdate.month}월 {birthdate.day}일
        </p>
      </div>

      {/* 메시지 목록 */}
      <div style={{
        flex: 1,
        padding: '20px',
        paddingBottom: '180px',
        overflowY: 'auto'
      }}>
        {messages.map((message, index) => {
          const isLastAssistant = message.role === 'assistant' && index === messages.length - 1
          return (
            <div key={index} style={{ marginBottom: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-start'
                }}
              >
                {/* 메시지 내용 */}
                <div style={{
                  maxWidth: message.role === 'user' ? '75%' : '100%',
                  padding: message.role === 'user' ? '12px 16px' : '20px',
                  borderRadius: '12px',
                  background: message.role === 'user'
                    ? 'var(--color-primary)'
                    : message.role === 'error'
                    ? '#FEF2F2'
                    : 'var(--color-primary-light)',
                  color: message.role === 'user' ? '#fff' : '#4E5968'
                }}>
                  {message.role === 'assistant' ? (
                    <div style={{
                      fontSize: '16px',
                      lineHeight: '1.8',
                      fontFamily: "'Do Hyeon', sans-serif",
                      fontWeight: 400
                    }}>
                      <ReactMarkdown components={markdownComponents}>
                        {normalizeMarkdown(message.content)}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p style={{
                      fontSize: '15px',
                      lineHeight: '1.6',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      color: message.role === 'error' ? '#F04452' : undefined
                    }}>
                      {message.content}
                    </p>
                  )}
                </div>
              </div>

              {/* 후속 질문 버튼 (마지막 assistant 메시지에만, 전송 중이 아닐 때) */}
              {isLastAssistant && !isSending && message.followUpQuestions?.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px'
                }}>
                  {message.followUpQuestions.map((question, qIndex) => (
                    <button
                      key={qIndex}
                      onClick={() => handleFollowUpClick(question)}
                      style={{
                        padding: '8px 14px',
                        fontSize: '13px',
                        color: 'var(--color-primary)',
                        background: '#fff',
                        border: '1px solid var(--color-primary)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        lineHeight: '1.4',
                        textAlign: 'left'
                      }}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {/* 전송 중 로딩 표시 */}
        {isSending && (
          <div
            ref={loadingIndicatorRef}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}
          >
            <div style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: 'var(--color-primary-light)',
              color: '#8B95A1',
              fontSize: '14px'
            }}>
              풀이하고 있습니다...
            </div>
          </div>
        )}
      </div>

      {/* 채팅 입력창 */}
      <div style={{
        position: 'fixed',
        bottom: '72px',
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid #E5E8EB',
        padding: '12px 20px',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="궁금한 점을 물어보세요..."
            disabled={isSending}
            style={{
              flex: 1,
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E8EB',
              borderRadius: '8px',
              outline: 'none',
              background: isSending ? '#F2F4F6' : '#fff'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSending}
            style={{
              padding: '12px 20px',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#fff',
              background: (!inputMessage.trim() || isSending) ? '#E5E8EB' : 'var(--color-primary)',
              border: 'none',
              borderRadius: '8px',
              cursor: (!inputMessage.trim() || isSending) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {isSending ? '전송 중...' : '전송'}
          </button>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 20px calc(12px + env(safe-area-inset-bottom))',
        background: '#fff',
        display: 'flex',
        gap: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)'
      }}>
        <button
          onClick={handleBackToTypeSelect}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#191F28',
            background: '#F2F4F6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          타입 선택으로
        </button>
        <button
          onClick={onRestart}
          style={{
            flex: 1,
            padding: '14px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          처음부터 다시하기
        </button>
      </div>
    </div>
  )
}
