import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { DURATION, T } from '../theme';

/// The ground the whole piece sits on. It never cuts — scenes dissolve over it —
/// so the accent drifting across the runtime is the only thing that says the
/// frame is still alive during a long hold.
///
/// Take the glow from whatever the product's own page puts behind its hero, at
/// the same corners. `T.glow` is that colour as an rgb triple.
export const Backdrop: React.FC<{ total?: number }> = ({ total = DURATION }) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, total], [0, 1]);
  const glowX = interpolate(drift, [0, 1], [74, 62]);

  return (
    <AbsoluteFill style={{ backgroundColor: T.ground }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1150px 640px at ${glowX}% -10%, rgba(${T.glow},0.20), transparent 66%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(950px 620px at ${100 - glowX}% 108%, rgba(${T.glow},0.10), transparent 64%)`,
        }}
      />
      {/* A faint pull on the corners, so the frame has an edge. */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(1500px 900px at 50% 46%, transparent 45%, rgba(14,19,31,0.08) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/// A hairline filling across the bottom edge over the full runtime. It is the
/// only element that never dissolves, so it doubles as a progress bar and as the
/// one piece of gold that is always on screen.
export const Progress: React.FC<{ total?: number }> = ({ total = DURATION }) => {
  const frame = useCurrentFrame();
  const pct = interpolate(frame, [0, total - 1], [0, 100], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: 3,
        backgroundColor: 'rgba(14,19,31,0.06)',
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          backgroundColor: T.accent,
          boxShadow: `0 0 14px ${T.accent}`,
        }}
      />
    </div>
  );
};
