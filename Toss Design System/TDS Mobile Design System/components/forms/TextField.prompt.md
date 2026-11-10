Use `TextField` for typed entry. Line is the default TDS field (2px underline, no box); Box is for dense forms and text areas.

```jsx
<TextField label="이름" placeholder="이름을 입력해주세요" helpText="실명을 입력해주세요" />
<TextField variant="box" error helpText="다시 확인해주세요" />
```

Input text is 17px / weight 510. The underline is 2px `rgba(0,27,55,0.1)`, turning brand blue on focus and red on error.
