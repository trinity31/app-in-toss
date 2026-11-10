Use `BankPicker` for the "은행·증권 선택" step of a transfer or account-link flow. Selected tile gains a brand-weak fill and a 1.5px brand ring — the only place TDS rings a tile.

```jsx
<BankPicker value="토스뱅크" items={[{ label: '토스뱅크', icon: <Icon name="IconBankToss" size={28} /> }]} />
```
