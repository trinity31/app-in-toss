Use `BottomSheet` for selection lists, detail disclosure and secondary flows that keep the parent screen in view.

```jsx
<BottomSheet title="계좌를 선택해주세요" primaryLabel="확인" secondaryLabel="취소">
  <ListRow title="토스뱅크 통장" description="1,204,000원" />
</BottomSheet>
```

Radius 28, 10px outer inset from the screen edge, 48×4 grab handle. Sheet content scrolls; the button area does not.
