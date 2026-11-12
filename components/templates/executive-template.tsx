import { ContactList, CvPhoto, SectionBody, sectionHeadingId } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { ViewSection } from "@/lib/cv/render";

export function ExecutiveTemplate({ view }: TemplateProps) {
  const { header, sections, photo } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header.name || header.title || header.contacts.length > 0 || photo ? (
        <header className="flex flex-col items-center border-b-4 border-double border-[color:var(--cv-text)] pb-[0.9em] text-center">
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

function Section({ section }: { section: ViewSection }) {
  const headingId = sectionHeadingId(section);
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-[0.6em] border-b border-cv-rule pb-[0.3em] text-center text-[0.95em] font-semibold tracking-[0.14em] text-[color:var(--cv-primary)] uppercase"
      >
        {section.heading}
      </h2>
      <SectionBody section={section} />
    </section>
  );
}
