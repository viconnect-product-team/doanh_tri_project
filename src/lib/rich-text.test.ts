import { describe, expect, it } from "vitest";
import { isRichHtml, richTextPlain, sanitizeRichHtml } from "./rich-text";

describe("rich text", () => {
  it("removes scripts and event handlers", () => {
    const out = sanitizeRichHtml('<p onclick="x()">Hi<script>alert(1)</script></p><img src="javascript:1">');
    expect(out).not.toContain("script");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("javascript");
  });
  it("keeps formatting and https images", () => {
    const out = sanitizeRichHtml('<p style="text-align: center"><strong>A</strong></p><img src="https://x.vn/a.webp">');
    expect(out).toContain("text-align");
    expect(out).toContain("<strong>A</strong>");
    expect(out).toContain('src="https://x.vn/a.webp"');
  });
  it("treats legacy plain text as non-HTML", () => {
    expect(isRichHtml("Dòng 1\nDòng 2")).toBe(false);
    expect(richTextPlain("<p>Xin <b>chào</b></p>")).toBe("Xin chào");
  });
});
