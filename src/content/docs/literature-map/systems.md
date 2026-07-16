---
title: Systems and Efficient Optimization
description: A track for low-rank, low-precision, memory, communication, and approximate linear algebra.
---

## Verified dataset view

Verified records assigned to this track appear in the
[data-driven research-track view](/llm-optimizer-atlas/paper-notes/generated/by-research-track/).
This page keeps the track's guiding questions without duplicating paper metadata.

## Purpose

Connect the mathematical optimizer to the finite-precision, distributed, and
memory-constrained procedure that is actually executed.

## Questions this track will answer

- What error is introduced by low-rank or moving-subspace approximations?
- How do truncated matrix iterations and approximate factorizations affect the
  update?
- Where do rounding, quantization, and reduced precision enter the method?
- What communication and optimizer-state costs are paid?
- Which theoretical properties survive an inexact implementation?

## Evidence standard

Records will distinguish algorithmic complexity from measured runtime and will
identify hardware, precision, communication pattern, and included overhead.

## Maintenance

Track membership and paper-level evidence are maintained in `papers.yml`; update
that canonical dataset rather than adding a second paper list here.
