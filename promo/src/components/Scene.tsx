import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { XFADE } from '../theme';

/// Scenes are laid end to end with `XFADE` frames of overlap and dissolve
/// through it. The backdrop underneath never cuts, so what the eye sees is the
/// content changing rather than the picture being replaced.
export const Scene: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const enter = interpolate(frame, [0, XFADE], [0, 1], clamp);
  const leave = interpolate(frame, [duration - XFADE, duration], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enter, leave),
        transform: `scale(${interpolate(enter, [0, 1], [0.988, 1])})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
