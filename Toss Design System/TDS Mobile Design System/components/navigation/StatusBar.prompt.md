Use `StatusBar` at the top of a device mockup, directly above `Navigation`.

```jsx
<StatusBar os="ios" />
<Navigation title="서비스 이름" />
```

The iOS glyphs are the real SVGs copied out of the .fig (`assets/images/status-*.svg`); their paths resolve from the loaded bundle, so the component works at any page depth. iOS is 50px tall, Android 24px, and the Android bar carries no clock — that is what the source defines, not an omission.
