import { z } from 'zod';
import { PROJECT_TIME_ZONE, RESEARCH_TRACKS } from './paper-schema.mjs';

export const OPEN_PROBLEM_STATUSES = ['open'];
export const OPEN_PROBLEM_TYPES = [
  'theoretical',
  'empirical',
  'benchmarking',
  'systems',
  'mixed',
];
export const OPEN_PROBLEM_ORIGINS = ['source-stated', 'atlas-synthesis'];
export const SOURCE_REF_ROLES = [
  'problem-statement',
  'known-result',
  'limitation',
  'empirical-boundary',
];

const idSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'must be a lowercase kebab-case identifier',
  );

const factualTextSchema = z.string().superRefine((value, context) => {
  if (value.trim().length === 0) {
    context.addIssue({ code: 'custom', message: 'must not be empty' });
  }
  if (value !== value.trim()) {
    context.addIssue({
      code: 'custom',
      message: 'must not have leading or trailing whitespace',
    });
  }
  if (value.includes('TODO_UNVERIFIED')) {
    context.addIssue({
      code: 'custom',
      message:
        'verified open-problem records may not contain TODO_UNVERIFIED; keep uncertain items in candidate artifacts',
    });
  }
});

function uniqueArray(itemSchema, label) {
  return z
    .array(itemSchema)
    .min(1, label + ' must contain at least one value')
    .superRefine((values, context) => {
      const seen = new Set();
      for (const [index, value] of values.entries()) {
        const key = typeof value === 'string' ? value : JSON.stringify(value);
        if (seen.has(key)) {
          context.addIssue({
            code: 'custom',
            path: [index],
            message: label + ' must not contain duplicate values',
          });
        }
        seen.add(key);
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

const verificationDateSchema = z.string().superRefine((value, context) => {
  if (!isRealIsoDate(value)) {
    context.addIssue({
      code: 'custom',
      message: 'must be a real calendar date in YYYY-MM-DD format',
    });
    return;
  }
  if (value > todayInProjectTimeZone()) {
    context.addIssue({ code: 'custom', message: 'must not be a future date' });
  }
});

export const openProblemSourceRefSchema = z
  .object({
    id: idSchema,
    paper_id: idSchema,
    paper_source_version: factualTextSchema,
    locator: factualTextSchema,
    role: z.enum(SOURCE_REF_ROLES),
    supports: factualTextSchema,
  })
  .strict();

export const openProblemKnownResultSchema = z
  .object({
    statement: factualTextSchema,
    conditions: factualTextSchema,
    source_ref_ids: uniqueArray(idSchema, 'source_ref_ids'),
  })
  .strict();

export const openProblemSchema = z
  .object({
    id: idSchema,
    title: factualTextSchema,
    status: z.literal('open'),
    verification_status: z.literal('verified'),
    problem_type: z.enum(OPEN_PROBLEM_TYPES),
    research_tracks: uniqueArray(
      z.enum(RESEARCH_TRACKS),
      'research_tracks',
    ),
    tags: uniqueArray(
      z
        .string()
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          'tags must use lowercase kebab-case',
        ),
      'tags',
    ),
    origin: z.enum(OPEN_PROBLEM_ORIGINS),
    question: factualTextSchema,
    scope: uniqueArray(factualTextSchema, 'scope'),
    assumptions: uniqueArray(factualTextSchema, 'assumptions'),
    source_refs: uniqueArray(openProblemSourceRefSchema, 'source_refs'),
    known_results: uniqueArray(
      openProblemKnownResultSchema,
      'known_results',
    ),
    unknown: z
      .object({
        statement: factualTextSchema,
        verification_boundary: factualTextSchema,
      })
      .strict(),
    why_open: factualTextSchema,
    candidate_approaches: uniqueArray(
      factualTextSchema,
      'candidate_approaches',
    ),
    resolution_criteria: uniqueArray(
      factualTextSchema,
      'resolution_criteria',
    ),
    falsification_criteria: uniqueArray(
      factualTextSchema,
      'falsification_criteria',
    ),
    last_verified: verificationDateSchema,
    human_notes: z.string(),
  })
  .strict()
  .superRefine((problem, context) => {
    const sourceRefIds = new Map();
    for (const [index, sourceRef] of problem.source_refs.entries()) {
      if (sourceRefIds.has(sourceRef.id)) {
        context.addIssue({
          code: 'custom',
          path: ['source_refs', index, 'id'],
          message:
            'duplicate source-ref id; first used at index ' +
            sourceRefIds.get(sourceRef.id),
        });
      } else {
        sourceRefIds.set(sourceRef.id, index);
      }
    }

    for (const [resultIndex, result] of problem.known_results.entries()) {
      for (const [refIndex, refId] of result.source_ref_ids.entries()) {
        if (!sourceRefIds.has(refId)) {
          context.addIssue({
            code: 'custom',
            path: ['known_results', resultIndex, 'source_ref_ids', refIndex],
            message: 'references unknown source-ref id "' + refId + '"',
          });
        }
      }
    }

    if (
      problem.origin === 'source-stated' &&
      !problem.source_refs.some((ref) => ref.role === 'problem-statement')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['origin'],
        message:
          'source-stated problems require a source ref with role problem-statement',
      });
    }
  });

export const openProblemDatasetSchema = z
  .array(openProblemSchema)
  .superRefine((problems, context) => {
    const firstIndexById = new Map();
    for (const [index, problem] of problems.entries()) {
      if (firstIndexById.has(problem.id)) {
        context.addIssue({
          code: 'custom',
          path: [index, 'id'],
          message:
            'duplicate open-problem id "' +
            problem.id +
            '"; first used at index ' +
            firstIndexById.get(problem.id),
        });
      } else {
        firstIndexById.set(problem.id, index);
      }
    }
  });

export function parseOpenProblemDataset(value) {
  return openProblemDatasetSchema.parse(value);
}

export class OpenProblemReferenceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OpenProblemReferenceError';
  }
}

