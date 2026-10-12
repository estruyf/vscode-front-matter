import React from 'react';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { CAPTION_BASELINE, COLUMN, HEIGHT, SANS, T } from '../theme';

const rise = (frame: number, delay: number) => {
  const t = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  return { opacity: t, transform: `translateY(${(1 - t) * 16}px)` };
};

/// Above the card, or in a column beside it. On the `wide` stage the block is
/// bottom-aligned to `CAPTION_BASELINE` rather than top-aligned, so a headline
/// that wraps grows up into the empty frame instead of down into the picture.
export const Caption: React.FC<{
  kicker: string;
  headline: string;
  note?: string;
  where?: 'wide' | 'side';
  /// Fades the block out again this many frames before the shot ends, for the
  /// shots where the caption changes while the camera does not.
  outAt?: number;
}> = ({ kicker, headline, note, where = 'wide', outAt }) => {
  const frame = useCurrentFrame();
  const side = where === 'side';
  const out =
    outAt === undefined
      ? 1
      : interpolate(frame, [outAt, outAt + 12], [1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return (
    <div
      style={{
        position: 'absolute',
        left: side ? COLUMN.left : 0,
        width: side ? COLUMN.width : '100%',
        top: 0,
        height: side ? HEIGHT : CAPTION_BASELINE,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: side ? 'center' : 'flex-end',
        alignItems: side ? 'flex-start' : 'center',
        textAlign: side ? 'left' : 'center',
        fontFamily: SANS,
        opacity: out,
      }}
    >
      <div
        style={{
          ...rise(frame, 0),
          fontSize: side ? 19 : 21,
          fontWeight: 600,
          letterSpacing: side ? 3.2 : 3.6,
          textTransform: 'uppercase',
          color: T.accentInk,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          ...rise(frame, 4),
          marginTop: side ? 20 : 16,
          maxWidth: side ? COLUMN.width : 1420,
          fontSize: side ? 44 : 50,
          lineHeight: 1.14,
          fontWeight: 600,
          letterSpacing: -0.7,
          color: T.bright,
          // Chrome balances the lines rather than leaving one word stranded on
          // the last one, which a 50px headline makes very obvious.
          textWrap: 'balance',
        }}
      >
        {headline}
      </div>
      {note ? (
        <div
          style={{
            ...rise(frame, 10),
            marginTop: side ? 20 : 12,
            maxWidth: side ? COLUMN.width : 1120,
            fontSize: side ? 23 : 24,
            lineHeight: side ? 1.45 : 1.35,
            color: T.muted,
            textWrap: 'pretty',
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};
