import React from 'react';
import { interpolate } from 'remotion';
import { SOURCE } from '../theme';

/// A rectangle in the capture's own coordinates — 2560x1640, the numbers you
/// would read off a file in public/shots in Preview. Every shot says what part
/// of the window it is looking at in these terms and `Framed` works out the
/// scale, so a crop can be re-measured without touching any layout.
export type Rect = { x: number; y: number; w: number; h: number };

/// The whole window.
export const WINDOW: Rect = { x: 0, y: 0, w: SOURCE.width, h: SOURCE.height };

// Name the crops your own cut uses in the composition files, not here — they are
// measured off the files in public/shots and mean nothing outside this project.

export const aspect = (r: Rect) => r.w / r.h;

/// Moves between two crops. Everything eases together, so a push in reads as one
/// continuous move rather than four numbers sliding apart.
export const between = (a: Rect, b: Rect, t: number): Rect => ({
  x: interpolate(t, [0, 1], [a.x, b.x]),
  y: interpolate(t, [0, 1], [a.y, b.y]),
  w: interpolate(t, [0, 1], [a.w, b.w]),
  h: interpolate(t, [0, 1], [a.h, b.h]),
});

/// Grows `rect` about its own centre — the push that keeps a long hold from
/// going dead. It scales the *crop*, so unlike scaling the mounted card it can
/// walk off the edge of the picture; keep the factor small.
export const zoom = (rect: Rect, factor: number): Rect => ({
  x: rect.x + (rect.w * (1 - factor)) / 2,
  y: rect.y + (rect.h * (1 - factor)) / 2,
  w: rect.w * factor,
  h: rect.h * factor,
});

/// Shows `rect` of the source at `width` x `height`. The child is laid out at
/// the source's full size and then scaled and shifted underneath a window that
/// clips it, which is why a crop can move without the video ever being
/// re-encoded and why a still and a recording can share one component.
export const Framed: React.FC<{
  rect: Rect;
  width: number;
  height: number;
  /// The natural size of what is being cropped. The desktop capture by default;
  /// the phone shot is 804x1748 and says so.
  natural?: { w: number; h: number };
  children: React.ReactNode;
}> = ({ rect, width, height, natural, children }) => {
  const full = natural ?? { w: SOURCE.width, h: SOURCE.height };
  const scale = width / rect.w;
  return (
    <div style={{ width, height, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: full.w,
          height: full.h,
          transformOrigin: '0 0',
          transform: `scale(${scale}) translate(${-rect.x}px, ${-rect.y}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/// The largest box of this aspect that fits inside `maxW` x `maxH`. Shots come
/// in shapes the app chose, not shapes the promo did — the whole window is
/// 1.56:1, a phone is 0.46:1, a crop of the day bar is nearly 4:1 — and a stage
/// that fits each of them rather than stretching them is what lets one layout
/// carry all three.
export const fit = (ratio: number, maxW: number, maxH: number) => {
  const byHeight = { w: maxH * ratio, h: maxH };
  return byHeight.w <= maxW ? byHeight : { w: maxW, h: maxW / ratio };
};
