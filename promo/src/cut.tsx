import React from 'react';
import { Sequence } from 'remotion';
import { Scene } from './components/Scene';
import { XFADE } from './theme';

/// A scene in a cut: how long it runs (cross-dissolve into the next included)
/// and what it shows. The last scene of a cut takes whatever is left.
export type Part = { name: string; duration?: number; render: (duration: number) => React.ReactNode };

/// Lays the scenes end to end, each starting XFADE frames before the previous
/// one ends, and gives the last one the remainder of `total`. Throws rather
/// than letting the outro shrink to nothing when a beat grows after a
/// re-capture.
export const lay = (parts: Part[], total: number) => {
  let from = 0;
  return parts.map((part, i) => {
    const last = i === parts.length - 1;
    const duration = last ? total - from : part.duration!;
    if (last && duration < 120) {
      throw new Error(`${part.name}: ${duration} frames left for it — shorten something earlier`);
    }
    const placed = { ...part, from, duration };
    from += duration - XFADE;
    return placed;
  });
};

export const Cut: React.FC<{ parts: Part[]; total: number }> = ({ parts, total }) => (
  <>
    {lay(parts, total).map((p) => (
      <Sequence key={p.name} name={p.name} from={p.from} durationInFrames={p.duration}>
        <Scene duration={p.duration}>{p.render(p.duration)}</Scene>
      </Sequence>
    ))}
  </>
);
