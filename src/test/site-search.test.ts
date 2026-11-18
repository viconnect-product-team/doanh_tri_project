import { describe, expect, it } from "vitest";
import { buildSearchIndex, normalizeSearch, searchSite, searchSnippet, type SearchContent } from "@/lib/site-search";

const content = {
  courses: [{ id: "c1", published: true, title: "AI cho lãnh đạo", title_en: "AI for leaders", description: "Quản trị doanh nghiệp", tag: "AI" }],
  experts: [{ id: "e1", published: true, name: "TS. Nguyễn Thị Lan Anh", role: "Chính sách", bio: "Kinh tế xanh" }],
  events: [{ id: "ev1", published: true, title: "Diễn đàn doanh trí", description: "Cộng đồng", place: "Hà Nội" }],
  posts: [{ id: "p1", published: true, title: "Đối thoại", body: "TS. Nguyễn Thị Lan Anh chia sẻ về AI cho lãnh đạo." }, { id: "p2", published: false, title: "Nội dung bí mật", body: "Nguyễn Thị Lan Anh" }],
} as unknown as SearchContent;

describe("global website search", () => {
  const entries = buildSearchIndex(content, "vi");
  it("finds an expert and article body mentioning their name without accents", () => {
    expect(searchSite(entries, "nguyen thi lan anh").map(r => r.id)).toEqual(["experts-e1", "posts-p1", "/ve-vien"]);
  });
  it("finds courses and events with stable destinations", () => {
    expect(searchSite(entries, "AI cho lanh dao", "courses")[0]).toMatchObject({ to: "/dao-tao", hash: "courses-c1" });
    expect(searchSite(entries, "dien dan", "events")[0]).toMatchObject({ to: "/tin-tuc", hash: "events-ev1" });
  });
  it("finds primary page content", () => {
    expect(searchSite(entries, "Nhà nước Nhà khoa học", "pages").map(r => r.to)).toContain("/");
  });
  it("excludes unpublished rows and private content", () => {
    expect(entries.some(r => r.id === "posts-p2")).toBe(false);
    expect(searchSite(entries, "bí mật", "posts")).toEqual([]);
    expect(entries.some(r => r.to.includes("crm"))).toBe(false);
  });
  it("searches both languages and displays the selected language", () => {
    expect(searchSite(buildSearchIndex(content, "en"), "AI cho lãnh đạo", "courses")[0]?.title).toBe("AI for leaders");
    expect(searchSite(entries, "AI for leaders", "courses")[0]?.title).toBe("AI cho lãnh đạo");
  });
  it("requires all query words and handles empty searches", () => {
    expect(searchSite(entries, "AI impossible")).toEqual([]);
    expect(searchSite(entries, "  ")).toEqual([]);
    expect(normalizeSearch(" ĐÀO   TẠO ")).toBe("dao tao");
  });
  it("does not confuse AI with Vietnamese words containing ai", () => {
    const extra = { id: "other", kind: "courses" as const, title: "Lãnh đạo thời đại mới", searchable: "Phát triển tài năng", text: "", to: "/dao-tao" as const };
    expect(searchSite([...entries, extra], "AI", "courses").map(r => r.id)).toEqual(["courses-c1"]);
  });
  it("shows a snippet around matches in article bodies", () => {
    expect(searchSnippet("Mở đầu. ".repeat(80) + "Nguyễn Thị Lan Anh chia sẻ.", "nguyen")).toContain("Nguyễn Thị Lan Anh");
  });
});