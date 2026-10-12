import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop, Progress } from './components/Backdrop';
import { Cut, Part } from './cut';
import { Outro } from './scenes/Outro';
import { Title } from './scenes/Title';
import MANIFEST from '../public/clips.json';
import { EditBeat, editLength, StillShot } from './shots';
import { DURATION } from './theme';

// Thirty seconds, one argument: your Markdown site gets a CMS without leaving
// the editor or the repository. The edit beat carries it; everything around it
// is there so the beat has somewhere to happen.

const clips = MANIFEST as Record<string, { frames: number }>;

const PARTS: Part[] = [
  { name: 'title', duration: 90, render: () => <Title /> },
  {
    name: 'contents',
    duration: 126,
    render: (d) => (
      <StillShot
        name="contents"
        duration={d}
        line={{
          kicker: 'Dashboard',
          headline: 'Every post on your site, with its status, date and tags.',
          note: 'Read straight from the Markdown files in your repository.',
        }}
      />
    ),
  },
  { name: 'edit', duration: editLength(clips.edit.frames), render: (d) => <EditBeat duration={d} /> },
  {
    name: 'media',
    duration: 110,
    render: (d) => (
      <StillShot
        name="media"
        duration={d}
        line={{ kicker: 'Media', headline: 'Your images, where your site keeps them.' }}
      />
    ),
  },
  { name: 'outro', render: () => <Outro /> },
];

export const Promo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop total={DURATION} />
    <Cut parts={PARTS} total={DURATION} />
    <Progress total={DURATION} />
  </AbsoluteFill>
);
