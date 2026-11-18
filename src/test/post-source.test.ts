import { describe, expect, it } from "vitest";
import { postSourceUrl } from "../lib/post-source";

describe("original article source links", () => {
  it("preserves a valid original HTTPS article URL", () => {
    expect(postSourceUrl("https://example.com/news/le-dung-1983.html")).toBe("https://example.com/news/le-dung-1983.html");
  });
  it("rejects executable, malformed and credential-bearing links", () => {
    for (const value of ["javascript:alert(1)", "not a URL", "https://user:pass@example.com", "", null]) {
      expect(postSourceUrl(value)).toBeNull();
    }
  });
});