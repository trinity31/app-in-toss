Use `Checkbox` for consent lists and multi-select rows. TDS never draws a square box — checked state is a filled blue disc, unchecked is the same disc in grey.

```jsx
<Checkbox checked={agreed} onChange={setAgreed} />
<Checkbox variant="line" size="S" checked />
```
