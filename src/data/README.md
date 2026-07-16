# Paper dataset contract

papers.yml is the single structured source of truth for paper metadata. The
stage-2 baseline used an empty array so that no unverified record entered the
atlas; subsequent research batches add records only after checking primary
sources.

## Runtime schema

paper-schema.mjs exports:

- paperSchema for one record;
- paperDatasetSchema for the complete array and unique-ID validation;
- parsePaperDataset() for consumers;
- assertHumanNotesPreserved() for every automated writer.

scripts/lib/paper-data.mjs is the shared YAML loader. It uses the JSON YAML
schema so values such as 2026-07-16 remain strings, rejects duplicate mapping
keys, and then applies the Zod dataset schema. Validation does not fetch remote
URLs; it checks only URL syntax and protocol.

## Required fields

Every record contains the fields named in prompts/02-add-schema.txt. The
evidence object also requires evaluation_metric, because AGENTS.md requires
every quantitative claim to identify its metric.

The schema also carries publication_date, source_version, exact_update,
research_tracks, and frontier_watch. These fields prevent later stages from
guessing an exact source date, source revision, optimizer update, literature
track, or watchlist membership.

- id is a unique lowercase kebab-case identifier.
- status is exactly preprint, accepted, or published.
- reading_status is exactly unread, reading, or read.
- research_tracks contains one or more of norm-duality, preconditioning,
  manifold-constraints, benchmarking, and systems.
- frontier_watch is an explicit boolean and must not be inferred from a year.
- publication_date is TODO_UNVERIFIED or a real, nonfuture YYYY-MM-DD date.
- source_version and exact_update use TODO_UNVERIFIED until primary-source
  verification is complete.
- paper_url and code_url accept an empty string, TODO_UNVERIFIED, or an
  absolute HTTP(S) URL without embedded credentials. paper_url preserves the
  verified official, proceedings, or primary version that supports the
  bibliographic status.
- arxiv_url accepts the same empty and TODO states, or a canonical
  https://arxiv.org/abs/... URL. Its identifier must agree with source_version.
  Reader-facing pages show this link first for easier reading, while retaining
  a distinct official-version link. The unversioned URL opens the latest arXiv
  revision; source_version records the exact revision used by the atlas audit.
- last_verified is null or a real, nonfuture YYYY-MM-DD date. Future-date
  checks use the project time zone, Asia/Shanghai.
- wall_clock_reported and optimizer_state_reported accept true, false, or
  TODO_UNVERIFIED. false means the absence was checked; the TODO marker means
  it has not been verified.
- Unknown factual text may use the exact scalar TODO_UNVERIFIED. Do not append
  explanations to the marker. Add explanations in a limitation or human note.

Objects reject unknown fields so spelling mistakes do not silently enter the
dataset. Arrays used for authors, tags, optimization links, and limitations
must be nonempty and contain unique values.

year is an integer from 1800 through the next calendar year, or the exact TODO
marker. Tags use lowercase kebab-case. When authors, optimization links, or
limitations are wholly unknown, TODO_UNVERIFIED must be their only array item.

core_claim records a one-sentence claim made by the paper, not the atlas's
interpretation. traditional_optimization_link records the atlas's mathematical
interpretation. exact_update records the update as stated by the primary
source, preferably in LaTeX. Long factual fields may use YAML block scalars;
human_notes is the only field where TODO_UNVERIFIED may appear inside otherwise
free-form text.

publication_date is the date attached to the verified source version: the
version date for a preprint, the official acceptance date when status is
accepted, or the official publication date when status is published.
source_version identifies that exact source, for example an arXiv version or a
publisher version label. When year and publication_date are both known, their
years must agree. frontier_watch may be true only for a preprint.

## Protecting human_notes

Schema validation alone cannot prevent a writer from changing a valid string.
Every automated update must therefore:

1. Load and validate the previous dataset.
2. Build the proposed dataset without editing human_notes.
3. Call writePaperDatasetSafely(path, proposed), which validates the proposal,
   invokes assertHumanNotesPreserved(previous, proposed), and atomically writes
   only after the guard succeeds.
4. Write only if the guard succeeds.

The guard rejects changed notes, deletion of an existing record, and automated
addition of a nonempty note. It compares the parsed string exactly and does not
trim or normalize it. Generated pages are read-only consumers and may write
only inside src/content/docs/paper-notes/generated.

## Generated paper views

`npm run generate:pages` creates deterministic MDX shells only inside
`src/content/docs/paper-notes/generated`. Each shell stores a fixed view name
or stable paper ID; Astro components load and validate `papers.yml` at build
time, so generated pages do not become a second metadata source.

`npm run check:generated` is read-only and fails when a generated route is
missing, stale, or out of date. It also fails closed if a hand-written file is
found inside the generated directory. The command is part of `npm run validate`
and therefore runs before every production build.

An intentional human edit may update human_notes directly after review. Record
deletion or an ID change must also be a reviewed manual change so that notes can
be archived first; the automated writer deliberately has no bypass.

## Commands

- npm run validate:papers validates the canonical dataset.
- npm run validate checks documentation content, paper data, and generated-page drift.
- npm run generate:pages updates generated paper routes after dataset changes.
- npm run check:generated verifies that generated routes match the dataset.
- npm run check:links checks source-level internal links; remote paper, arXiv,
  and code URLs require a network-enabled research audit.
- npm run verify runs the type check, validation, full test suite, and internal
  link check used by the deployment quality gate.
- npm run test:schema runs the schema and protection tests.
- npm test runs all Node tests.
- npm run build runs validation automatically before the Astro build.

Fixtures under test/fixtures are synthetic test data, not atlas records.
