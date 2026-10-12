import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop, Progress } from './components/Backdrop';
import { Cut, Part } from './cut';
import { Outro } from './scenes/Outro';
import { Title } from './scenes/Title';
import MANIFEST from '../public/clips.json';
import {
  CREATE, CreateBeat, EditBeat, editLength, LEFT, SNIPPET, SnippetBeat, StillShot,
} from './shots';
import { TOUR_DURATION } from './theme';

// Ninety seconds, every screen, in the order someone new to it would meet them:
// the content, editing it, making more of it, then everything around it.

const clips = MANIFEST as Record<string, { frames: number }>;
const beat = (name: string, b: { holdIn: number; rate: number; tail: number }) =>
  b.holdIn + Math.round(clips[name].frames / b.rate) + b.tail;

const still = (name: string, duration: number, line: { kicker: string; headline: string; note?: string }, rect?: typeof LEFT): Part => ({
  name,
  duration,
  render: (d) => <StillShot name={name} duration={d} line={line} rect={rect} />,
});

const PARTS: Part[] = [
  { name: 'title', duration: 96, render: () => <Title /> },
  still('contents', 220, {
    kicker: 'Dashboard',
    headline: 'Every post on your site, with its status, date and tags.',
    note: 'Read straight from the Markdown files in your repository.',
  }),
  still('drafts', 170, {
    kicker: 'Dashboard',
    headline: 'Filter down to what is still in draft.',
    note: 'Search, sort, group and filter by any tag.',
  }),
  { name: 'edit', duration: editLength(clips.edit.frames), render: (d) => <EditBeat duration={d} /> },
  still('editor', 220, {
    kicker: 'Content health',
    headline: 'Readability checks, while you write.',
    note: 'A readability score, sentence length and word length for the open post.',
  }, LEFT),
  { name: 'create', duration: beat('create', CREATE), render: (d) => <CreateBeat duration={d} /> },
  still('media', 210, {
    kicker: 'Media',
    headline: 'Your images, where your site keeps them.',
    note: 'Browse the folders, search them, and see every image\'s size.',
  }),
  still('snippets', 160, {
    kicker: 'Snippets',
    headline: 'The components your posts use, as snippets.',
    note: 'Content snippets and media snippets, each with a description.',
  }),
  { name: 'snippet', duration: beat('snippet', SNIPPET), render: (d) => <SnippetBeat duration={d} /> },
  still('data', 210, {
    kicker: 'Data',
    headline: 'Data files, edited with a form.',
    note: 'Pick an entry and it opens as a form, one field per property.',
  }),
  still('taxonomy', 210, {
    kicker: 'Taxonomies',
    headline: 'Every tag, and how many posts use it.',
  }),
  { name: 'outro', render: () => <Outro /> },
];

export const Tour: React.FC = () => (
  <AbsoluteFill>
    <Backdrop total={TOUR_DURATION} />
    <Cut parts={PARTS} total={TOUR_DURATION} />
    <Progress total={TOUR_DURATION} />
  </AbsoluteFill>
);
