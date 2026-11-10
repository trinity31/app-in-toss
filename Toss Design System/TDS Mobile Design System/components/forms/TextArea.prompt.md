Use `TextArea` for free-text entry longer than a line — memo, reason, enquiry.

```jsx
<TextArea label="문의 내용" placeholder="어떤 점이 불편했나요?" maxLength={300} value={v} onChange={setV} />
```

Always on the box surface (never the line variant), radius 12, 1.5 line-height.
