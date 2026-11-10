Use `Result` as the terminal screen of a flow — completed transfer, failed verification, empty list.

```jsx
<Result asset={<Icon name="IconCheckCircleMonoFill" size={72} />} title="송금했어요" description="1,000원을 보냈어요" />
```

Title 22px bold, description 15px at 1.6 line-height, centred. Pair with a `BottomCTA` pinned to the bottom.
