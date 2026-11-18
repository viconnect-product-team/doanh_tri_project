import { createServerFn } from "@tanstack/react-start";
import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { vi } from "@/content/vi";
import { en } from "@/content/en";

const schema = z.object({
  summary: z.string(),
  recommendations: z.array(
    z.object({ kind: z.enum(["training", "consulting"]), name: z.string(), match: z.number(), reason: z.string(), benefit: z.string() }),
  ),
  nextStep: z.string(),
});
export type AdvisorResult = z.infer<typeof schema>;

export const recommendPrograms = createServerFn({ method: "POST" })
  .validator((input: { need: string; locale?: string; audience?: string; size?: string }) => {
    const need = String(input?.need ?? "").trim();
    if (need.length < 10 || need.length > 2000) throw new Error("INVALID_INPUT");
    const clip = (v: unknown) => String(v ?? "").trim().slice(0, 100);
    return { need, locale: input?.locale === "en" ? "en" : "vi", audience: clip(input?.audience), size: clip(input?.size) } as const;
  })
  .handler(async ({ data }): Promise<{ ok: true; result: AdvisorResult } | { ok: false; error: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "config" };
    const d = data.locale === "en" ? en : vi;
    const { fetchPublicContent } = await import("./cms.server");
    let courses: { title: string; tag: string; description: string; duration: string; start: string }[] = d.training.programs.map((p) => ({ title: p.title, tag: p.tag, description: p.desc, duration: p.dur, start: p.date }));
    try {
      const { courses: rows } = await fetchPublicContent();
      const en = data.locale === "en";
      if (rows.length) courses = rows.map((r) => ({ title: (en && r.title_en) || r.title, tag: (en && r.tag_en) || r.tag, description: (en && r.description_en) || r.description, duration: (en && r.duration_en) || r.duration, start: r.start_date }));
    } catch { /* fall back to built-in list */ }
    const catalog = [
      ...courses.map((p) => `- [training] ${p.title} | ${p.tag} | ${p.description} | ${p.duration}${p.start ? `, khai giảng ${p.start}` : ""}`),
      `- [training] ${d.training.flagshipTitle}: ${d.training.flagshipText}`,
      ...d.consulting.services.map((s) => `- [consulting] ${s.title}: ${s.desc}`),
    ].join("\n");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions: [
          "Bạn là chuyên viên tư vấn cấp cao của Viện Doanh Trí.",
          "Quy trình: (1) xác định vai trò, quy mô, vấn đề cốt lõi và mục tiêu của khách; (2) so khớp với TỪNG mục trong danh mục; (3) chỉ chọn 1-3 mục thực sự liên quan, sắp xếp từ phù hợp nhất.",
          "Quy tắc: 'name' phải sao chép CHÍNH XÁC tên trong danh mục, không bịa mục mới. 'match' là mức phù hợp 0-100 (trung thực, không thổi phồng). 'reason' nêu cụ thể chi tiết nào trong nhu cầu khớp với mục (1-2 câu). 'benefit' là kết quả cụ thể khách nhận được (1 câu).",
          "Nếu nhu cầu kết hợp nâng cao năng lực con người và giải quyết bài toán tổ chức, nên đề xuất cả đào tạo và tư vấn. 'summary' tóm tắt nhu cầu trong 1-2 câu. 'nextStep' là một hành động cụ thể.",
          `Trả lời bằng ${data.locale === "en" ? "tiếng Anh (English)" : "tiếng Việt"}, ngắn gọn, chuyên nghiệp.`,
          `\nDanh mục:\n${catalog}`,
        ].join("\n"),
        messages: [{ role: "user", content: [data.audience && `Đối tượng: ${data.audience}`, data.size && `Quy mô: ${data.size}`, `Nhu cầu: ${data.need}`].filter(Boolean).join("\n") }],
        output: Output.object({ schema }),
        maxRetries: 0,
        providerOptions: {
          openai: {
            store: false,
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      // Keep only items that exist in the catalog, best match first.
      const names = new Set([...courses.map((c) => c.title), d.training.flagshipTitle, ...d.consulting.services.map((s) => s.title)]);
      out.recommendations = out.recommendations
        .filter((r) => names.has(r.name))
        .map((r) => ({ ...r, match: Math.max(0, Math.min(100, Math.round(r.match))) }))
        .sort((a, b) => b.match - a.match)
        .slice(0, 3);
      if (!out.recommendations.length) return { ok: false, error: "generic" };
      return { ok: true, result: out };
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      console.error("advisor error", status, e);
      if (status === 429) return { ok: false, error: "rate" };
      if (status === 402) return { ok: false, error: "credits" };
      return { ok: false, error: "generic" };
    }
  });
