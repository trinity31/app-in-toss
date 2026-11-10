Use `Navigation` as the fixed 44pt top bar of any Apps-in-Toss screen. The right-hand ··· / ✕ capsule is host-owned and always present.

```jsx
<Navigation title="적금 계산기" logoSrc="assets/images/service-logo.png" dynamicIcon={<Icon name="IconHeartMonoHeartLove" size={20} />} />
```

Capsules are radius 99 at 2 % black with a 40px backdrop blur, so the bar reads over any scrolling content.
