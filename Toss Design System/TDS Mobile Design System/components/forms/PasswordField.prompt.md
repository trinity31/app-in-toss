Use `PasswordField` for passwords and secrets typed on the system keyboard. For 6-digit PINs use `Keypad` instead — TDS never masks a PIN in a text field.

```jsx
<PasswordField label="비밀번호" value={pw} onChange={setPw} helpText="8자 이상 입력해주세요" />
```
