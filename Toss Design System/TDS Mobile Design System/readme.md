# TDS Mobile — design system

A mobile UI system for **Apps in Toss**: third-party mini-apps that run inside a host wallet app.
Every screen is designed against a **375 pt** canvas, in **Korean**, for both iOS and Android
(the source carries per-OS variants of the navigation bar, slider and keypad).

The product context is consumer finance: accounts, transfers, cards, savings, credit, insurance
and the mini-apps built on top of them. The library is unusually deep on *money* primitives —
bank and securities-firm icons, bar charts, rating stars, receipt-style table rows, legal
disclosure blocks — and deliberately shallow on decoration.

## Source

| | |
|---|---|
| Figma file | `TDS_Mobile_for_Apps_in_Toss_(2602-3-2).fig` — attached to this project as a read-only virtual filesystem. No public URL was supplied. |
| Scope | Every page and frame was in scope (49 Figma pages). |
| Codebase | None supplied. |
| Decks | None supplied. |

Values in this system were transcribed from that file, not from public documentation.
Where the file disagrees with anything published about a similar-looking library, **the file wins**.

---

## Content fundamentals

**Language.** All product copy is Korean. English appears only in developer-facing layer names
and in occasional loan-words ("Tab", "Toast").

**Voice.** Warm, plain, quietly certain. It explains rather than instructs.

**Grammar.** The house ending is **`-요` / `-해요`체** — polite but informal. Never `-습니다`체 in UI
copy (that form is reserved for legal disclosure, where it reads as a quotation of the law):

- `계좌번호가 복사되었습니다` — toast, legal-adjacent
- `이자 받는 날까지 12일` — statement, no verb at all
- `다시 촬영해주세요` — request, `-주세요`
- `정보가 맞게 인식됐는지 다시 확인해주세요.` — dialog description
- `매달 셋째 주 금요일에 지급돼요.` — explanation, `-돼요`
- `로딩중이에요` — status, `-이에요`
- `예금자보호법에 따라 보호됩니다.` — small print, `-습니다`

**Person.** Second person is implied, almost never written. Copy says *what happens*, not
*what you must do*. There is no "we"; the product does not refer to itself.

**Length.** Titles are one line, ideally under 15 Korean characters. Descriptions are one
sentence. When more is needed it goes into `BottomInfo` bullets, not into the title block.

**Casing & punctuation.** Sentence case throughout; ALL CAPS never appears. Titles usually
omit the final period; descriptions and disclosures keep it. Numbers always carry their unit
(`1,204,000원`, `연 2.3%`, `12일`) and thousands separators.

**Emoji.** Not used in product copy. Emoji appear only in Figma layer names as authoring
shorthand (`🖲️ 버튼`, `🌈 텍스트버튼 옵션`) — never ship them.

**Vibe.** Calm competence. Nothing exclaims, nothing sells hard, nothing apologises twice.

---

## Visual foundations

**Colour.** One brand hue — `Blue 500 rgb(49,130,246)` — carried by ~all primary fills. Behind it
sit full 50→900 ramps for blue, grey, red, green, yellow, teal and orange, plus **opacity ramps**
of each. Semantic roles (`--semantic-text-primary`, `--semantic-fill-brand`, …) are the layer you
should actually use; most text roles resolve to *alpha-composited greys* (`rgba(0,12,30,0.8)`,
`rgba(3,18,40,0.7)`) rather than solid hexes, so text sits correctly on any surface. Every fill
has a **16 %-alpha "weak" twin** — that single rule generates most of the palette in use.
Light and dark themes ship as separate token scopes (`:root[data-theme="dark"]`), plus
`data-mode` scopes for iOS / Android / web differences.

**Backgrounds.** Flat colour only. `--semantic-background-default` (white) for content,
`--semantic-background-lower` (grey-100) for sunken sections and disclosure blocks. No photographic
backgrounds, no repeating patterns, no textures. Gradients appear in exactly one role: **protection
gradients** that fade content out at a scroll edge (search field bottom, `BottomInfo` 160 px tail).

