/** Max creator rows rendered in scroll lists (full filter still runs on deferred query). */
export const CREATOR_LIST_DISPLAY_LIMIT = 50;

export function buildSearchableText(inf: {
  name?: string;
  handle?: string;
  niche?: string;
  categories?: string[];
  platform?: string;
  country?: string;
}) {
  return [inf.name, inf.handle, inf.niche, ...(inf.categories || []), inf.platform, inf.country]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** Precompute search text without cloning influencer objects (avoids UI freezes). */
export function buildSearchTextMap(
  influencers: { id?: string | number }[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const inf of influencers) {
    const id = String(inf.id ?? '');
    if (!id) continue;
    map.set(id, buildSearchableText(inf as Parameters<typeof buildSearchableText>[0]));
  }
  return map;
}

export function matchesSearchQuery(
  inf: { id?: string | number; _fromLiveSearch?: boolean },
  query: string,
  searchTextMap: Map<string, string>,
  skipTextMatch = false,
) {
  if (!query || skipTextMatch || inf._fromLiveSearch) return true;
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;
  const searchable = searchTextMap.get(String(inf.id ?? '')) ?? '';
  return tokens.every(token => searchable.includes(token.replace(/^@/, '')));
}

export function mergeYouTubeResults(local: any[], live: any[]) {
  const merged = [...local];
  const seen = new Set(merged.map(item => item.youtubeChannelId || item.id));
  for (const item of live) {
    const key = item.youtubeChannelId || item.id;
    if (key && seen.has(key)) continue;
    merged.push({ ...item, _fromLiveSearch: true });
    if (key) seen.add(key);
  }
  return merged;
}

/** Minimum characters before calling YouTube live search. */
export const YOUTUBE_SEARCH_MIN_CHARS = 2;

export function filterCampaignCreators(options: {
  platform: 'Instagram' | 'TikTok' | 'YouTube';
  catalog: any[];
  query: string;
  category: string;
  searchTextMap: Map<string, string>;
  liveYouTubeResults: any[] | null;
  liveYouTubeLoading: boolean;
  matchesCategory: (inf: any, category: string) => boolean;
}): { pool: any[]; emptyHint: string | null } {
  const {
    platform,
    catalog,
    query,
    category,
    searchTextMap,
    liveYouTubeResults,
    liveYouTubeLoading,
    matchesCategory,
  } = options;
  const q = query.trim();

  if (platform === 'YouTube') {
    if (q.length < YOUTUBE_SEARCH_MIN_CHARS) {
      const cached = catalog.filter(inf => matchesCategory(inf, category));
      return {
        pool: cached,
        emptyHint:
          cached.length === 0
            ? `Type ${YOUTUBE_SEARCH_MIN_CHARS}+ characters to search YouTube via the Data API (set YOUTUBE_API_KEY in .env).`
            : null,
      };
    }
    if (liveYouTubeLoading && liveYouTubeResults === null) {
      return { pool: [], emptyHint: 'Searching YouTube…' };
    }
    const live = liveYouTubeResults ?? [];
    const localMatches = catalog.filter(
      inf =>
        matchesCategory(inf, category) &&
        matchesSearchQuery(inf, q, searchTextMap),
    );
    const merged = mergeYouTubeResults(localMatches, live).filter(inf =>
      matchesCategory(inf, category),
    );
    if (merged.length === 0 && !liveYouTubeLoading) {
      return { pool: [], emptyHint: `No YouTube channels found for "${q}".` };
    }
    return { pool: merged, emptyHint: null };
  }

  let pool = catalog;
  if (q) {
    pool = pool.filter(inf => matchesSearchQuery(inf, q, searchTextMap));
  }
  pool = pool.filter(inf => matchesCategory(inf, category));
  if (pool.length === 0 && catalog.length > 0) {
    return { pool: [], emptyHint: q ? `No ${platform} creators match "${q}".` : 'No creators in this category.' };
  }
  if (pool.length === 0) {
    return { pool: [], emptyHint: `No ${platform} creators loaded from the dataset.` };
  }
  return { pool, emptyHint: null };
}

export function formatFollowers(value: number | undefined | null): string {
  const n = Number(value) || 0;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}
