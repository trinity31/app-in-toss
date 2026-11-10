Use `Slider` for approximate values (amount, term, risk level) where precision is not required.

```jsx
<Slider value={v} onChange={setV} labels={['0원', '1억원']} tooltip />
```

5px track, 20px knob carrying the only two-layer shadow in TDS. The filled portion has a 20px minimum so the knob never clips at zero.
