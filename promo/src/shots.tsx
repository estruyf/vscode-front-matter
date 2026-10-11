import React from 'react';
import { Sequence } from 'remotion';
import { Caption } from './components/Caption';
import { Rect, WINDOW } from './components/Framed';
import { Clip, creep, Shot, Still } from './components/Shot';

// Every shot both cuts use, in one place, so the promo and the tour say the
// same thing about the same screen.
//
// Crops are in the capture's own 2560x1640, read off the files in public/shots.

/// The whole window. The only crop whose every edge is the window's own.
export const DESK: Rect = WINDOW;

/// The left three-quarters: the panel and the start of every editor line, or
/// on the dashboard, the first three columns of cards. The right edge sits in
/// the gutter between the third and fourth card (x 1892–1924) — on the editor
/// it cuts running text, which reads as a zoom rather than a fault.
export const LEFT: Rect = { x: 0, y: 0, w: 1908, h: 1640 };

type Line = { kicker: string; headline: string; note?: string };

/// A caption that hands over to the next one at the given scene frames. The
/// switch frames are the numbers to re-check after every capture: nothing
/// recomputes them.
const Captions: React.FC<{ lines: (Line & { at: number })[]; total: number; where: 'wide' | 'side' }> = ({
  lines,
  total,
  where,
}) => (
  <>
    {lines.map((line, i) => {
      const end = i + 1 < lines.length ? lines[i + 1].at : total;
      return (
        <Sequence key={i} from={line.at} durationInFrames={end - line.at} layout="none">
          <Caption where={where} {...line} outAt={i + 1 < lines.length ? end - line.at - 12 : undefined} />
        </Sequence>
      );
    })}
  </>
);

export const StillShot: React.FC<{ name: string; line: Line; duration: number; rect?: Rect }> = ({
  name,
  line,
  duration,
  rect = DESK,
}) => {
  const side = rect.w / rect.h < 1.4;
  return (
    <Shot
      stage={side ? 'side' : 'wide'}
      rectAt={() => rect}
      scaleAt={creep(1, 1.018, duration)}
      aside={<Caption where={side ? 'side' : 'wide'} {...line} />}
    >
      <Still name={name} />
    </Shot>
  );
};

// ---- the recorded beats --------------------------------------------------
//
// Scene frame = holdIn + clip frame / rate. The `at` values below are scene
// frames, set against where things happen in each clip:
//
//   edit     card clicked ~40, panel open ~64, typing ~135–245, the YAML shows
//            it ~250, Draft switched off ~345, clip ends 374
//   create   (whole window: VS Code's quick input and its toasts sit across
//            LEFT's right edge) folder picked ~70, title typed ~110–200, the new file
//            open ~230, its panel filled ~235
//   snippet  dashboard ~40, Callout's insert ~110, Insert pressed ~205, the
//            paragraph wrapped ~215

export const EDIT = { holdIn: 30, rate: 1, tail: 70 };
export const editLength = (clip: number) => EDIT.holdIn + clip + EDIT.tail;

export const EditBeat: React.FC<{ duration: number }> = ({ duration }) => (
  <Shot
    stage="side"
    rectAt={() => LEFT}
    aside={
      <Captions
        where="side"
        total={duration}
        lines={[
          { at: 0, kicker: 'Editing', headline: 'Open a post from the dashboard.', note: 'Its fields open in the panel beside it.' },
          { at: 160, kicker: 'Editing', headline: 'Fill in fields, not YAML.', note: 'Every change is written to the Markdown file as you type.' },
          { at: 362, kicker: 'Publishing', headline: 'One switch takes it out of draft.', note: 'draft: false, in the same file your site builds from.' },
        ]}
      />
    }
  >
    <Clip name="edit" beat={{ holdIn: EDIT.holdIn, rate: EDIT.rate, total: duration }} />
  </Shot>
);

export const CREATE = { holdIn: 24, rate: 1, tail: 60 };

export const CreateBeat: React.FC<{ duration: number }> = ({ duration }) => (
  <Shot
    stage="wide"
    rectAt={() => DESK}
    aside={
      <Captions
        where="wide"
        total={duration}
        lines={[
          { at: 0, kicker: 'New content', headline: 'Pick a folder, give it a title.' },
          { at: 258, kicker: 'New content', headline: 'It opens with its front matter filled in.', note: 'Every field from the content type, ready to edit.' },
        ]}
      />
    }
  >
    <Clip name="create" beat={{ holdIn: CREATE.holdIn, rate: CREATE.rate, total: duration }} />
  </Shot>
);

export const SNIPPET = { holdIn: 24, rate: 1, tail: 64 };

export const SnippetBeat: React.FC<{ duration: number }> = ({ duration }) => (
  <Shot
    stage="wide"
    rectAt={() => DESK}
    aside={
      <Captions
        where="wide"
        total={duration}
        lines={[
          { at: 0, kicker: 'Snippets', headline: 'Select a paragraph, pick a snippet.' },
          { at: 238, kicker: 'Snippets', headline: 'It comes back wrapped in your component.' },
        ]}
      />
    }
  >
    <Clip name="snippet" beat={{ holdIn: SNIPPET.holdIn, rate: SNIPPET.rate, total: duration }} />
  </Shot>
);