**Type.** SF Pro at optical weights **400 / 510 / 590 / 700** — note 510 and 590, not 500 and 600.
Sizes 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 30. Only four line-height ratios exist:
**1.252** (buttons, tabs, chips), **1.35** (titles, rows), **1.5** (body, lists), **1.6** (paragraphs).
17 px is the default reading size — larger than most systems, because the whole system is one-handed mobile.

**Spacing.** The screen gutter is **24 px**; the bottom-CTA gutter is **20 px**, so the primary
button is visibly wider than the list above it. Gaps come from 4 / 6 / 8 / 10 / 12 / 14 / 16 / 20.
List rows use vertical padding S 8 / M 12 / L 16 / XL 20 with a 44 pt minimum height.

**Corner radii.** 8, 10, 12, 13, 14, 16, 20, 24, 28, pill — scaling with the element, not snapped
to a single value. Buttons: S 8, M 10, L 14, XL 16. Dialog 24. Bottom sheet 28. Chips and toasts
are full pills.

**Cards.** TDS barely has cards. Grouping is done with *fill and gap*, not with borders and
shadows: a section is white content on a grey background, separated by a 12 px thick `Border`.
Where a card does appear (grid-list tile) it is a 9 px-radius 2 %-black tint with no shadow at all.

**Borders.** Hairlines are almost invisible: `rgba(2,32,71,0.05)` for dividers,
`rgba(0,27,55,0.1)` for outlined controls. Borders are inset box-shadows more often than real
borders, so they do not affect layout.

**Shadows.** Four, all shallow: `tiny` `0 1px 2px rgba(0,0,0,.09)` (segmented pill),
`weak` `0 1px 3px rgba(0,27,55,.1)` (spinner field), `medium` (double-layer, slider knob only),
`floating` `0 16px 60px rgba(0,27,55,.1)` (menus, tooltips). Inner shadows are used for hairlines,
not for depth.

**Transparency & blur.** Used only where content must scroll *behind* chrome: navigation capsules
(2 % black, blur 40), toast (`rgba(3,24,50,0.46)`, blur 30), menu (89 % white, blur 22 + inset white
hairline). Never decorative.

**Imagery.** The file is essentially imageless — vector icons plus a handful of placeholder
bitmaps. There is no photographic style to inherit. The one real bitmap is the placeholder
service icon in the navigation bar (`assets/images/service-logo.png`).

**Motion.** Short and eased, never bouncy: 150–300 ms on `cubic-bezier(.25,.1,.25,1)`.
Switch handle 180 ms, segmented pill 150 ms, progress/chart 300 ms.

**Hover.** Mobile-first — there is no designed hover state. On pointer devices, darken the fill.

**Press.** A **state layer**: a 26 %-black overlay drawn over the button fill (the source keeps an
explicit "State layer" node on every button variant). No scale-down, no shadow change.

**Disabled.** Uniform **0.3 opacity** on the whole control. TDS does not recolour disabled elements.

**Layout rules.** Navigation bar is fixed at 44 pt top; tab bar at 43 pt bottom; the bottom CTA is
pinned above the safe area. Content scrolls between them, with protection gradients at both seams.

---

## Iconography

The source ships an in-house icon family — roughly **7,200 glyphs** as individual Figma symbols.
Naming encodes both the concept and the style, with search synonyms appended:
`icon-arrow-right-mono,arrow,right,rightarrow,arrowright`.

- **`-mono`** — the interface set: single-colour flat paths, no strokes, drawn on a 24×24 box
  with the artwork inset (a chevron is only 6.4 × 10.9 px inside it). This is what UI uses.
- **`-fill`** — solid multi-shape versions, used for selected tab-bar items and status glyphs.
- **Neither suffix** — full-colour illustrative assets (money bags, characters, product art).
- **`Icn*` / bank names** — brand marks for ~100 Korean banks, cards, securities firms and insurers.

Icons are **vector paths extracted from the file**, not a font and not a CDN set. They live in
`assets/icons/icon-data.js` and render through the `Icon` wrapper. Single-colour glyphs paint with
`currentColor`. Standard sizes: 16, 20, 24, 28, 30.

