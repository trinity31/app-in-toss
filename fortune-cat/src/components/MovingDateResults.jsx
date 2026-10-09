import './MovingDate.css';

function briefReasons(item) {
  const descriptions = {
    primary_yongshin: "사주에 필요한 1순위 용신 기운을 보완",
    secondary_yongshin: "사주에 필요한 2순위 용신 기운을 보완",
    stem_yongshin: "일진 천간이 용신 오행에 해당",
    noble: "일간 기준 천을귀인일에 해당",
    horse: "년지 기준 역마일에 해당",
    stem_combination: "일간과의 간합이 용신 오행과 연결",
    life_stage: "12운성의 길한 기준에 해당",
    son_free: "음력 날짜가 손 없는 날에 해당",
  };
  return (
    item.rules
      .filter((r) => r.delta > 0)
      .slice(0, 3)
      .map((r) => descriptions[r.rule_id] ?? r.label)
      .join(" · ") || "충·복음·공망 제외 조건을 통과한 날짜입니다."
  );
}

const exclusionDescriptions = {
  년지충: "태어난 해의 지지와 충하는 날",
  일지충: "본인 일지와 충하는 날",
  복음: "본인 일주와 같은 간지가 겹치는 날",
  천극지충: "천간의 극과 일지의 충이 겹치는 날",
  "일주 공망": "본인 일주 기준 공망에 해당하는 날",
};

export default function MovingDateResults({ result }) {
  return (
    <section className="moving-results" aria-labelledby="moving-results-title" >
      <header >
        <h2 id="moving-results-title" >
          추천 이사일
        </h2>
        <p >
          희망 기간: {result.period.start_date} ~ {result.period.end_date}
        </p>
      </header>
      {result.status === "no_candidates" ? (
        <div
          role="status"

        >
          <p >
            이 기간에는 추천할 수 있는 날짜가 없어요.
          </p>
          <p >
            사주와 충·복음·공망에 해당하는 날짜를 제외했어요. 이용권은 차감되지
            않았습니다. 기간을 바꿔 다시 확인해 주세요.
          </p>
        </div>
      ) : (
        <ol >
          {result.recommendations.map((item) => (
            <li
              key={item.date}

            >
              <div >
                <span >
                  추천 {item.rank}
                </span>
                <h3 >
                  <time dateTime={item.date}>{item.date}</time> ({item.weekday})
                </h3>
              </div>
              <p >
                {item.day_pillar} · 음력 {item.is_leap_month ? "윤 " : ""}
                {item.lunar_date}
              </p>
              <p >
                {item.son_free ? "손 없는 날" : "손 없는 날에 해당하지 않음"}
              </p>
              <div >
                {item.tags.map((tag) => (
                  <span
                    key={tag}

                  >
                    {tag}
                  </span>
                ))}
              </div>
              <p >
                추천 이유: {briefReasons(item)}
              </p>
              {item.warnings.length > 0 && (
                <p >
                  주의점: {item.warnings.join(" · ")}
                </p>
              )}
              <details >
                <summary >
                  추천 근거 자세히 보기
                </summary>
                <ul >
                  {item.rules.map((rule) => (
                    <li key={rule.rule_id}>
                      <strong>{rule.label}</strong>
                      {rule.evidence && `: ${rule.evidence}`}
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ol>
      )}
      {result.limitations.length > 0 && (
        <div >
          <h3 >판단 범위</h3>
          {result.limitations.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      )}
      {result.excluded_dates.length > 0 && (
        <details
          open

        >
          <summary >
            피해야 할 날 {result.excluded_dates.length}일과 이유
          </summary>
          <ul >
            {result.excluded_dates.map((item) => (
              <li key={item.date}>
                <time dateTime={item.date}>{item.date}</time> ·{" "}
                {item.day_pillar}:{" "}
                {item.exclusion_reasons
                  .map((reason) => exclusionDescriptions[reason] ?? reason)
                  .join(" · ")}
                {item.warnings.length > 0 && ` (${item.warnings.join(" · ")})`}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p >
        전통 명리 기준의 추천이며 실제 계약·이사 가능 일정과 함께 비교해 주세요.
      </p>
    </section>
  );
}
