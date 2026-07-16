# Project purpose

This repository is a verified personal research atlas for optimization methods
used in LLM pretraining.

# Research scope

The site covers:
- norm and duality based optimization;
- matrix and structured preconditioning;
- spectral, manifold, and closed-set constraints;
- low-rank and low-precision optimization;
- LLM optimizer benchmarking and scaling;
- research connections to MCSD, PGD, SPEL, and inexact LMOs.

# Non-negotiable factual rules

1. Never invent paper metadata, publication status, theorem statements,
   numerical results, URLs, or code repositories.
2. Prefer primary sources:
   - publisher or conference pages;
   - arXiv;
   - official author pages when needed;
   - official code repositories.
3. Distinguish strictly between:
   - preprint;
   - accepted;
   - published.
4. If a fact cannot be verified, write `TODO_UNVERIFIED`.
5. Never overwrite content inside a `human_notes` field.
6. Every quantitative claim must identify:
   - model size;
   - token, FLOP, or compute budget;
   - baseline;
   - evaluation metric;
   - whether wall-clock cost is included.
7. Never describe an optimizer as "better" without stating the comparison
   conditions.
8. Keep mathematical notation in LaTeX.
9. Keep structured metadata in YAML and human interpretation in Markdown/MDX.
10. Do not modify more than one content family in a single task unless the
    user explicitly requests it.

# Engineering rules

1. Inspect the repository before making changes.
2. Prefer Astro Starlight and static generation.
3. Do not add a database or server-side backend in the first version.
4. Avoid duplicating paper metadata in multiple files.
5. Add validation for all structured data.
6. Keep components small and typed where possible.
7. Preserve the existing visual style unless a redesign is requested.
8. Do not silently remove content or dependencies.

# Required checks

Before completing a task, run all commands that exist among:

```bash
npm run check
npm run validate
npm run test
npm run check:links
npm run build
```

If a command does not exist, report that fact rather than inventing output.

# Completion report

At the end of each task, report:

1. Files modified.
2. Commands executed.
3. Validation and build status.
4. Remaining `TODO_UNVERIFIED` items.
5. Any decision that needs human review.
