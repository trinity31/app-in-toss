Use `ChipAccessory` as the `leading` or `tailing` prop of a `Chip` so glyph sizes match the chip size.

```jsx
<Chip tailing={<ChipAccessory kind="downChevron" side="tailing" />}>정렬</Chip>
<Chip leading={<ChipAccessory kind="profile" src="…" />}>김토스</Chip>
```
