Use `Toast` to confirm something that already happened ("계좌번호가 복사되었습니다"). Never for errors that need a decision — use Dialog.

```jsx
<Toast leading={<Icon name="IconCheckCircleMonoFill" size={24} />} action="공유">계좌번호가 복사되었습니다</Toast>
```

Fully rounded, `rgba(3,24,50,0.46)` over a 30px backdrop blur; text is `rgba(253,253,254,0.89)`, not pure white.
