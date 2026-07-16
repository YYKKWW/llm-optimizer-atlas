---
title: Paper Library
description: Data-driven views and durable records for the verified paper dataset.
---

The library is rendered from the validated `papers.yml` dataset. Generated
pages contain only a view name or stable paper ID; bibliographic metadata,
claims, evidence, and links remain in the dataset as the single source of
truth.

## Browse the library

- [All papers](./generated/all/)
- [Grouped by research track](./generated/by-research-track/)
- [Grouped by publication status](./generated/by-publication-status/)
- [Grouped by year](./generated/by-year/)

The [Reading Queue](/llm-optimizer-atlas/reading-queue/) filters the same data by
`reading_status`. The [Watchlist](/llm-optimizer-atlas/watchlist/) includes only
verified preprints explicitly marked with `frontier_watch: true`.

## Record boundary

Each generated record exposes the paper-stated claim, exact update, source
version, evidence conditions, atlas interpretation, and limitations. A generated
page is a read-only view: it never writes to `papers.yml` and never changes
`human_notes`.

## Regeneration

Run `npm run generate:pages` after changing the dataset. Validation fails when
the committed generated routes no longer match the validated paper IDs.

## Verification rules

Exact title, authors, date, status, URLs, and repositories must be checked
against primary sources before a record becomes part of the library. A paper
card summarizes that record; it does not upgrade a preprint or fill an unknown
field by inference.
