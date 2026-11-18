import { describe, expect, it } from "vitest";
import { assistantSuggestions, latestPublished } from "@/lib/assistant-suggestions";

const old = { id: "old", published: true, created_at: "2026-10-01T00:00:00Z", updated_at: "2026-10-01T00:00:00Z" };
const fresh = { id: "fresh", published: true, created_at: "2026-11-01T00:00:00Z", updated_at: "2026-11-01T00:00:00Z" };

describe("Automatic assistant CMS suggestions", () => {
  it("never suggests unpublished records", () => {
    expect(latestPublished([old, { ...fresh, published: false }])?.id).toBe("old");
  });
  it("replaces suggestions when new published articles, experts and events arrive", () => {
    const result = assistantSuggestions({ posts: [old, fresh], experts: [old, fresh], events: [{ ...old, event_date: "2026-11-20" }, { ...fresh, event_date: "2026-11-25" }] }, "2026-11-01");
    expect([result.post?.id, result.expert?.id, result.event?.id]).toEqual(["fresh", "fresh", "old"]);
  });
  it("uses CMS update time rather than backdated article publication or expert display order", () => {
    expect(latestPublished([fresh, { ...old, updated_at: "2026-11-02T00:00:00Z" }])?.id).toBe("old");
  });
  it("identifies newly added historical events as past, not upcoming", () => {
    expect(assistantSuggestions({ posts: [], experts: [], events: [{ ...fresh, event_date: "2023-06-17" }] }, "2026-11-01").eventPast).toBe(true);
  });
  it("returns no invented suggestions for an empty catalog", () => {
    expect(assistantSuggestions({ posts: [], experts: [], events: [] }, "2026-11-01")).toEqual({ post: undefined, expert: undefined, event: undefined, eventPast: false });
  });
  it("prioritizes the nearest published upcoming event over recently edited historical coverage", () => {
    const result = assistantSuggestions({ posts: [], experts: [], events: [{ ...fresh, event_date: "2024-09-20" }, { ...old, event_date: "2026-11-02" }, { ...fresh, id: "hidden", published: false, event_date: "2026-11-01" }] }, "2026-11-01");
    expect(result.event?.id).toBe("old");
    expect(result.eventPast).toBe(false);
  });
  it("falls back to the most recently held event, not the most recently imported old event", () => {
    const result = assistantSuggestions({ posts: [], experts: [], events: [{ ...fresh, event_date: "2022-11-27" }, { ...old, event_date: "2024-09-20" }] }, "2026-11-01");
    expect(result.event?.id).toBe("old");
    expect(result.eventPast).toBe(true);
  });
  it("avoids repeated event coverage by normalized bilingual title and selects the next distinct article", () => {
    const result = assistantSuggestions({ posts: [{ ...fresh, title: "  CEO TALKS: Bán hàng! " }, { ...old, title: "Nghiên cứu mới" }], experts: [], events: [{ ...fresh, title: "CEO Talks – Bán hàng", event_date: "2026-11-02" }] }, "2026-11-01");
    expect(result.post?.id).toBe("old");
  });
  it("suppresses duplicated article/event source URLs without hiding an expert cited in the same source", () => {
    const source_url = "https://example.org/institute/event";
    const result = assistantSuggestions({ posts: [{ ...fresh, title: "Bản tin", source_url: `${source_url}/?utm_source=cms` }], experts: [{ ...fresh, name: "Lê Dung", source_url }], events: [{ ...old, title: "VIP Dinner", source_url, event_date: "2026-11-20" }] }, "2026-11-01");
    expect(result.post).toBeUndefined();
    expect(result.expert?.id).toBe("fresh");
  });
  it("keeps the same suggestions when polling repeats or the catalog order changes", () => {
    const content = { posts: [old, fresh, fresh], experts: [fresh, old], events: [{ ...old, event_date: "2026-11-20" }] };
    expect(assistantSuggestions(content, "2026-11-01")).toEqual(assistantSuggestions({ ...content, posts: [...content.posts].reverse() }, "2026-11-01"));
  });
});