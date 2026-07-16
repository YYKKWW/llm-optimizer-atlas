---
title: Benchmark Comparisons
description: Comparable records for optimizer evaluations and resource accounting.
---

## Scaffold status

No benchmark metadata or numerical result has been entered.

## Purpose

Make experimental comparisons auditable across optimization quality, training
budget, and systems cost.

## Required comparison fields

- Model scale, architecture context, and data-to-parameter ratio.
- Dataset and training length.
- Tokens, FLOPs, compute allocation, and wall-clock time.
- Baselines, parameter grouping, warmup, and tuning budget.
- Evaluation metric and uncertainty.
- Optimizer-state memory, matrix-operation overhead, and communication.
- Hardware, precision, and excluded costs.

## Verification rules

An optimizer cannot be called better without naming the baseline, metric, and
matched conditions. Missing cost dimensions must remain visible.

## Next step

Define a structured benchmark record after stable paper identifiers are
available.
