# 사주 API 통합 가이드 (React 모바일 웹앱용)

이 문서는 React 모바일 웹앱에서 Supabase와 AI 백엔드를 **직접** 호출하여 사주 이미지를 생성하는 방법을 설명합니다.

---

## 📌 아키텍처 개요

### 웹앱 vs 모바일앱

**웹앱 (기존):**
```
웹 브라우저 → astrocat.kr/api/saju → Supabase DB
                                    → 크레딧 확인
                                    → AI 백엔드
```

**모바일앱 (새로운 방식):**
```
모바일 앱 → Supabase DB (직접 연결)
         → AI 백엔드 (직접 연결)
```

**주요 차이점:**
- ✅ Supabase DB에 직접 쿼리
- ✅ AI 백엔드에 직접 요청
- ❌ 크레딧 시스템 없음 (무료)
- ❌ 일일 사용 제한 없음
- ❌ 로그인 불필요

---

## 🔧 환경 설정

### 1. Supabase JS 설치

```bash
npm install @supabase/supabase-js
```

### 2. 환경 변수 설정

모바일 앱의 환경 설정 파일(`.env`)에 다음 값을 추가하세요:

```bash
# Supabase 연결 정보 (별도 전달 예정)
SUPABASE_URL=https://dhepxbirgejontpweait.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZXB4YmlyZ2Vqb250cHdlYWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1OTc1MDQsImV4cCI6MjA2OTE3MzUwNH0.k-iVRG_8HLXtm8ehOolU9kJtZ8Yg8ao7Oa2kgGt_m2M

# AI 백엔드 API 키 (별도 전달 예정)
SAJU_AI_API_KEY=07ee8acf-ec28-44f7-996d-7d67919d32f3
```

---

## 📖 1단계: Reading Types 조회 (Supabase)

사용 가능한 사주 풀이 타입 목록을 Supabase DB에서 직접 조회합니다.

### Supabase 클라이언트 설정

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Reading Types 조회 함수

```typescript
// hooks/useSajuReadingTypes.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ReadingType {
  id: number;
  code: string;
  title_ko: string;
  title_en: string;
  description_ko: string;
  description_en: string;
  image_url: string;
  credit_cost: number;
  is_active: boolean;
  sort_order: number;
  theme_type: string;  // AI 백엔드에 전달할 값
  created_at: string;
  updated_at: string;
}

export const useSajuReadingTypes = () => {
  const [readingTypes, setReadingTypes] = useState<ReadingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReadingTypes();
  }, []);

  const fetchReadingTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('saju_reading_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      setReadingTypes(data || []);
    } catch (err) {
      console.error('Failed to fetch reading types:', err);
      setError('풀이 타입을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { readingTypes, loading, error };
};
```

### 응답 데이터 예시

```json
[
  {
    "id": 1,
    "code": "basic",
    "title_ko": "오행 기본",
    "title_en": "Five Elements Basic",
    "description_ko": "오행으로 보는 기본 사주",
    "description_en": "Basic fortune reading with five elements",
    "image_url": "https://.../basic.png",
    "credit_cost": 0,
    "is_active": true,
    "sort_order": 1,
    "theme_type": "five_elements_divine",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## 🎨 2단계: 사주 생성 요청 (AI 백엔드)

사용자 정보를 AI 백엔드로 직접 전송하여 사주 이미지를 생성합니다.

### 엔드포인트

```
POST https://saju.trinity-apps.net/saju-reading
```

### 요청 형식

- **Content-Type:** `multipart/form-data`
- **Header:** `X-API-Key: [SAJU_AI_API_KEY]`

### 필수 파라미터

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `name` | string | 이름 | "홍길동" |
| `datetime` | string | 생년월일 (YYYY-MM-DD) | "1990-01-15" |
| `gender` | string | 성별 (대문자) | "M" 또는 "F" |
| `theme_type` | string | Reading type의 theme_type | "five_elements_divine" |
| `reading_type` | string | theme_type과 동일값 | "five_elements_divine" |
| `language` | string | 언어 (고정) | "ko" |

### 선택 파라미터

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `birth_time` | string | 태어난 시간 (HH:mm) | "14:30" |
| `image` | File | 얼굴 사진 (JPG, PNG) | (파일 객체) |

### 사주 생성 Hook

```typescript
// hooks/useSajuGenerate.ts
import { useState } from 'react';

