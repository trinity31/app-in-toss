import React from 'react';
import { GLYPHS } from './statusbar-glyphs.js';

/* GLYPHS holds the verbatim contents of the status-bar SVGs extracted from the
   source .fig (assets/images/status-*.svg) as data URIs, so the component has no
   path to resolve and cannot break when embedded at an arbitrary page depth. */
const A = {
  light: { time: GLYPHS['status-time'], wifi: GLYPHS['status-wifi'], signal: GLYPHS['status-signal'], ink: 'rgb(0,0,0)' },
  dark: { time: GLYPHS['status-time-dark'], wifi: GLYPHS['status-wifi-dark'], signal: GLYPHS['status-signal-dark'], ink: 'rgb(255,255,255)' },
};

/** Device status bar. iOS uses the glyphs extracted from the source file. */
export function StatusBar({ os = 'ios', theme = 'light', style, ...rest }) {
  const a = A[theme] || A.light;

  if (os === 'android') {
    /* Android Status Bar — 360×24, 8 %-black plate, 46×10 status mask at x306 y7. No clock. */
    return (
      <div style={{ position: 'relative', width: '100%', height: 24, background: 'rgba(33,33,33,0.08)', flexShrink: 0, ...style }} {...rest}>
        <svg width="46" height="10" viewBox="0 0 46 10" fill={theme === 'dark' ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)'} style={{ position: 'absolute', right: 8, top: 7 }}>
          <path d="M 10 0 L 0 0 L 0 10 L 10 10 L 10 0 Z M 18 5 C 18 2.239 20.239 0 23 0 C 25.761 0 28 2.239 28 5 C 28 7.761 25.761 10 23 10 C 20.239 10 18 7.761 18 5 Z M 40 10 L 46 0 L 34 0 L 40 10 Z" fillRule="evenodd" />
        </svg>
      </div>
    );
  }

  /* iOS Status bar (iPhone X or newer) — 375×50 */
  return (
    <div style={{ position: 'relative', width: '100%', height: 50, overflow: 'hidden', flexShrink: 0, ...style }} {...rest}>
      <div style={{ position: 'absolute', left: 21, top: 12, width: 54, height: 21, borderRadius: 32 }}>
        <img src={a.time} alt="9:41" style={{ position: 'absolute', left: 12.453, top: 5.167, width: 28.426, height: 11.089 }} />
      </div>
      <div style={{ position: 'absolute', right: 14.672, top: 17.331, width: 66.661, height: 11.336 }}>
        <img src={a.signal} alt="" style={{ position: 'absolute', left: 0, top: 0.336, width: 17, height: 10.667 }} />
        <img src={a.wifi} alt="" style={{ position: 'absolute', left: 22.027, top: 0, width: 15.272, height: 10.966 }} />
        <div style={{ position: 'absolute', left: 42.333, top: 0.003, width: 24.328, height: 11.333 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 22, height: 11.333, borderRadius: 2.6666667461395264, boxShadow: `inset 0 0 0 1px ${a.ink}`, opacity: 0.35 }} />
          <div style={{ position: 'absolute', left: 2, top: 2, width: 18, height: 7.333, borderRadius: 1.3333333730697632, background: a.ink }} />
          <div style={{ position: 'absolute', left: 23.1, top: 3.9, width: 1.228, height: 3.6, borderRadius: 1, background: a.ink, opacity: 0.4 }} />
        </div>
      </div>
    </div>
  );
}
