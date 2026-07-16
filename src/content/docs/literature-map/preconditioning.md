---
title: Structured Preconditioning
description: A track for diagonal, matrix, Kronecker, and approximate second-order structure.
---

## Verified dataset view

Verified records assigned to this track appear in the
[data-driven research-track view](/llm-optimizer-atlas/paper-notes/generated/by-research-track/).
This page keeps the track's guiding questions without duplicating paper metadata.

## Purpose

Compare what different preconditioners approximate and how their structure,
update frequency, and numerical implementation affect optimization.

## Questions this track will answer

- Does a method approximate a Hessian, a Fisher matrix, a gradient second
  moment, or another operator?
- What is retained or lost by diagonal, layerwise, Kronecker, low-rank, or
  full-matrix structure?
- How do update frequency and inverse approximation affect bias, variance, and
  cost?
- When does token efficiency translate into wall-clock efficiency?

## Evidence standard

Comparisons will record model scale, training budget, baselines, tuning budget,
metrics, wall-clock treatment, optimizer-state memory, and matrix-operation
overhead.

## Maintenance

Track membership and paper-level evidence are maintained in `papers.yml`; update
that canonical dataset rather than adding a second paper list here.
