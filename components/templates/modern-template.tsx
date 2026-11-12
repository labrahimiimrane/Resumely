import { ContactList, CvPhoto, SectionBody } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PageSection } from "@/lib/cv/paginate";

export function ModernTemplate({ view }: TemplateProps) {
  const { header, sections, photo } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header && (header.name || header.title || header.contacts.length > 0 || photo) ? (
        <header data-cv-header="" className="flex items-start justify-between gap-[1.5em] border-b-2 border-[color:var(--cv-primary)] pb-[0.9em]">
          <div className="min-w-0">
            {header.name ? (
              <h1 className="text-[2.3em] leading-tight font-bold tracking-tight">{header.name}</h1>
            ) : null}
            {header.title ? (
              <p className="mt-[0.15em] text-[1.15em] font-semibold text-[color:var(--cv-primary)]">{header.title}</p>
            ) : null}
            {header.contacts.length > 0 ? <ContactList contacts={header.contacts} /> : null}
          </div>
          {photo ? <CvPhoto src={photo} name={header.name} className="size-[6.5em]" /> : null}
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
          className="mb-[0.6em] border-l-[3px] border-[color:var(--cv-primary)] pl-[0.5em] text-[0.95em] leading-tight font-bold tracking-[0.06em] text-[color:var(--cv-primary)] uppercase"
        >
          {section.heading}
        </h2>
      )}
      <SectionBody section={section} />
    </section>
  );
}