function hasReadablePaperUrl(paper) {
  return [paper.paper_url, paper.arxiv_url].some(
    (value) => typeof value === 'string' && /^https?:\/\//i.test(value),
  );
}

export function assertOpenProblemPaperReferences(problemsValue, papers) {
  const problems = parseOpenProblemDataset(problemsValue);
  const papersById = new Map(papers.map((paper) => [paper.id, paper]));
  const issues = [];

  for (const [problemIndex, problem] of problems.entries()) {
    for (const [refIndex, sourceRef] of problem.source_refs.entries()) {
      const paper = papersById.get(sourceRef.paper_id);
      const prefix =
        problemIndex + '.source_refs.' + refIndex + '.';
      if (!paper) {
        issues.push(
          prefix + 'paper_id: unknown paper id "' + sourceRef.paper_id + '"',
        );
        continue;
      }
      if (paper.source_version === 'TODO_UNVERIFIED') {
        issues.push(
          prefix +
            'paper_source_version: referenced paper has no verified source version',
        );
      } else if (sourceRef.paper_source_version !== paper.source_version) {
        issues.push(
          prefix +
            'paper_source_version: expected exact canonical value "' +
            paper.source_version +
            '"',
        );
      }
      if (paper.last_verified === null) {
        issues.push(prefix + 'paper_id: referenced paper has no verification date');
      }
      if (!hasReadablePaperUrl(paper)) {
        issues.push(prefix + 'paper_id: referenced paper has no readable source URL');
      }
    }
  }

  if (issues.length > 0) {
    throw new OpenProblemReferenceError(
      'Open-problem paper reference validation failed:\n' + issues.join('\n'),
    );
  }
  return problems;
}

export function relatedPaperIds(problem) {
  return [...new Set(problem.source_refs.map((ref) => ref.paper_id))];
}

export class OpenProblemHumanNotesProtectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OpenProblemHumanNotesProtectionError';
  }
}

export function assertOpenProblemHumanNotesPreserved(
  previousValue,
  nextValue,
  { allowAdditions = false } = {},
) {
  const previous = parseOpenProblemDataset(previousValue);
  const next = parseOpenProblemDataset(nextValue);
  const nextById = new Map(next.map((problem) => [problem.id, problem]));
  const previousIds = new Set(previous.map((problem) => problem.id));

  for (const problem of previous) {
    const updated = nextById.get(problem.id);
    if (!updated) {
      throw new OpenProblemHumanNotesProtectionError(
        'Automated updates may not delete open problem "' +
          problem.id +
          '" because that would delete human_notes.',
      );
    }
    if (updated.human_notes !== problem.human_notes) {
      throw new OpenProblemHumanNotesProtectionError(
        'Automated updates may not change human_notes for open problem "' +
          problem.id +
          '".',
      );
    }
  }

  for (const problem of next) {
    if (!previousIds.has(problem.id)) {
      if (!allowAdditions) {
        throw new OpenProblemHumanNotesProtectionError(
          'Automated updates may not promote new verified open problem "' +
            problem.id +
            '"; add it through reviewed source control.',
        );
      }
      if (problem.human_notes !== '') {
        throw new OpenProblemHumanNotesProtectionError(
          'Reviewed additions must initialize human_notes as an empty string for open problem "' +
            problem.id +
            '".',
        );
      }
    }
  }
  return next;
}
