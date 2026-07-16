# LLM Optimizer Atlas

A minimal Astro Starlight site for a verified personal literature atlas on LLM
optimizers and mathematical optimization.

## Local use

1. Install dependencies with npm install.
2. Start the local site with npm run dev.
3. Run npm run verify and npm run build before committing content changes.

The site is statically generated from Markdown, MDX, Astro components, and
validated YAML datasets for papers and verified open problems. It has no
database or server-side backend.

## Content workflow

- The five literature tracks live under src/content/docs/literature-map.
- Paper views and records are generated under
  src/content/docs/paper-notes/generated; hand-written pages outside that
  directory are never overwritten by the generator.
- Verified open problems live in src/data/open-problems.yml and generate an
  index plus one source-grounded detail route per problem. Candidate literature
  never enters this file automatically.
- Structured paper and open-problem data are validated against their schemas
  and cross-dataset references. Run npm run generate:pages after changing paper
  or problem IDs or titles; npm run validate checks generated-page drift.
- Automated dataset writers must call the human-notes protection guard before
  writing. See src/data/README.md for the field contract and workflow.
- The files in prompts should be run in numerical order, one stage at a time.

## Candidate discovery

`npm run discover:candidates` searches the five configured literature sources
and writes an unverified review bundle under `.artifacts/discovery`. The weekly
GitHub workflow uploads the bundle as an artifact with read-only permissions.
It cannot write verified data, site content, Issues, branches, or pull requests.
Live discovery is deliberately excluded from `npm run verify` so external
service availability cannot break site deployment.

Journal relevance can use Crossref title, subject, and abstract text in memory;
conference adapters currently filter official PMLR, NeurIPS, and ICLR index
titles. Abstract text is never persisted in the candidate bundle. This is a
conservative review queue, not a claim of systematic-review recall.

See AGENTS.md for factual and engineering rules. The original implementation
guide, seed-paper checklist, and example metadata remain in the repository as
planning inputs; they are not published as verified atlas content.
