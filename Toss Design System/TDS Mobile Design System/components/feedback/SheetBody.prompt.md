Use `SheetBody` inside `BottomSheet` so the body scrolls while the title and button area stay fixed.

```jsx
<BottomSheet title="계좌를 선택해주세요" primaryLabel="확인">
  <SheetBody kind="selection"><SelectionRow title="토스뱅크 통장" selected /></SheetBody>
</BottomSheet>
```

`kind="paragraph"` applies the 24px gutter and 1.6 line-height; `kind="list"` applies none, because rows carry their own.
