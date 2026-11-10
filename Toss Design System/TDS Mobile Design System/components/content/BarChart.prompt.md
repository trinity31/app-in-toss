Use `BarChart` for month-over-month comparisons. TDS charts have no axes, no gridlines and no value labels on the bars.

```jsx
<BarChart values={[30, 55, 40, 90, 60, 75]} highlight={3} labels={['3월','4월','5월','6월','7월','8월']} />
```

Highlighting one bar greys the rest — that is the only emphasis mechanism.
