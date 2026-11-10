Use `Stepper` to explain a multi-stage process before the user starts it (onboarding, document checklist).

```jsx
<Stepper steps={[{ title: '신분증 준비', description: '주민등록증 또는 운전면허증' }, { title: '얼굴 인증' }]} />
```

Numbers up to 7 have dedicated glyphs in the source; beyond that, keep using plain digits.
