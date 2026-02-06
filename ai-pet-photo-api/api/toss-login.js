// 토스 로그인 API
// POST /api/toss-login
// Body: { authorizationCode, referrer }
// Returns: { userKey, name, phone, birthday, gender }

import https from 'https'
import crypto from 'crypto'

const AUTH_API_BASE = 'https://apps-in-toss-api.toss.im/api-partner/v1/apps-in-toss/user/oauth2'

function getTLSOptions() {
  const cert = Buffer.from(process.env.TOSS_CLIENT_CERT_BASE64, 'base64').toString('utf-8')
  const key = Buffer.from(process.env.TOSS_CLIENT_KEY_BASE64, 'base64').toString('utf-8')
  return { cert, key, rejectUnauthorized: true }
}

function tlsRequest(url, method, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)
    const tlsOptions = getTLSOptions()

    const requestOptions = {
      ...tlsOptions,
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...headers,
      },
    }

    const req = https.request(requestOptions, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: body })
      })
    })

    req.on('error', (error) => reject(error))

    if (data) {
      req.write(JSON.stringify(data))
    }

    req.end()
  })
}

function decryptUserData(encryptedBase64, base64EncodedKey, aad) {
  const IV_LENGTH = 12
  const decoded = Buffer.from(encryptedBase64, 'base64')
  const key = Buffer.from(base64EncodedKey, 'base64')
  const iv = Buffer.from(decoded.subarray(0, IV_LENGTH))
  const ciphertext = Buffer.from(decoded.subarray(IV_LENGTH))
  const tag = Buffer.from(ciphertext.subarray(ciphertext.length - 16))
  const encrypted = Buffer.from(ciphertext.subarray(0, ciphertext.length - 16))

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAAD(Buffer.from(aad))
  decipher.setAuthTag(tag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf-8')
}

function decryptUserInfo(userInfo) {
  const decryptionKey = process.env.TOSS_DECRYPTION_KEY_BASE64
  const aad = process.env.TOSS_AAD_STRING

  if (!decryptionKey || !aad) {
    console.error('[toss-login] 복호화 키 또는 AAD가 설정되지 않았습니다')
    return userInfo
  }

  const fields = ['name', 'phone', 'gender', 'birthday', 'email']
  const decrypted = {}

  for (const field of fields) {
    const value = userInfo?.[field]
    try {
      decrypted[field] = typeof value === 'string'
        ? decryptUserData(value, decryptionKey, aad)
        : null
    } catch {
      decrypted[field] = null
    }
  }

  return { ...userInfo, ...decrypted }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { authorizationCode, referrer } = req.body

  if (!authorizationCode || !referrer) {
    return res.status(400).json({ error: 'authorizationCode와 referrer는 필수입니다' })
  }

  if (!process.env.TOSS_CLIENT_CERT_BASE64 || !process.env.TOSS_CLIENT_KEY_BASE64) {
    console.error('[toss-login] mTLS 인증서 환경변수가 설정되지 않았습니다')
    return res.status(500).json({ error: '서버 설정 오류' })
  }

  try {
    // 1. authorizationCode로 accessToken 발급
    const tokenResponse = await tlsRequest(
      `${AUTH_API_BASE}/generate-token`,
      'POST',
      { authorizationCode, referrer }
    )

    const tokenData = JSON.parse(tokenResponse.data)

    if (tokenResponse.statusCode !== 200 || !tokenData.success?.accessToken) {
      console.error('[toss-login] 토큰 발급 실패:', tokenData)
      return res.status(401).json({ error: '토스 인증에 실패했습니다' })
    }

    const accessToken = tokenData.success.accessToken

    // 2. accessToken으로 사용자 정보 조회
    const userResponse = await tlsRequest(
      `${AUTH_API_BASE}/login-me`,
      'GET',
      null,
      { Authorization: `Bearer ${accessToken}` }
    )

    const userData = JSON.parse(userResponse.data)

    if (userResponse.statusCode !== 200 || !userData.success) {
      console.error('[toss-login] 사용자 정보 조회 실패:', userData)
      return res.status(500).json({ error: '사용자 정보 조회에 실패했습니다' })
    }

    // 3. 사용자 정보 복호화
    const decryptedUser = decryptUserInfo(userData.success)

    return res.status(200).json({
      userKey: String(decryptedUser.userKey),
      name: decryptedUser.name,
      phone: decryptedUser.phone,
      birthday: decryptedUser.birthday,
      gender: decryptedUser.gender,
    })
  } catch (err) {
    console.error('[toss-login] 에러:', err)
    return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다' })
  }
}
