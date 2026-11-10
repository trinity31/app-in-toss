Use `BottomCTA` for the terminal action of a screen. Gutter is 20px — narrower than the 24px content gutter — so buttons feel wider than the list.

```jsx
<BottomCTA upperItem={<Checkbox checked={ok} onChange={setOk} />}>
  <Button size="XL" fullWidth>확인</Button>
</BottomCTA>
```
