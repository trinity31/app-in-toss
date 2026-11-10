Use `StepperRow` when steps need mixed content (a button, an image) that `Stepper`'s data API cannot express.

```jsx
<StepperRow num={1} title="신분증 준비" description="주민등록증 또는 운전면허증" />
<StepperRow num={2} title="얼굴 인증" last />
```
