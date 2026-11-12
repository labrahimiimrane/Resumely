import { ContactList, SectionBody } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PageSection } from "@/lib/cv/paginate";

export function DeveloperTemplate({ view }: TemplateProps) {
  const { header, sections } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header && (header.name || header.title || header.contacts.length > 0) ? (
        <header data-cv-header="" className="border-b border-cv-rule pb-[0.8em]">
          {header.name ? <h1 className="text-[2.1em] leading-tight font-bold tracking-tight">{header.name}</h1> : null}
          {header.title ? (
            <p className="mt-[0.15em] text-[1.1em] font-semibold text-[color:var(--cv-primary)]">{header.title}</p>
          ) : null}
          {header.contacts.length > 0 ? <ContactList contacts={header.contacts} /> : null}
        </header>
      ) : null}
      {sections.map((section) => (
        <Section key={section.key} section={section} />
      ))}
    </div>
  );
}

// The split is a grid inside each section, so DOM order stays heading-then-body in view order for ATS parsers.
function Section({ section }: { section: PageSection }) {
  return (
    <section data-cv-section={section.key} aria-labelledby={section.headingId} className="grid grid-cols-[9em_minmax(0,1fr)] gap-x-[1.2em]">
      {section.continued ? (
        <div />
      ) : (
        <h2
          id={section.headingId}
          data-cv-heading=""
          className="self-start pt-[0.15em] text-[0.85em] leading-snug wrap-break-word font-bold tracking-[0.08em] text-[color:var(--cv-primary)] uppercase"
        >
          {section.heading}
        </h2>
      )}
      <div className="min-w-0">
        <SectionBody section={section} />
      </div>
    </section>
  );
}
