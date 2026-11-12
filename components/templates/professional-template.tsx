import { ContactList, SectionBody, sectionHeadingId } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { ViewSection } from "@/lib/cv/render";

export function ProfessionalTemplate({ view }: TemplateProps) {
  const { header, sections } = view;
  return (
    <div className="flex flex-col gap-[var(--cv-section-gap)]">
      {header.name || header.title || header.contacts.length > 0 ? (
        <header>
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

function Section({ section }: { section: ViewSection }) {
  const headingId = sectionHeadingId(section);
  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="mb-[0.6em] border-b border-cv-rule pb-[0.25em] text-[0.95em] font-bold tracking-[0.08em] text-[color:var(--cv-primary)] uppercase"
      >
        {section.heading}
      </h2>
      <SectionBody section={section} />
    </section>
  );
}
