import { ContactList, SectionBody } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PageSection } from "@/lib/cv/paginate";

export function ProfessionalTemplate({ view }: TemplateProps) {
  const { header, sections } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header && (header.name || header.title || header.contacts.length > 0) ? (
        <header data-cv-header="">
          {header.name ? <h1 className="text-[2.2em] leading-tight font-bold tracking-tight">{header.name}</h1> : null}
          {header.title ? (
            <p className="mt-[0.15em] text-[1.15em] font-semibold text-[color:var(--cv-primary)]">{header.title}</p>
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

function Section({ section }: { section: PageSection }) {
  return (
    <section data-cv-section={section.key} aria-labelledby={section.headingId}>
      {section.continued ? null : (
        <h2
          id={section.headingId}
          data-cv-heading=""
          className="mb-[0.6em] border-b border-cv-rule pb-[0.25em] text-[0.95em] font-bold tracking-[0.08em] text-[color:var(--cv-primary)] uppercase"
        >
          {section.heading}
        </h2>
      )}
      <SectionBody section={section} />
    </section>
  );
}
