Use `Button` for the primary action on a screen; one Fill/brand button per view, everything else Weak or TextButton.

```jsx
<Button size="XL" fullWidth>다음</Button>
<Button size="M" variant="weak" color="neutral">취소</Button>
```

Sizes S(32) / M(38) / L(48) / XL(56) with radii 8 / 10 / 14 / 16. Colors brand, neutral, danger, inverse. `variant="weak"` swaps to a 16%-alpha tint with coloured text. Disabled renders at 0.3 opacity (TDS does not recolour disabled buttons). Bottom-of-screen CTAs are XL + `fullWidth`.