Unicode characters are used as icons in exactly two places — the `•` list marker and `1.` ordered
markers in `Post` / `BottomInfo`. Emoji are never used as icons.

**Coverage caveat:** 501 of the ~7,200 glyphs are materialised here — the complete mono/fill
interface set that UI actually reaches for, plus the arrows, states and finance glyphs used by the
UI kit. The remaining bulk is the illustrative and bank-brand catalogue; the .fig virtual filesystem
would not enumerate it in full. Ask if you need a specific glyph pulled across.

---

## Index

```
styles.css              ← the single entry point consumers link
tokens/
  fig-tokens.css        683 Figma Variables, all 8 collections, light + dark + iOS/Android modes
  fig-typography.css    (empty — the source defines no Figma text styles)
  fonts.css  typography.css  radius.css  spacing.css  elevation.css  base.css
assets/
  icons/                icon-data.js (501 glyphs) + Icon.jsx + Icon.d.ts
  images/               service-logo.png · status-{time,wifi,signal}[-dark].svg · keyboard-ios.png
components/
  core/        Button · TextButton · IconButton · Badge · Chip · ChipAccessory · Border ·
               Asset · Title
  forms/       Checkbox · Switch · TextField · TextArea · PasswordField · SelectorField ·
               ClearButton · FieldPrefix · SearchField · NumericSpinner · NumberField ·
               StepButton · Slider · SliderKnob · SliderTooltip · Keypad · KeypadButton · Keyboard
  navigation/  Navigation · NavigationAndroid · Tab · TabItem · TabBar · TabBarItem ·
               SegmentedControl · SegmentedItem · ListHeader · HeaderAccessory · ListFooter ·
               BottomCTA · StatusBar · HomeIndicator
  feedback/    Loader · ProgressBar · Toast · Tooltip · Dialog · BottomSheet · SheetBody ·
               Result · Bubble · Menu · MenuItem · ButtonArea · SelectionRow
  content/     Top · ListRow · ListRowText · LeftAccessory · RightAccessory · TableRow ·
               BoardRow · GridList · GridListItem · BankPicker · BarChart · Bar · Rating ·
               StarIcon · Stepper · StepperRow · StepIcon · ProgressStepper · Post · BottomInfo
guidelines/             21 foundation specimen cards (Colors, Type, Spacing, Brand)
ui_kits/apps_in_toss/   4-screen click-through mini-app — start at index.html
SKILL.md                Agent Skills manifest
```

### Components

Asset, Badge, BankPicker, Bar, BarChart, BoardRow, Border, BottomCTA, BottomInfo, BottomSheet,
Bubble, Button, ButtonArea, Checkbox, Chip, ChipAccessory, ClearButton, Dialog, FieldPrefix,
GridList, GridListItem, HeaderAccessory, HomeIndicator, Icon, IconButton, Keyboard, Keypad,
KeypadButton, LeftAccessory, ListFooter, ListHeader, ListRow, ListRowText, Loader, Menu, MenuItem,
Navigation, NavigationAndroid, NumberField, NumericSpinner, PasswordField, Post, ProgressBar,
ProgressStepper, Rating, Result, RightAccessory, SearchField, SegmentedControl, SegmentedItem,
SelectionRow, SelectorField, SheetBody, Slider, SliderKnob, SliderTooltip, StarIcon, StatusBar,
StepButton, StepIcon, Stepper, StepperRow, Switch, Tab, TabBar, TabBarItem, TabItem, TableRow,
TextArea, TextButton, TextField, Title, Toast, Tooltip, Top.

Each has a sibling `.d.ts` (props contract) and `.prompt.md` (what & when, usage, variants).

---

## Coverage, substitutions and caveats

