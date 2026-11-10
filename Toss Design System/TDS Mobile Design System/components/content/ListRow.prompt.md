Use `ListRow` for every scannable record — accounts, transactions, settings, search results.

```jsx
<ListRow leftAccessory={<Icon name="IconBankToss" size={30} />} title="토스뱅크 통장" description="1,204,000원" rightAccessory={<Switch checked />} />
```

Vertical padding S 8 / M 12 / L 16 / XL 20; 44pt minimum height. Side margin is the 24px screen gutter by default. Title 17/590, description 15/400 tertiary.
