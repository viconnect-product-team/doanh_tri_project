import { FilterXSS } from "xss";

/** Article bodies are stored as HTML from the CMS editor; older rows are plain text. */
export const isRichHtml = (s: string) => /^\s*<(p|h[1-6]|ul|ol|blockquote|img|div|figure)[\s>]/i.test(s);

const filter = new FilterXSS({
  whiteList: {
    p: ["style"], h2: ["style"], h3: ["style"], strong: [], b: [], em: [], i: [], u: [], s: [], br: [],
    ul: [], ol: [], li: ["style"], blockquote: [], span: ["style"], hr: [],
    a: ["href", "target", "rel"], img: ["src", "alt", "title"],
  },
  css: { whiteList: { "text-align": true, color: true, "font-size": true, "font-family": true } },
  stripIgnoreTagBody: ["script", "style"],
  onTagAttr(tag, name, value) {
    if ((tag === "a" && name === "href") || (tag === "img" && name === "src")) {
      return /^(https:\/\/|\/(?!\/))/.test(value) ? `${name}="${value.replace(/"/g, "&quot;")}"` : "";
    }
    return undefined;
  },
});

export const sanitizeRichHtml = (html: string) => filter.process(html);
export const richTextPlain = (s: string) => (isRichHtml(s) ? s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() : s);
