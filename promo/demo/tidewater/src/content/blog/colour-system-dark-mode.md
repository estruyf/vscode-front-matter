---
title: "A colour system that survives dark mode"
description: "How we name colour tokens so a theme switch never needs a second design review."
pubDate: 2026-09-10T09:00:00.000Z
heroImage: /images/colour-tokens.jpg
author: aiko-tanaka
category: Design
tags:
  - design-systems
  - css
  - accessibility
featured: false
draft: false
---

Every colour in our design system has two names: what it is, and what it is for. Only the second one is allowed in a component.

## Tokens by purpose

`surface`, `surface-raised`, `text`, `text-muted`, `accent`. A theme is nothing more than a table that maps those names to values.

## Checking contrast once

Because components never reference a raw colour, we check contrast on the table, not on every screen.
