import {
  mkdir,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';

function isWithin(parent, target) {
  const relative = path.relative(parent, target);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export async function assertSafeOutputDirectory(projectRoot, outputDirectory) {
  const root = await realpath(projectRoot);
  const requested = path.resolve(outputDirectory);
  const allowedProjectOutput = path.join(root, '.artifacts', 'discovery');
  if (isWithin(root, requested) && !isWithin(allowedProjectOutput, requested)) {
    throw new Error(
      'Discovery output inside the repository is allowed only under .artifacts/discovery',
    );
  }
  await mkdir(requested, { recursive: true });
  const resolved = await realpath(requested);

  if (isWithin(root, resolved) && !isWithin(allowedProjectOutput, resolved)) {
    throw new Error(
      'Discovery output inside the repository is allowed only under .artifacts/discovery',
    );
  }
  return resolved;
}

async function writeAtomically(target, source) {
  const temporaryPath =
    target + '.' + process.pid + '.' + Date.now() + '.discovery.tmp';
  try {
    await writeFile(temporaryPath, source, 'utf8');
    await rename(temporaryPath, target);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

function reviewQueueMarkdown(artifact) {
  const lines = [
    '# Unverified literature candidates',
    '',
    '> UNVERIFIED CANDIDATES ONLY — DO NOT PUBLISH AS VERIFIED.',
    '',
    `Generated: ${artifact.generated_at}`,
    `Window: ${artifact.window_start} through ${artifact.window_end}`,
    `Window semantics: ${artifact.window_note}`,
    `Candidates: ${artifact.candidates.length}`,
    '',
  ];
  for (const candidate of artifact.candidates) {
    lines.push(
      `## ${candidate.title}`,
      '',
      `- Candidate ID: \`${candidate.candidate_id}\``,
      `- Target source: ${candidate.target_sources.join(', ')}`,
      `- Profiles: ${candidate.relevance.profiles.join(', ')}`,
      `- Existing paper: ${candidate.dedupe.existing_paper_id ?? 'none detected'}`,
      `- Official URL: ${candidate.official_url ?? 'not supplied'}`,
      '',
      'Human review must verify metadata, publication status, exact source locations, and the open-problem boundary before promotion.',
      '',
    );
  }
  return lines.join('\n') + '\n';
}

export async function writeDiscoveryBundle(
  projectRoot,
  outputDirectory,
  { artifact, diagnostics, manifest },
) {
  const safeDirectory = await assertSafeOutputDirectory(
    projectRoot,
    outputDirectory,
  );
  await writeAtomically(
    path.join(safeDirectory, 'candidate-literature.json'),
    JSON.stringify(artifact, null, 2) + '\n',
  );
  await writeAtomically(
    path.join(safeDirectory, 'review-queue.md'),
    reviewQueueMarkdown(artifact),
  );
  await writeAtomically(
    path.join(safeDirectory, 'diagnostics.json'),
    JSON.stringify(diagnostics, null, 2) + '\n',
  );
  await writeAtomically(
    path.join(safeDirectory, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  return safeDirectory;
}
