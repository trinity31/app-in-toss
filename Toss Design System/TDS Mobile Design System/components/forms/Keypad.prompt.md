Use `Keypad` when the whole screen is an amount-entry step — never alongside the OS keyboard.

```jsx
<Keypad onKey={(k) => setAmount(a => k === '⌫' ? a.slice(0, -1) : a + k)} />
```

Keys are 120×63 with no background; digits are 30px regular in `--base-grey-grey-700`. There is no decimal key.
