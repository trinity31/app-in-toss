Use `SearchField` at the top of a searchable list. It carries its own 16px protection gradient at the bottom so content scrolls out cleanly underneath.

```jsx
<SearchField value={q} onChange={setQ} onClear={() => setQ('')} />
```

44px capsule at radius 12 on `--semantic-background-lower`; placeholder is `--semantic-text-quaternary`.
