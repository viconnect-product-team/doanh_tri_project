import { createFileRoute } from "@tanstack/react-router";
import { AiAdvisor } from "@/components/site/AiAdvisor";
import { Breadcrumb, Section } from "@/components/site/Layout";
import { t } from "@/content/i18n";

export const Route = createFileRoute("/tu-van-ai")({
  head: () => ({
    meta: [
      { title: "Trợ lý tư vấn AI – Viện Doanh Trí" },
      { name: "description", content: "Mô tả nhu cầu để AI đề xuất chương trình đào tạo hoặc dịch vụ tư vấn phù hợp." },
      { property: "og:title", content: "Trợ lý tư vấn AI – Viện Doanh Trí" },
      { property: "og:description", content: "Mô tả nhu cầu để AI đề xuất chương trình đào tạo hoặc dịch vụ tư vấn phù hợp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Section className="py-12">
      <Breadcrumb items={[t.advisor.navLabel]} />
      <AiAdvisor />
    </Section>
  ),
});
