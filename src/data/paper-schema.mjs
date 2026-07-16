import { z } from 'zod';

export const TODO_UNVERIFIED = 'TODO_UNVERIFIED';
export const PAPER_STATUSES = ['preprint', 'accepted', 'published'];
export const READING_STATUSES = ['unread', 'reading', 'read'];
export const RESEARCH_TRACKS = [
  'norm-duality',
  'preconditioning',
  'manifold-constraints',
  'benchmarking',
  'systems',
];
export const PROJECT_TIME_ZONE = 'Asia/Shanghai';

const currentYear = new Date().getUTCFullYear();

const metadataTextSchema = z
  .string()
  .min(1, 'must not be empty')
  .superRefine((value, context) => {
    if (value !== value.trim()) {
      context.addIssue({
        code: 'custom',
        message: 'must not have leading or trailing whitespace',
      });
    }

    if (value.includes(TODO_UNVERIFIED) && value !== TODO_UNVERIFIED) {
      context.addIssue({
        code: 'custom',
        message:
          'must use TODO_UNVERIFIED as the complete value, without other text',
      });
    }
  });

const longMetadataTextSchema = z.string().superRefine((value, context) => {
  if (value.trim().length === 0) {
    context.addIssue({ code: 'custom', message: 'must not be empty' });
  }

  if (value.includes(TODO_UNVERIFIED) && value !== TODO_UNVERIFIED) {
    context.addIssue({
      code: 'custom',
      message:
        'must use TODO_UNVERIFIED as the complete value, without other text',
    });
  }
});

const optionalMetadataTextSchema = z.string().superRefine((value, context) => {
  if (value === '') {
    return;
  }

  const result = metadataTextSchema.safeParse(value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      context.addIssue({ code: 'custom', message: issue.message });
    }
  }
});

const httpUrlSchema = z.string().superRefine((value, context) => {
  if (value === '' || value === TODO_UNVERIFIED) {
    return;
  }

  if (value !== value.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'URL must not have leading or trailing whitespace',
    });
    return;
  }

  if (
    !/^https?:\/\/\S+$/i.test(value) ||
    /%(?![0-9a-f]{2})/i.test(value)
  ) {
    context.addIssue({
      code: 'custom',
      message: 'must use canonical HTTP(S) URL syntax',
    });
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    context.addIssue({
      code: 'custom',
      message: 'must be empty, TODO_UNVERIFIED, or an absolute HTTP(S) URL',
    });
    return;
  }

  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username !== '' ||
    parsed.password !== ''
  ) {
    context.addIssue({
      code: 'custom',
      message:
        'must be empty, TODO_UNVERIFIED, or an HTTP(S) URL without credentials',
    });
  }
});

const arxivUrlSchema = httpUrlSchema.superRefine((value, context) => {
  if (value === '' || value === TODO_UNVERIFIED) {
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return;
  }

  if (
    parsed.protocol !== 'https:' ||
    parsed.hostname !== 'arxiv.org' ||
    !/^\/abs\/(?:\d{4}\.\d{4,5}|[a-z-]+(?:\.[a-z-]+)?\/\d{7})(?:v[1-9]\d*)?$/i.test(
      parsed.pathname,
    ) ||
    parsed.search !== '' ||
    parsed.hash !== ''
  ) {
    context.addIssue({
      code: 'custom',
      message:
        'must be empty, TODO_UNVERIFIED, or a canonical https://arxiv.org/abs/... URL',
    });
  }
});

function uniqueTextArray(itemSchema, label, { todoIsExclusive = false } = {}) {
  return z
    .array(itemSchema)
    .min(1, label + ' must contain at least one value')
    .superRefine((values, context) => {
      const seen = new Map();

      for (const [index, value] of values.entries()) {
        if (seen.has(value)) {
          context.addIssue({
            code: 'custom',
            path: [index],
            message:
              label +
              ' must not contain duplicate value "' +
              value +
              '"',
          });
        } else {
          seen.set(value, index);
        }
      }

      if (
        todoIsExclusive &&
        values.includes(TODO_UNVERIFIED) &&
        values.length !== 1
      ) {
        context.addIssue({
          code: 'custom',
          message:
            TODO_UNVERIFIED +
            ' must be the only value when the entire field is unverified',
        });
      }
    });
}

function isRealIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(value + 'T00:00:00.000Z');
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

function todayInProjectTimeZone() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: PROJECT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return values.year + '-' + values.month + '-' + values.day;
}

const lastVerifiedSchema = z
  .union([z.null(), z.string()])
  .superRefine((value, context) => {
    if (value === null) {
      return;
    }

    if (!isRealIsoDate(value)) {
      context.addIssue({
        code: 'custom',
        message: 'must be null or a real calendar date in YYYY-MM-DD format',
      });
      return;
    }

    if (value > todayInProjectTimeZone()) {
      context.addIssue({
        code: 'custom',
        message: 'must not be a future date',
      });
    }
  });

const publicationDateSchema = z.string().superRefine((value, context) => {
  if (value === TODO_UNVERIFIED) {
    return;
  }

  if (!isRealIsoDate(value)) {
    context.addIssue({
      code: 'custom',
      message:
        'must be TODO_UNVERIFIED or a real calendar date in YYYY-MM-DD format',
    });
    return;
  }

  if (value > todayInProjectTimeZone()) {
    context.addIssue({
      code: 'custom',
      message: 'must not be a future date',
    });
  }
});

