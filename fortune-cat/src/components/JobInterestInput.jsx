import { useEffect, useState } from 'react';
import { authenticatedReadingFetch } from '../lib/tossSession';
import { jobKeywordRequest, jobPreferencesError } from '../lib/jobInterests';
import './JobInterestInput.css';

export default function JobInterestInput({ userData, onNext, onBack }) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, setValue] = useState(() => {
    const saved = userData.job_preferences;
    return Array.isArray(saved?.keyword_ids) && typeof saved?.interest === 'string'
      ? saved : { keyword_ids: [], interest: '' };
  });
  const body = JSON.stringify(jobKeywordRequest(userData));
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    authenticatedReadingFetch(`${import.meta.env.VITE_API_BASE_URL}/deep-reading/job/keywords`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: controller.signal,
    }).then(async response => {
      const result = await response.json();
      if (!response.ok || !Array.isArray(result?.keywords)) throw new Error('keyword lookup failed');
      if (!active) return;
      setCatalog(result);
      setValue(previous => ({ ...previous, keyword_ids: previous.keyword_ids.filter(id => result.keywords.some(item => item.id === id)) }));
    }).catch(() => {
      if (!active) return;
      setError('키워드를 불러오지 못했어요. 관심 분야를 직접 입력해도 괜찮아요.');
      setValue(previous => ({ ...previous, keyword_ids: [] }));
    }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [body]);

  return <div className="job-interest">
    <h1>어떤 일에 마음이 가나요?</h1>
    <p>{catalog?.day_pillar && `${catalog.day_pillar} 풀이에서 찾은 키워드예요. `}
      맞는 것을 하나 이상 고르거나 관심 분야를 직접 적어 주세요. 둘 다 입력해도 좋아요.</p>
    {loading && <p role="status">일주 키워드를 찾고 있어요…</p>}
    {error && <p role="status">{error}</p>}
    {[['activity', '일하는 방식'], ['field', '관심 분야']].map(([category, label]) => {
      const keywords = catalog?.keywords.filter(item => item.category === category) || [];
      return keywords.length > 0 && <fieldset key={category}>
        <legend>{label}</legend>
        <div className="job-interest-chips">{keywords.map(item => {
          const selected = value.keyword_ids.includes(item.id);
          return <button key={item.id} type="button" aria-pressed={selected} onClick={() => setValue(previous => ({
            ...previous, keyword_ids: selected ? previous.keyword_ids.filter(id => id !== item.id) : [...previous.keyword_ids, item.id],
          }))}>{selected && <span aria-hidden="true">✓ </span>}{item.label}</button>;
        })}</div>
      </fieldset>;
    })}
    <label htmlFor="job-interest-text">직접 적는 관심 분야</label>
    <textarea id="job-interest-text" value={value.interest} rows={4} maxLength={300}
      onChange={event => setValue(previous => ({ ...previous, interest: event.target.value }))}
      aria-describedby="job-interest-help" placeholder="예: AI 앱 개발에 관심이 있어요. 지금 하는 일을 살려 작은 서비스를 만들고 싶어요." />
    <p id="job-interest-help">현재 하는 일·경험·원하는 근무 조건도 적어 주세요. {value.interest.length}/300</p>
    <div className="job-interest-actions">
      <button type="button" onClick={onBack}>이전</button>
      <button type="button" disabled={loading || Boolean(jobPreferencesError(value))}
        onClick={() => onNext({ job_preferences: { ...value, interest: value.interest.trim() } })}>사주 풀이 받기</button>
    </div>
  </div>;
}
