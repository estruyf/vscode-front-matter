import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { SANS, T } from '../theme';

const ease = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
  easing: Easing.bezier(0.22, 1, 0.36, 1),
} as const;

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const line = (delay: number) => ({
    opacity: interpolate(frame, [delay, delay + 18], [0, 1], ease),
    transform: `translateY(${interpolate(frame, [delay, delay + 18], [16, 0], ease)}px)`,
  });

  return (
    <AbsoluteFill
      style={{ justifyContent: 'center', alignItems: 'center', fontFamily: SANS, textAlign: 'center' }}
    >
      <div style={{ ...line(0), display: 'flex', alignItems: 'center', gap: 24 }}>
        <Img src={staticFile('logo.svg')} style={{ width: 84, height: 84 }} />
        <span style={{ fontSize: 66, fontWeight: 700, letterSpacing: -1.8, color: T.bright }}>
          Front Matter CMS
        </span>
      </div>

      <div style={{ ...line(8), marginTop: 30, fontSize: 42, fontWeight: 600, color: T.bright }}>
        Your content stays Markdown, in your repository.
      </div>

      {/* The URL is the one thing anyone needs to take away, so it gets a card of
          its own rather than another line of copy. */}
      <div
        style={{
          ...line(16),
          marginTop: 44,
          padding: '22px 44px',
          borderRadius: 14,
          backgroundColor: T.panel,
          border: `1px solid ${T.line}`,
          boxShadow: '0 24px 60px rgba(14,19,31,0.14)',
          fontSize: 36,
          fontWeight: 600,
          color: T.bright,
        }}
      >
        frontmatter<span style={{ color: T.accentInk }}>.codes</span>
      </div>

      <div style={{ ...line(24), marginTop: 26, fontSize: 25, color: T.muted }}>
        Install it from the Visual Studio Code Marketplace.
      </div>

      <div style={{ ...line(32), marginTop: 40, fontSize: 22, color: T.faint }}>
        Free &middot; Open source &middot; MIT licensed
      </div>
    </AbsoluteFill>
  );
};
