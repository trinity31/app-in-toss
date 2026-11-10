Use `Keyboard` when a mockup needs the system keyboard visible under a focused `TextField`.

```jsx
<TextField label="이름" />
<Keyboard />
```

The source defines this as a single 375×292 bitmap (`assets/images/keyboard-ios.png`), not as keys — so it has no theme or layout props. Never show it together with `Keypad`.
