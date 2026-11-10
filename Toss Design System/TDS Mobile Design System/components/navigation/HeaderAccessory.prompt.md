Use `HeaderAccessory` as the `accessory` of a `ListHeader` when it is a count, a date or a "전체보기" affordance rather than a full `TextButton`.

```jsx
<ListHeader title="거래 내역" accessory={<HeaderAccessory text="전체보기" onClick={go} />} />
```
