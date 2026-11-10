Use `ButtonArea` when you build a custom overlay and need its footer to match Dialog / Bottom Sheet padding exactly.

```jsx
<ButtonArea context="dialog"><Button size="XL" variant="weak" color="neutral">취소</Button><Button size="XL">확인</Button></ButtonArea>
```

Dialog pads `0 14 14`, sheet `17 20 0`, bottom CTA `0 20` — the three are genuinely different.
