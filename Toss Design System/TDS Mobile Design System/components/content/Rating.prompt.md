Use `Rating` to show review scores, or as a control when collecting one.

```jsx
<Rating value={4} />
<Rating value={score} readOnly={false} onChange={setScore} kind="compact" />
```

Filled stars are `--base-yellow-yellow-500`; empty stars are grey-200, never outlined.
