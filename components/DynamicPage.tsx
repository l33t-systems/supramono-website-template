import { SectionRenderer } from "@/components/sections/registry";
import type { PageContent } from "@/src/lib/supramono";

/** CMS-driven page: renders each section through the registry (native
    React where a component is registered, platform HTML otherwise).
    Pages with no structured sections fall back to whole-page HTML. */
export default function DynamicPage({ page }: { page: PageContent }) {
  const sections = (page.sections || []).filter(
    (s) => s.content !== undefined || s.html,
  );
  if (sections.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="prose-cms" dangerouslySetInnerHTML={{ __html: page.html }} />
      </div>
    );
  }
  return (
    <div className="space-y-4 py-4">
      {sections.map((section, i) => (
        <SectionRenderer key={`${section.type}-${i}`} section={section} />
      ))}
    </div>
  );
}
