---
title: "Self-hosting fonts without the layout shift"
description: "Subsetting, preloading and a fallback stack tuned until the swap is invisible."
pubDate: 2026-07-16T09:00:00.000Z
heroImage: /images/type-specimen.jpg
author: jonas-peeters
category: Engineering
tags:
  - css
  - performance
  - typography
featured: false
draft: false
---

This post is part of our studio journal, where we write down what we learn while building websites for our clients.

## The short version

Self-hosting fonts without the layout shift started as a note in a pull request. It grew into a checklist, and then into this post.

## What we do now

1. Write the decision down where the work happens.
2. Link it from the template or component it affects.
3. Revisit it when the next project disagrees with it.

## What we would do differently

Start earlier. Most of what is in here we learned the second time round.
