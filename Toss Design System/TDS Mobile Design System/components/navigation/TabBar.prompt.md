Use `TabBar` for top-level sections (3–5 items). Labels are 11px / 510 and truncate rather than wrap.

```jsx
<TabBar value={tab} onChange={setTab} items={[
  { label: '홈', icon: <Icon name="IconHomeMonoHomeFamily" size={24} /> },
  { label: '혜택', icon: <Icon name="IconGiftMonoBoxGift" size={24} />, redDot: true },
]} />
```

Selected state changes colour only — no pill, no underline.
