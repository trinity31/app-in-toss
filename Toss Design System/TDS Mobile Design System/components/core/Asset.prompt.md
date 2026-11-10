Use `Asset` wherever an icon, bank logo, avatar or thumbnail needs a consistent shaped frame — list rows, grid tiles, the Top hero.

```jsx
<Asset size={30} shape="circle"><Icon name="IconBankToss" size={20} /></Asset>
<Asset size={48} shape="squircle" src="assets/images/service-logo.png" />
```

Squircle radius is 28 % of the box, card 22 % — they scale with size rather than being fixed.
