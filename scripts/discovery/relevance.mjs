import { decodeHtml } from './normalize.mjs';

export function matchRelevance(record, profiles) {
  const fields = {
    title: decodeHtml(record.searchText?.title ?? record.title).toLocaleLowerCase('en-US'),
    abstract: decodeHtml(record.searchText?.abstract ?? '').toLocaleLowerCase('en-US'),
    keywords: decodeHtml(record.searchText?.keywords ?? '').toLocaleLowerCase('en-US'),
  };
  const matchedProfiles = [];
  const matchedTerms = new Set();
  const matchedFields = new Set();

  for (const profile of profiles) {
    if (
      profile.source_allowlist &&
      !profile.source_allowlist.includes(record.targetSource)
    ) {
      continue;
    }
    const localTerms = new Set();
    const localFields = new Set();
    const matchesAllGroups = profile.all_groups.every((group) =>
      group.some((term) => {
        const normalizedTerm = term.toLocaleLowerCase('en-US');
        const hitFields = Object.entries(fields)
          .filter(([, text]) => text.includes(normalizedTerm))
          .map(([field]) => field);
        if (hitFields.length === 0) {
          return false;
        }
        localTerms.add(term);
        for (const field of hitFields) {
          localFields.add(field);
        }
        return true;
      }),
    );
    if (matchesAllGroups) {
      matchedProfiles.push(profile.id);
      for (const term of localTerms) matchedTerms.add(term);
      for (const field of localFields) matchedFields.add(field);
    }
  }

  return {
    profiles: matchedProfiles.sort(),
    matchedTerms: [...matchedTerms].sort(),
    matchedFields: [...matchedFields].sort(),
  };
}
