type RecentRow = { id: string; published: boolean; updated_at: string; created_at: string; title?: string; title_en?: string | null; name?: string; name_en?: string | null; source_url?: string | null };
type DatedEvent = RecentRow & { event_date: string };

function recentFirst<T extends RecentRow>(rows: T[]): T[] {
  return rows.filter(row => row.published).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at) || b.created_at.localeCompare(a.created_at) || a.id.localeCompare(b.id)
  );
}

function normalized(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function identities(row: RecentRow, kind: "post" | "expert" | "event") {
  const labels = kind === "expert" ? [row.name, row.name_en] : [row.title, row.title_en];
  const keys = [`${kind}:id:${row.id}`, ...labels.filter((label): label is string => Boolean(label?.trim())).map(label => `${kind === "expert" ? "person" : "content"}:${normalized(label)}`)];
  // One article and its event coverage may share a source; expert biographies are distinct content.
  if (kind !== "expert" && row.source_url) {
    try {
      const url = new URL(row.source_url);
      if (url.protocol === "https:") keys.push(`source:${url.origin}${url.pathname.replace(/\/$/, "")}`);
    } catch { /* Invalid source URLs cannot establish identity. */ }
  }
  return keys;
}

export function latestPublished<T extends RecentRow>(rows: T[]): T | undefined {
  return recentFirst(rows)[0];
}

export function assistantSuggestions<P extends RecentRow, X extends RecentRow, E extends DatedEvent>(
  content: { posts: P[]; experts: X[]; events: E[] }, today: string,
) {
  const seen = new Set<string>();
  function pick<T extends RecentRow>(rows: T[], kind: "post" | "expert" | "event") {
    const row = rows.find(candidate => !identities(candidate, kind).some(key => seen.has(key)));
    if (row) identities(row, kind).forEach(key => seen.add(key));
    return row;
  }
  const publishedEvents = recentFirst(content.events);
  const upcoming = publishedEvents.filter(row => row.event_date >= today).sort((a, b) => a.event_date.localeCompare(b.event_date));
  const past = publishedEvents.filter(row => row.event_date < today).sort((a, b) => b.event_date.localeCompare(a.event_date));
  const event = pick(upcoming.length ? upcoming : past, "event");
  return {
    post: pick(recentFirst(content.posts), "post"),
    expert: pick(recentFirst(content.experts), "expert"),
    event,
    eventPast: event ? event.event_date < today : false,
  };
}