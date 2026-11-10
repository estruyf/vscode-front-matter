// Borrow the product's palette rather than inventing one. The accent is the
// brand colour off its own landing page; the client/entity colours, if the app
// has any, come out of the fixture in ../demo.
//
// The ground is the one thing that is *not* the app's, and the choice is worth
// making deliberately: a dark app on ink disappears into it. VS Code is captured
// in Dark Modern, so the ground is light and the window is the one dark thing in
// the frame.
export const T = {
  ground: '#eef1f4',
  panel: '#ffffff',
  line: '#d5dbe2',
  /// Headlines, and the one dark thing on the ground: the window itself.
  bright: '#0e131f',
  text: '#1f2733',
  muted: '#525d6e',
  faint: '#7d8898',
  /// Front Matter's teal (tailwind `teal-500`). As text on the light ground it is
  /// too pale to read, so kickers use `accentInk`, the same hue taken darker.
  accent: '#15c2cb',
  accentInk: '#067c84',
  accentDeep: '#0bb8c1',
  /// The accent as an `r,g,b` triple, for the backdrop's glows.
  glow: '21,194,203',
  /// What shows under a crop's edge while a frame loads: VS Code's own
  /// editor background, so a late frame never flashes white.
  window: '#1f1f1f',
} as const;

export const SANS =
  'Inter, -apple-system, "SF Pro Display", "SF Pro Text", system-ui, "Segoe UI", sans-serif';
export const MONO = '"SF Mono", ui-monospace, Menlo, "JetBrains Mono", "Roboto Mono", monospace';

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 900; // the short promo, 30 seconds
export const TOUR_DURATION = 2700; // the tour, 90 seconds

/// Scenes overlap by this much and cross-dissolve through it.
export const XFADE = 12;

/// What the capture is, in its own pixels: the viewport in harness.mjs at 2x.
/// Every crop in the compositions is written in these numbers — the ones you
/// would read off a file in public/shots in Preview — and `Framed` works out the
/// scale.
export const SOURCE = { width: 2560, height: 1640 } as const;

/// The two stages a shot can be mounted on. Both cuts use the same two, so a cut
/// between a screenshot and a recording does not shift the picture sideways.
///
/// `wide` is for the whole window and for crops wider than about 2:1 — the
/// caption goes above and the picture gets the width of the frame.
///
/// `side` puts the caption in a column on the left and gives the picture nearly
/// the height of the frame. It is for anything taller than it is wide, which
/// includes every full-height crop — and full-height crops are common, because a
/// list that runs to the bottom of the window has no gap left to end a crop in
/// and the window's own edge is the only clean one.
///
/// Work out the scale before choosing: `cardWidth / (cropWidth / 2)`. Below
/// about 1.0x the app's own body text stops being comfortable at 1080p.
export const STAGE = {
  wide: { top: 258, maxW: 1560, maxH: 772, left: null },
  side: { top: 45, maxW: 1220, maxH: 990, left: 686 },
} as const;

/// The caption block is bottom-aligned to this line on the `wide` stage, so a
/// headline that wraps to two lines grows upwards and the gap above the card
/// never changes.
export const CAPTION_BASELINE = 222;

/// The left-hand caption column of the `side` stage.
export const COLUMN = { left: 92, width: 540 };

/// A file in `public/` to play under the whole thing, or `null` for silence.
/// Both cuts are made to read without sound — every claim either makes is on
/// screen — so a track is a choice rather than something the piece leans on. It
/// fades out over the last second either way.
export const MUSIC: string | null = null;
