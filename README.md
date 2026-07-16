# LLM Optimizer Atlas

A minimal Astro Starlight site for a verified personal literature atlas on LLM
optimizers and mathematical optimization.

## Local use

1. Install dependencies with npm install.
2. Start the local site with npm run dev.
3. Run npm run check, npm run validate, npm test, npm run check:links, and
   npm run build before committing content changes.

The site is statically generated from Markdown and MDX in src/content/docs. It
has no database, server-side backend, or unverified paper records.

## Content workflow

- The five literature tracks live under src/content/docs/literature-map.
- Paper notes will live under src/content/docs/paper-notes.
- Open problems, benchmark comparisons, experiment notes, and the watchlist each
  have their own content directory.
- Structured paper data lives in src/data/papers.yml and is validated against
  src/data/paper-schema.mjs. The dataset remains empty until primary-source
  verification begins in the next stage.
- Automated dataset writers must call the human-notes protection guard before
  writing. See src/data/README.md for the field contract and workflow.
- The files in prompts should be run in numerical order, one stage at a time.

See AGENTS.md for factual and engineering rules. The original implementation
guide, seed-paper checklist, and example metadata remain in the repository as
planning inputs; they are not published as verified atlas content.
