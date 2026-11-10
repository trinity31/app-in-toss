Render any glyph from the TDS icon library by name: `<Icon name="IconSearchMonoSearchFind" size={24} />`.

```jsx
<Icon name="IconArrowRightMonoArrow" size={24} style={{ color: 'var(--semantic-icon-quaternary)' }} />
```

Names come straight from the Figma layer names (`icon-search-mono,search,find` → `IconSearchMonoSearchFind`). Read `Icon.d.ts` for the full valid list — never guess a name. Single-colour glyphs paint with `currentColor`, so recolour via the CSS `color` property on the element or its parent. Standard sizes are 16 / 20 / 24 / 28 / 30.

`Icon` is an **intentional addition** — the source ships each glyph as a separate Figma symbol with no wrapper component.
