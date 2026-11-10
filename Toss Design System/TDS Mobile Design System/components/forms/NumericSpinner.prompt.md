Use `NumericSpinner` for small bounded quantities (tickets, items). For open-ended amounts use a TextField with a keypad.

```jsx
<NumericSpinner value={n} onChange={setN} max={10} />
```

The value sits on a white card with `--tds-shadow-weak` inside a grey-tint track — the only place TDS nests an elevated surface inside a control.
