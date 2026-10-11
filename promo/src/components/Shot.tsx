import React from 'react';
import { AbsoluteFill, Freeze, Img, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SOURCE, STAGE, T, WIDTH } from '../theme';
import { fit, Framed, Rect } from './Framed';
import MANIFEST from '../../public/clips.json';

/// The picture, mounted. A dark window on a light ground separates on its own;
/// the shadow is what lifts it off the page, and the hairline keeps the corner
/// crisp where the window's own dark edge meets the shadow.
const Card: React.FC<{
  top: number;
  left: number;
  width: number;
  height: number;
  scale: number;
  children: React.ReactNode;
}> = ({ top, left, width, height, scale, children }) => (
  <div
    style={{
      position: 'absolute',
      top,
      left,
      width,
      height,
      transform: `scale(${scale})`,
      transformOrigin: '50% 50%',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: -1,
        borderRadius: 19,
        background: 'linear-gradient(180deg, rgba(14,19,31,0.35), rgba(14,19,31,0.6))',
        boxShadow: '0 50px 110px rgba(14,19,31,0.28), 0 10px 30px rgba(14,19,31,0.22)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: T.window,
      }}
    >
      {children}
    </div>
  </div>
);

/// The natural size of a still, where it is not the shared viewport. Everything
/// in public/shots is a 1280x820 window at 2x except the phone, which is the one
/// screen the app lays out differently rather than merely narrower.
export const SHOT_SIZE: Record<string, { w: number; h: number }> = {
  mobile: { w: 804, h: 1748 },
};

export const naturalOf = (name?: string) =>
  (name && SHOT_SIZE[name]) || { w: SOURCE.width, h: SOURCE.height };

/// A still out of public/shots, at the size it was captured.
export const Still: React.FC<{ name: string }> = ({ name }) => {
  const size = naturalOf(name);
  return (
    <Img
      src={staticFile(`shots/${name}.png`)}
      style={{ position: 'absolute', top: 0, left: 0, width: size.w, height: size.h }}
    />
  );
};

const layer: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: SOURCE.width,
  height: SOURCE.height,
};

/// One frame of a recording, held. `Freeze` pins the clock for its children, so
/// the video seeks to `frame` and stays there — the same pixels the moving clip
/// would show, which is what keeps a hold and the play either side of it from
/// flickering as they hand over.
const Held: React.FC<{ src: string; frame: number }> = ({ src, frame }) => (
  <Freeze frame={0}>
    <OffthreadVideo src={src} trimBefore={frame} muted style={layer} />
  </Freeze>
);

export type Beat = {
  /// How long to sit on the first frame while the caption is read.
  holdIn: number;
  /// Where in the recording the moving part starts. Left out, from the top.
  from?: number;
  /// How much of the recording to use. Left out, all of it — which is almost
  /// always right, because `prepare` in capture.mjs keeps the setting-up out of
  /// the file in the first place.
  play?: number;
  /// Below 1 slows it down. The app was driven at working speed and a promo
  /// needs longer than that to land.
  rate: number;
  /// Total length of the shot, cross-dissolve included. Whatever is left after
  /// the hold and the play is spent holding on where it came to rest.
  total: number;
};

/// How long each recording is, written by `npm run capture`.
///
/// Read from the manifest rather than copied into the tables below: a beat
/// re-recorded a second slower would otherwise cut before its own payoff, and
/// nothing about the composition would say so.
const lengthOf = (name: string): number => {
  const entry = (MANIFEST as Record<string, { frames: number } | undefined>)[name];
  if (!entry) {
    throw new Error(`no clip "${name}" in public/clips.json — run npm run capture`);
  }
  return entry.frames;
};

/// Hold, play, hold — the shape every recorded beat is cut to. Slowing the whole
/// shot down instead would make the pointer crawl; holding at either end buys
/// reading time without touching the pace of the part where something happens.
export const Clip: React.FC<{ name: string; beat: Beat }> = ({ name, beat }) => {
  const src = staticFile(`clips/${name}.mp4`);
  const from = beat.from ?? 0;
  const play = beat.play ?? lengthOf(name) - from;
  const restFrom = beat.holdIn + Math.round(play / beat.rate);
  return (
    <>
      <Sequence durationInFrames={beat.holdIn} layout="none">
        <Held src={src} frame={from} />
      </Sequence>
      <Sequence from={beat.holdIn} durationInFrames={restFrom - beat.holdIn} layout="none">
        <OffthreadVideo src={src} trimBefore={from} playbackRate={beat.rate} muted style={layer} />
      </Sequence>
      <Sequence from={restFrom} durationInFrames={Math.max(1, beat.total - restFrom)} layout="none">
        <Held src={src} frame={from + play - 1} />
      </Sequence>
    </>
  );
};

/// Where a shot sits in the frame, and what part of the window it is looking at.
///
/// `rectAt` is the camera: it says what the crop is on any given frame, which is
/// how a push in and a shot that never moves come out of the same component.
/// Every rect it returns has to share an aspect with the first one, or the
/// picture stretches on the way between them.
export const Shot: React.FC<{
  stage: keyof typeof STAGE;
  /// Names the still or clip being mounted, so the default crop and the scale
  /// are its own size rather than the shared viewport's. Only the phone shot
  /// needs it; everything else is captured through the same window.
  of?: string;
  rectAt?: (frame: number) => Rect;
  /// A whisper of a push, 1 to about 1.02 across the shot. It scales the mounted
  /// card rather than the crop, so the framing can never creep off the picture.
  scaleAt?: (frame: number) => number;
  children: React.ReactNode;
  /// Drawn over the picture, in the capture's own pixels, so it scales with it.
  overlay?: React.ReactNode;
  /// The caption, and anything else that belongs to the frame rather than the
  /// picture.
  aside?: React.ReactNode;
}> = ({ stage, of, rectAt, scaleAt, children, overlay, aside }) => {
  const frame = useCurrentFrame();
  const natural = naturalOf(of);
  const camera = rectAt ?? (() => ({ x: 0, y: 0, w: natural.w, h: natural.h }));
  const rect = camera(frame);
  const geometry = STAGE[stage];
  // The box is worked out from the *first* frame's crop, not this one: a push
  // that changes the aspect by a rounding error would otherwise resize the card
  // under the picture and shimmer its edges for the length of the move.
  const box = fit(camera(0).w / camera(0).h, geometry.maxW, geometry.maxH);
  const left = geometry.left === null ? (WIDTH - box.w) / 2 : geometry.left + (geometry.maxW - box.w) / 2;
  const top = geometry.top + (geometry.maxH - box.h) / 2;

  return (
    <AbsoluteFill>
      {aside}
      <Card top={top} left={left} width={box.w} height={box.h} scale={scaleAt?.(frame) ?? 1}>
        <Framed rect={rect} width={box.w} height={box.h} natural={natural}>
          {children}
          {overlay}
        </Framed>
      </Card>
    </AbsoluteFill>
  );
};

/// A gentle push, for the shots that hold still long enough to go dead.
export const creep =
  (from: number, to: number, over: number) =>
  (frame: number): number =>
    frame <= 0 ? from : frame >= over ? to : from + ((to - from) * frame) / over;
