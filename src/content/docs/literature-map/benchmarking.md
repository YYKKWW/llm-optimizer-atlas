---
title: Benchmarking and Scaling
description: A track for fair optimizer comparisons across budgets, scales, and metrics.
---

## Verified dataset view

Verified records assigned to this track appear in the
[data-driven research-track view](/llm-optimizer-atlas/paper-notes/generated/by-research-track/).
This page keeps the track's guiding questions without duplicating paper metadata.

## Purpose

Make optimizer comparisons conditional on the model, data, compute, tuning
budget, and resource metric actually used.

## Questions this track will answer

- Are results compared against tokens, FLOPs, wall-clock time, or more than one?
- Were baselines tuned with comparable budgets and parameter-group rules?
- How do model scale and data-to-parameter ratio affect the conclusion?
- Are optimizer-state memory and matrix-operation overhead included?
- Does a claimed gain persist under matched training and evaluation conditions?

## Evidence standard

Detailed records will live in
[Benchmark Comparisons](/llm-optimizer-atlas/benchmark-comparisons/).
Conflicting results will be summarized in
[Where Papers Disagree](/llm-optimizer-atlas/where-papers-disagree/) only after
protocol differences are explicit.

## Maintenance

Track membership and paper-level evidence are maintained in `papers.yml`; update
that canonical dataset rather than adding a second paper list here.
