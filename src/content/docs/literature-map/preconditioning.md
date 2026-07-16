---
title: Structured Preconditioning
description: A track for diagonal, matrix, Kronecker, and approximate second-order structure.
---

## Scaffold status

This track contains planning questions only; no paper metadata or performance
claims have been added.

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

## Planned evidence

Comparisons will record model scale, training budget, baselines, tuning budget,
metrics, wall-clock treatment, optimizer-state memory, and matrix-operation
overhead.

## Next step

Wait for the verified paper dataset and link each method to a single canonical
paper note.
