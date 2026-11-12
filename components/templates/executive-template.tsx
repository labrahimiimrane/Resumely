import { ContactList, CvPhoto, SectionBody } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PageSection } from "@/lib/cv/paginate";

export function ExecutiveTemplate({ view }: TemplateProps) {
  const { header, sections, photo } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header && (header.name || header.title || header.contacts.length > 0 || photo) ? (
        <header data-cv-header="" className="flex flex-col items-center border-b-4 border-double border-[color:var(--cv-text)] pb-[0.9em] text-center">
          {photo ? <CvPhoto src={photo} name={header.name} className="mb-[0.7em] size-[6em]" /> : null}
          {header.name ? (
            <h1 className="text-[2.2em] leading-tight font-semibold tracking-[0.06em]">{header.name}</h1>
          ) : null}
          {header.title ? (
            <p className="mt-[0.2em] text-[1.1em] font-medium text-[color:var(--cv-primary)]">{header.title}</p>
          ) : null}
          {header.contacts.length > 0 ? <ContactList contacts={header.contacts} className="justify-center" /> : null}
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
          className="mb-[0.6em] border-b border-cv-rule pb-[0.3em] text-center text-[0.95em] font-semibold tracking-[0.14em] text-[color:var(--cv-primary)] uppercase"
        >
          {section.heading}
        </h2>
      )}
      <SectionBody section={section} />
    </section>
  );
}
