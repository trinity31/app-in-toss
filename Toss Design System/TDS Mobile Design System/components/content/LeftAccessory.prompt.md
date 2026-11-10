Use `LeftAccessory` as the `leftAccessory` of a `ListRow` when you need the resource sized and shaped to TDS spec.

```jsx
<ListRow leftAccessory={<LeftAccessory><Icon name="IconBankToss" size={20} /></LeftAccessory>} title="토스뱅크" />
<ListRow leftAccessory={<LeftAccessory type="text" text="09:41" />} title="입금" />
```
