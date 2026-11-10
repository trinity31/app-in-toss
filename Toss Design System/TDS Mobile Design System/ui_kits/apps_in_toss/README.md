# UI kit — Apps in Toss (mini-app)

A click-through recreation of a mini-app running inside the host wallet, built entirely from
this design system's own components. Four screens:

| Screen | File | Source frames read |
|---|---|---|
| Account home | `HomeScreen.jsx` | /Top, /List-Row, /Grid-List, /Bar-Chart, /Tab-Bar, /Navigation---AppsinToss |
| Transfer amount | `TransferScreen.jsx` | /Keypad, /Text-Field, /Bottom-CTA, /Top |
| Detail + FAQ | `DetailScreen.jsx` | /Table-Row, /Board-Row, /Post, /Bottom-Info, /List-Header-V3, /List-Footer |
| Settings | `SettingsScreen.jsx` | /List-Row, /Switch, /Segmented-Control, /Checkbox, /Rating, /Progress-Stepper |

Overlays (Toast, Dialog, BottomSheet, Menu, Tooltip, Loader) are triggered from the screens.

Open `index.html`. The phone frame is 375×812 — the canvas width the source .fig designs against.