export interface SajuResult {
  reading: string;
  image_url: string;
  image_description: string;
}

export interface UserData {
  name: string;
  year: string;
  month: string;
  day: string;
  gender: 'male' | 'female';
  birthTime?: string;
  themeType: string;  // Reading type의 theme_type
}

export const useSajuGenerate = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SajuResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSaju = async (
    userData: UserData,
    image?: { uri: string; type: string; name: string }
  ) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // FormData 생성
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append(
        'datetime',
        `${userData.year}-${userData.month.padStart(2, '0')}-${userData.day.padStart(2, '0')}`
      );
      formData.append('gender', userData.gender === 'male' ? 'M' : 'F');
      formData.append('theme_type', userData.themeType);
      formData.append('reading_type', userData.themeType); // 동일값
      formData.append('language', 'ko');

      // 선택사항: 태어난 시간
      if (userData.birthTime) {
        formData.append('birth_time', userData.birthTime);
      }

      // 선택사항: 얼굴 사진
      if (image) {
        formData.append('image', {
          uri: image.uri,
          type: image.type,
          name: image.name,
        } as any);
      }

      // AI 백엔드 호출
      const response = await fetch(
        'https://saju.trinity-apps.net/saju-reading',
        {
          method: 'POST',
          headers: {
            'X-API-Key': process.env.SAJU_AI_API_KEY!,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }

      const data: SajuResult = await response.json();
      setResult(data);
      return data;
    } catch (err) {
      console.error('Failed to generate saju:', err);
      setError('사주를 생성하는데 실패했습니다.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateSaju, loading, result, error };
};
```

### 응답 예시

```json
{
  "reading": "홍길동님의 사주를 오행으로 풀이하면...\n\n당신은 목(木)의 기운이 강한 사람으로...",
  "image_url": "https://xxx.supabase.co/storage/v1/object/public/saju-images/20250101_143022_abc123.png",
  "image_description": "푸른 나무가 우뚝 솟아있는 모습"
}
```

---

## 🔄 모바일 앱 데이터 매핑

### 데이터 수집 → API 파라미터 변환

| 모바일 앱 데이터 | API 파라미터 | 변환 방법 |
|-----------------|--------------|----------|
| 이름 | `name` | 그대로 전달 |
| 생년월일 (년, 월, 일) | `datetime` | `YYYY-MM-DD` 형식으로 조합 |
| 태어난 시간 (시, 분) | `birth_time` | `HH:mm` 형식으로 조합 (optional) |
| 성별 ("male" / "female") | `gender` | `"M"` 또는 `"F"`로 변환 |
| 얼굴 사진 (base64 또는 URI) | `image` | File 객체로 변환 |
| 선택한 풀이 타입 | `theme_type`, `reading_type` | Reading type의 `theme_type` 값 사용 |

### 변환 예제 코드

```typescript
// 모바일 앱에서 수집한 데이터
const mobileData = {
  name: "홍길동",
  birthYear: "1990",
  birthMonth: "1",
  birthDay: "15",
  birthHour: "14",
  birthMinute: "30",
  gender: "male",
  selectedReadingType: "five_elements_divine", // Reading type의 theme_type
  facePhoto: { uri: "file://...", type: "image/jpeg", name: "photo.jpg" }
};

// API 파라미터로 변환
const apiData = {
  name: mobileData.name,
  datetime: `${mobileData.birthYear}-${mobileData.birthMonth.padStart(2, '0')}-${mobileData.birthDay.padStart(2, '0')}`,
  birth_time: `${mobileData.birthHour.padStart(2, '0')}:${mobileData.birthMinute.padStart(2, '0')}`,
  gender: mobileData.gender === 'male' ? 'M' : 'F',
  theme_type: mobileData.selectedReadingType,
  reading_type: mobileData.selectedReadingType, // 동일값
  language: 'ko',
  image: mobileData.facePhoto
};
```

---

## 📱 완전한 통합 예제

### 컴포넌트 예제

```typescript
import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useSajuReadingTypes } from './hooks/useSajuReadingTypes';
import { useSajuGenerate } from './hooks/useSajuGenerate';

const SajuScreen = () => {
  const { readingTypes, loading: typesLoading } = useSajuReadingTypes();
  const { generateSaju, loading: generating, result } = useSajuGenerate();

  const [selectedType, setSelectedType] = useState<string>('');

  const handleGenerate = async () => {
    const userData = {
      name: '홍길동',
      year: '1990',
      month: '1',
      day: '15',
      gender: 'male' as const,
      birthTime: '14:30',
      themeType: selectedType,
    };

    await generateSaju(userData);
  };

  if (typesLoading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        사주 풀이 타입 선택
      </Text>

      {readingTypes.map((type) => (
        <Button
          key={type.id}
          title={type.title_ko}
          onPress={() => setSelectedType(type.theme_type)}
          disabled={generating}
        />
      ))}

      <Button
        title="사주 생성"
        onPress={handleGenerate}
        disabled={!selectedType || generating}
      />

      {generating && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 10 }}>{result.reading}</Text>
          {result.image_url && (
            <Image
              source={{ uri: result.image_url }}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
          )}
          <Text style={{ marginTop: 10, color: '#666' }}>
            {result.image_description}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default SajuScreen;
```

### 이미지 선택 예제

```typescript
import { launchImageLibrary } from 'react-native-image-picker';

const selectImage = async () => {
  const result = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.8,
    maxWidth: 1024,
    maxHeight: 1024,
  });

  if (result.didCancel || !result.assets?.[0]) {
    return null;
  }

  const image = result.assets[0];
  return {
    uri: image.uri!,
    type: image.type || 'image/jpeg',
    name: image.fileName || 'photo.jpg',
  };
};

