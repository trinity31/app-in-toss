import { useState } from 'react';
import { koreanToday, MOVING_MAX_DATE, movingPeriodError } from '../lib/movingDate';
import MovingDateResults from './MovingDateResults';
import './MovingDate.css';

export default function MovingPeriodInput({ initialPeriod, emptyResult, onNext, onBack }) {
  const [period, setPeriod] = useState(initialPeriod || { start_date: '', end_date: '' });
  const error = movingPeriodError(period);
  return <div className="moving-period">
    <h1>언제 이사하고 싶으신가요?</h1>
    <p>본인 사주를 기준으로 추천일과 피해야 할 날을 비교해요. 양끝 포함 최대 90일입니다.</p>
    {['start_date', 'end_date'].map(field => <label key={field}>
      {field === 'start_date' ? '시작일' : '종료일'}
      <input type="date" value={period[field]} min={field === 'end_date' ? period.start_date || koreanToday() : koreanToday()} max={MOVING_MAX_DATE}
        onChange={event => setPeriod(prev => ({ ...prev, [field]: event.target.value }))} />
    </label>)}
    {error && <p role="alert">{error}</p>}
    {emptyResult && emptyResult.period.start_date === period.start_date && emptyResult.period.end_date === period.end_date && <MovingDateResults result={emptyResult} />}
    <div className="moving-period-actions">
      <button type="button" onClick={onBack}>이전</button>
      <button type="button" disabled={Boolean(error)} onClick={() => onNext({ moving_period: period })}>사주 풀이 받기</button>
    </div>
  </div>;
}
