Use `Chip` for horizontally-scrolling filters and multi-select tags above a list.

```jsx
<Chip selected>전체</Chip>
<Chip shape="square" tailing={<Icon name="IconArrowDown2Mono" size={16} />}>정렬</Chip>
```

S 32px / M 38px; `shape="pill"` (999px) or `"square"` (12px). Minimum width is 64px so single-character chips stay tappable. `redDot` pins the 8px notification dot to the top-right.
