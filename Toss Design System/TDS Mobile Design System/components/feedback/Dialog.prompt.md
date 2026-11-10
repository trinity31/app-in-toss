Use `Dialog` only when the user must decide before continuing. Title is a sentence, description explains the consequence.

```jsx
<Dialog kind="confirm" title="다시 촬영해주세요" description="정보가 맞게 인식됐는지 다시 확인해주세요." />
```

311px wide, radius 24, 22px padding. Dim is `rgba(0,0,0,0.2)` — much lighter than a typical modal scrim.