**Component families.** The source lists **355 component sets**. **75 components** are built here:
one per *published* family (the pages of the Figma file — Button, Badge, Chip, Toast, …), one per
distinct **field type** the Text Field set defines (`TextField`, `TextArea`, `PasswordField`,
`SelectorField`), the Android navigation bar as its own component (`NavigationAndroid` — a
genuinely different 56dp layout, not a theme of the iOS bar), and every `.primitive / …` sub-part
that is reusable on its own — `Asset`, `Title`, `ChipAccessory`, `ListRowText`, `LeftAccessory`,
`RightAccessory`, `GridListItem`, `BankPicker`, `Bar`, `StarIcon`, `StepIcon`, `StepperRow`,
`TabItem`, `TabBarItem`, `SegmentedItem`, `HeaderAccessory`, `MenuItem`, `ButtonArea`,
`SelectionRow`, `SheetBody`, `KeypadButton`, `NumberField`, `StepButton`, `ClearButton`,
`FieldPrefix`, `SliderKnob`, `SliderTooltip`, `Keyboard`, `StatusBar`, `HomeIndicator`.

The sets that remain unbuilt are **deliberately skipped**, in four groups:

1. **Per-value permutations of one control** — `Progress=10…100 × Size × Color` (120 sets),
   `.primitive / Rating / Read Only` (165 variants), `.primitive / Bar Chart / Bars`
   (77 variants), `Slider Value=0…100`, `Badge/Button colour × size × state` matrices.
   These are a single component with a `value` / `size` / `color` prop, not distinct components.
2. **Layout-slot wrappers with no visual of their own** — `.Left Acc v2 / Frame`,
   `.primitive / Top / Text Area`, `.primitive / Bottom Sheet / Body / Slot Container`,
   ` Util/.Slot`, `.primitive / Option`. They exist so Figma can swap instances; in code they
   are `children`.
3. **Documentation and authoring scaffolding** — `.docs / Row`, `.docs / Header`,
   `.docs / Condition`, `.docs / Not Applicable`, `🛠️ tools / Callout`, `🛠️ tools / Ruler / *`,
   `🛠️ tools / Line`, `🛠️ tools / Token Studio Banner`, `_assets`, `TDS Guideline Header`.
   These annotate the Figma file itself and are not product UI.
4. **Example flow frames** — `🌈 OCR 신분증 인증`, `🌈 PhotoUploadFlow`, ` 시스템 공유 플로우`,
   `🌈 Screen`, the `Templates` and `Cover` / `Lisence` pages. These are demonstrations assembled
   from the components above, not components.

The ~7,200 individual icon symbols also count toward the tool's family total; they are data, not
components, and ship through `Icon` (see the iconography caveat above).

Say the word if you want any of group 1 or 2 promoted anyway.

**Text styles.** `/METADATA.md` lists **no** Text-styles section, and `fig_materialize` extracted
**0** text and effect styles — the file styles text ad-hoc on each layer. The type scale in
`tokens/typography.css` was therefore reconstructed by transcribing the actual size/weight/
line-height combinations used across the file.

**Fonts — SUBSTITUTION, please confirm.** The .fig references **SF Pro** (Apple's system UI face)
and **Toss Product Sans OTF**. Neither binary ships in the file and neither is redistributable, so
no `@font-face` is declared. `--tds-font-system` resolves SF Pro natively on Apple platforms and
falls back to **Noto Sans KR** (loaded from Google Fonts) elsewhere; `--tds-font-product` falls back
to the same stack. **If you can supply the real font files, drop them in and the substitution
disappears.**

**No logo.** The source contains no TDS or company logo, wordmark or brand mark. Nothing was
invented — the brand card renders the product name in type, and the navigation component takes a
service logo as a prop.

**Intentional additions.** One: **`Icon`**, a wrapper around the extracted glyph data. The source
ships each glyph as a bare symbol with no component API, and consuming code needs a single
predictable way to render one.

**Approximations to flag.** Badge/Button/IconButton size steps not present in the file were not
invented — every listed size was read from a variant. `Stepper` number glyphs above 7 fall back to
plain digits (the source only draws 1–7). `StatusBar` (iOS) and `Keyboard` use the real assets
extracted from the file — `status-time.svg`, `status-wifi.svg`, `status-signal.svg` and the
375×292 `keyboard-ios.png` — so both take an `assetBase` prop pointing back at the project root.