// 사용 예시
const handleGenerateWithImage = async () => {
  const image = await selectImage();

  const userData = {
    name: '홍길동',
    year: '1990',
    month: '1',
    day: '15',
    gender: 'male' as const,
    themeType: 'five_elements_divine',
  };

  await generateSaju(userData, image || undefined);
};
```

---

## ⚠️ 주의사항

### 1. 크레딧 시스템 없음
- 모바일 앱은 무료로 사용 가능합니다.
- 웹앱과 달리 크레딧 잔액 확인이 불필요합니다.

### 2. 일일 사용 제한 없음
- 모바일 앱은 일일 사용 제한이 없습니다.
- 동일한 데이터로 여러 번 생성 가능합니다.

### 3. 응답 시간
- AI 이미지 생성 시간: **약 30초 ~ 2분**
- 네트워크 상태에 따라 더 오래 걸릴 수 있습니다.
- 사용자에게 로딩 인디케이터를 반드시 표시하세요.

### 4. 이미지 용량
- 업로드 가능한 이미지 크기: **최대 5MB 권장**
- 지원 형식: JPG, PNG
- 모바일에서 업로드 전 이미지 리사이징 권장 (1024x1024 이하)

### 5. 에러 처리
- 네트워크 오류에 대비한 에러 처리 필수
- 타임아웃 권장: 최소 3분
- 사용자에게 명확한 에러 메시지 제공

---

## 🐛 문제 해결

### Q1: Supabase 연결 오류
**원인:** 잘못된 URL 또는 API KEY

**해결:**
- 환경변수가 올바르게 설정되었는지 확인
- `SUPABASE_URL`과 `SUPABASE_ANON_KEY` 확인

### Q2: Reading Types 조회 실패
**원인:** 데이터베이스 권한 또는 네트워크 오류

**해결:**
```typescript
const { data, error } = await supabase
  .from('saju_reading_types')
  .select('*')
  .eq('is_active', true);

if (error) {
  console.error('Error:', error.message);
}
```

### Q3: AI 백엔드 응답 없음
**원인:** API 키 오류 또는 네트워크 문제

**해결:**
- `X-API-Key` 헤더가 올바른지 확인
- 네트워크 연결 상태 확인
- 타임아웃 설정 확인

### Q4: 이미지 업로드 실패
**원인:** FormData 형식 오류

**해결:**
```typescript
// ✅ 올바른 형식
formData.append('image', {
  uri: 'file://...',
  type: 'image/jpeg',
  name: 'photo.jpg',
} as any);
```

### Q5: "서버 오류: 500" 에러
**원인:** AI 백엔드 일시적 오류

**해결:**
- 몇 분 후 재시도
- 지속되면 관리자에게 문의

---

## 📞 지원

추가 문의나 기술 지원이 필요한 경우:
- 이메일: [지원 이메일]
- 환경변수 (URL, KEY): 별도 전달 예정

---

## 📝 변경 이력

### 2025-01-02
- 초기 문서 작성
- Supabase 직접 연결 방식 안내
- AI 백엔드 직접 호출 방식 안내
- React Native 통합 예제 추가
