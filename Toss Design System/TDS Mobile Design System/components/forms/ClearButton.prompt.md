Use `ClearButton` as the `suffix` of a `TextField` once it holds a value.

```jsx
<TextField value={v} onChange={setV} suffix={v && <ClearButton onClick={() => setV('')} />} />
```

Filled grey disc with a white ✕ — not an outlined icon.
