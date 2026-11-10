Use `SelectionRow` inside a `BottomSheet` when the sheet is a picker — it adds the checkmark and bold-on-selected treatment that a plain `ListRow` lacks.

```jsx
<BottomSheet title="계좌를 선택해주세요">
  <SelectionRow title="토스뱅크 통장" description="1,204,000원" selected />
  <SelectionRow title="입출금 통장" description="88,000원" />
</BottomSheet>
```
