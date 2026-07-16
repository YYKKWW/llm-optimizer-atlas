import { readFile } from 'node:fs/promises';
import yaml from 'js-yaml';
import { TARGET_SOURCE_IDS } from './candidate-schema.mjs';

const EXPECTED_ADAPTERS = new Map([
  ['mathematical-programming', 'crossref-journal'],
  ['siam-journal-on-optimization', 'crossref-journal'],
  ['icml', 'pmlr-icml'],
  ['neurips', 'neurips-proceedings'],
  ['iclr', 'iclr-proceedings'],
]);

function nonemptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export async function loadDiscoveryConfig(sourcePath, topicPath) {
  const sourceConfig = yaml.load(await readFile(sourcePath, 'utf8'), {
    schema: yaml.JSON_SCHEMA,
    filename: sourcePath,
  });
  const topicConfig = yaml.load(await readFile(topicPath, 'utf8'), {
    schema: yaml.JSON_SCHEMA,
    filename: topicPath,
  });
  if (!Array.isArray(sourceConfig?.sources)) {
    throw new Error('Discovery source config requires a sources array');
  }
  const ids = sourceConfig.sources.map((source) => source.id);
  if (
    ids.length !== TARGET_SOURCE_IDS.length ||
    TARGET_SOURCE_IDS.some((id) => !ids.includes(id)) ||
    new Set(ids).size !== ids.length
  ) {
    throw new Error('Discovery source config must contain each target exactly once');
  }
  for (const source of sourceConfig.sources) {
    if (
      !nonemptyString(source.label) ||
      source.adapter !== EXPECTED_ADAPTERS.get(source.id) ||
      (source.adapter === 'crossref-journal' &&
        !/^\d{4}-\d{3}[\dX]$/.test(String(source.issn)))
    ) {
      throw new Error('Invalid discovery source: ' + JSON.stringify(source));
    }
  }
  if (!Array.isArray(topicConfig?.profiles) || topicConfig.profiles.length === 0) {
    throw new Error('Discovery topic config requires at least one profile');
  }
  for (const profile of topicConfig.profiles) {
    if (
      typeof profile.id !== 'string' ||
      !Array.isArray(profile.all_groups) ||
      profile.all_groups.length === 0 ||
      profile.all_groups.some(
        (group) =>
          !Array.isArray(group) ||
          group.length === 0 ||
          group.some((term) => typeof term !== 'string' || term.length === 0),
      )
    ) {
      throw new Error('Invalid discovery profile: ' + JSON.stringify(profile));
    }
    if (
      profile.source_allowlist !== undefined &&
      (!Array.isArray(profile.source_allowlist) ||
        profile.source_allowlist.length === 0 ||
        profile.source_allowlist.some(
          (sourceId) => !TARGET_SOURCE_IDS.includes(sourceId),
        ))
    ) {
      throw new Error(
        'Invalid source_allowlist for discovery profile: ' + profile.id,
      );
    }
  }
  const profileIds = topicConfig.profiles.map((profile) => profile.id);
  if (new Set(profileIds).size !== profileIds.length) {
    throw new Error('Discovery profile IDs must be unique');
  }
  return { sources: sourceConfig.sources, profiles: topicConfig.profiles };
}
