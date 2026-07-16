import { z } from 'zod';

export const TARGET_SOURCE_IDS = [
  'mathematical-programming',
  'siam-journal-on-optimization',
  'icml',
  'neurips',
  'iclr',
];

const nonemptyText = z.string().min(1);
const realIsoDate = z.string().superRefine((value, context) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    context.addIssue({ code: 'custom', message: 'must use YYYY-MM-DD' });
    return;
  }
  const parsed = new Date(value + 'T00:00:00.000Z');
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    context.addIssue({ code: 'custom', message: 'must be a real calendar date' });
  }
});
const nullableHttpUrl = z
  .union([z.null(), z.url()])
  .superRefine((value, context) => {
    if (value !== null && !/^https:\/\//i.test(value)) {
      context.addIssue({ code: 'custom', message: 'must use HTTPS' });
    }
  });

export const literatureCandidateSchema = z
  .object({
    candidate_id: z.string().regex(/^candidate-[a-f0-9]{16}$/),
    candidate_kind: z.literal('literature-source'),
    review_state: z.literal('unreviewed'),
    title: nonemptyText,
    authors: z.array(nonemptyText),
    published_date: z.union([z.null(), realIsoDate]),
    target_sources: z.array(z.enum(TARGET_SOURCE_IDS)).min(1),
    doi: z.union([z.null(), nonemptyText]),
    arxiv_url: nullableHttpUrl,
    official_url: nullableHttpUrl,
    source_keys: z.array(nonemptyText).min(1),
    relevance: z
      .object({
        profiles: z.array(nonemptyText).min(1),
        matched_terms: z.array(nonemptyText).min(1),
        matched_fields: z.array(z.enum(['title', 'abstract', 'keywords'])).min(1),
      })
      .strict(),
    dedupe: z
      .object({
        existing_paper_id: z.union([z.null(), nonemptyText]),
        referenced_by_open_problem_ids: z.array(nonemptyText),
        possible_duplicate_ids: z.array(nonemptyText),
      })
      .strict(),
    provenance: z
      .array(
        z
          .object({
            adapter: nonemptyText,
            target_source: z.enum(TARGET_SOURCE_IDS),
            record_id: nonemptyText,
            retrieved_at: z.iso.datetime(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export const discoveryArtifactSchema = z
  .object({
    schema_version: z.literal(1),
    generated_at: z.iso.datetime(),
    window_start: realIsoDate,
    window_end: realIsoDate,
    window_note: z.literal(
      'The date window applies to Crossref journals; conference adapters scan current and previous proceedings editions.',
    ),
    review_warning: z.literal(
      'UNVERIFIED CANDIDATES ONLY — DO NOT PUBLISH AS VERIFIED',
    ),
    candidates: z.array(literatureCandidateSchema),
  })
  .strict()
  .superRefine((artifact, context) => {
    const ids = new Set();
    for (const [index, candidate] of artifact.candidates.entries()) {
      if (ids.has(candidate.candidate_id)) {
        context.addIssue({
          code: 'custom',
          path: ['candidates', index, 'candidate_id'],
          message: 'candidate IDs must be unique',
        });
      }
      ids.add(candidate.candidate_id);
      if (candidate.dedupe.possible_duplicate_ids.includes(candidate.candidate_id)) {
        context.addIssue({
          code: 'custom',
          path: ['candidates', index, 'dedupe', 'possible_duplicate_ids'],
          message: 'a candidate cannot list itself as a possible duplicate',
        });
      }
    }
  });

export function parseDiscoveryArtifact(value) {
  return discoveryArtifactSchema.parse(value);
}
