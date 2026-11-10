Use `SelectorField` where the value comes from a list, not the keyboard — bank, card, date, category. Pair it with a `BottomSheet` of `SelectionRow`s.

```jsx
<SelectorField label="은행" value={bank} onClick={openSheet} />
```

The down-chevron is what tells the user this opens a sheet; never render it on a real `TextField`.