const reportedStateSchema = z.union([
  z.boolean(),
  z.literal(TODO_UNVERIFIED),
]);

export const paperEvidenceSchema = z
  .object({
    model_scales: longMetadataTextSchema,
    datasets: longMetadataTextSchema,
    token_budget: longMetadataTextSchema,
    compute_budget: longMetadataTextSchema,
    baseline_tuning: longMetadataTextSchema,
    evaluation_metric: longMetadataTextSchema,
    wall_clock_reported: reportedStateSchema,
    optimizer_state_reported: reportedStateSchema,
  })
  .strict();

export const paperSchema = z
  .object({
    id: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'must be a lowercase kebab-case identifier',
      ),
    title: metadataTextSchema,
    authors: uniqueTextArray(metadataTextSchema, 'authors', {
      todoIsExclusive: true,
    }),
    year: z.union([
      z
        .number()
        .int()
        .min(1800)
        .max(currentYear + 1),
      z.literal(TODO_UNVERIFIED),
    ]),
    publication_date: publicationDateSchema,
    status: z.enum(PAPER_STATUSES),
    venue: optionalMetadataTextSchema,
    paper_url: httpUrlSchema,
    arxiv_url: arxivUrlSchema,
    code_url: httpUrlSchema,
    source_version: metadataTextSchema,
    tags: uniqueTextArray(
      z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'tags must use lowercase kebab-case',
      ),
      'tags',
    ),
    research_tracks: uniqueTextArray(
      z.enum(RESEARCH_TRACKS),
      'research_tracks',
    ),
    frontier_watch: z.boolean(),
    core_claim: longMetadataTextSchema,
    exact_update: longMetadataTextSchema,
    traditional_optimization_link: uniqueTextArray(
      metadataTextSchema,
      'traditional_optimization_link',
      { todoIsExclusive: true },
    ),
    evidence: paperEvidenceSchema,
    limitations: uniqueTextArray(longMetadataTextSchema, 'limitations', {
      todoIsExclusive: true,
    }),
    reading_status: z.enum(READING_STATUSES),
    last_verified: lastVerifiedSchema,
    human_notes: z.string(),
  })
  .strict()
  .superRefine((paper, context) => {
    if (paper.frontier_watch && paper.status !== 'preprint') {
      context.addIssue({
        code: 'custom',
        path: ['frontier_watch'],
        message: 'may be true only for a preprint',
      });
    }

    if (
      typeof paper.year === 'number' &&
      paper.publication_date !== TODO_UNVERIFIED &&
      Number(paper.publication_date.slice(0, 4)) !== paper.year
    ) {
      context.addIssue({
        code: 'custom',
        path: ['publication_date'],
        message: 'year must match the year field',
      });
    }

    if (
      paper.arxiv_url !== '' &&
      paper.arxiv_url !== TODO_UNVERIFIED &&
      paper.source_version !== TODO_UNVERIFIED
    ) {
      let arxivId;
      try {
        arxivId = new URL(paper.arxiv_url).pathname
          .replace(/^\/abs\//, '')
          .replace(/v\d+$/i, '');
      } catch {
        return;
      }
      const escapedArxivId = arxivId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (
        !new RegExp(
          'arXiv:' + escapedArxivId + '(?:v\\d+)?(?:\\b|$)',
          'i',
        ).test(paper.source_version)
      ) {
        context.addIssue({
          code: 'custom',
          path: ['arxiv_url'],
          message: 'arXiv identifier must agree with source_version',
        });
      }
    }
  });

export const paperDatasetSchema = z
  .array(paperSchema)
  .superRefine((papers, context) => {
    const firstIndexById = new Map();

    for (const [index, paper] of papers.entries()) {
      if (firstIndexById.has(paper.id)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message:
            'duplicate paper id "' +
            paper.id +
            '"; first used at index ' +
            firstIndexById.get(paper.id),
        });
      } else {
        firstIndexById.set(paper.id, index);
      }
    }
  });

export function parsePaperDataset(value) {
  return paperDatasetSchema.parse(value);
}

export class HumanNotesProtectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HumanNotesProtectionError';
  }
}

/**
 * Fail-closed guard for every automated dataset writer.
 *
 * Existing human_notes must remain byte-for-byte equal after YAML parsing.
 * Existing records may not be deleted, and automated additions must begin with
 * an empty human_notes value.
 */
export function assertHumanNotesPreserved(previousValue, nextValue) {
  const previous = parsePaperDataset(previousValue);
  const next = parsePaperDataset(nextValue);
  const nextById = new Map(next.map((paper) => [paper.id, paper]));
  const previousIds = new Set(previous.map((paper) => paper.id));

  for (const paper of previous) {
    const updated = nextById.get(paper.id);
    if (!updated) {
      throw new HumanNotesProtectionError(
        'Automated updates may not delete paper "' +
          paper.id +
          '" because that would delete human_notes.',
      );
    }

    if (updated.human_notes !== paper.human_notes) {
      throw new HumanNotesProtectionError(
        'Automated updates may not change human_notes for paper "' +
          paper.id +
          '".',
      );
    }
  }

  for (const paper of next) {
    if (!previousIds.has(paper.id) && paper.human_notes !== '') {
      throw new HumanNotesProtectionError(
        'Automated additions must initialize human_notes as an empty string for paper "' +
          paper.id +
          '".',
      );
    }
  }

  return next;
}
