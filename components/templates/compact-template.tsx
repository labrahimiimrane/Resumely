import { ContactList, SectionBody } from "@/components/templates/template-parts";
import type { TemplateProps } from "@/components/templates/template-props";
import type { PageSection } from "@/lib/cv/paginate";
import { cn } from "@/lib/utils";

export function CompactTemplate({ view }: TemplateProps) {
  const { header, sections } = view;
  return (
    <div className="flex flex-col gap-[calc(var(--cv-section-gap)*0.6)]">
      {header && (header.name || header.title || header.contacts.length > 0) ? (
        <header data-cv-header="">
          <div className="flex flex-wrap items-baseline gap-x-[0.6em]">
            {header.name ? <h1 className="text-[1.8em] leading-tight font-bold tracking-tight">{header.name}</h1> : null}
            {header.title ? (
              <p
                className={cn(
                  "text-[1.05em] font-semibold text-[color:var(--cv-primary)]",
                  header.name && "border-l border-cv-rule pl-[0.6em]",
                )}
              >
                {header.title}
              </p>
            ) : null}
          </div>
          {header.contacts.length > 0 ? <ContactList contacts={header.contacts} className="mt-[0.25em]" /> : null}
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
          className="mb-[0.35em] border-b border-cv-rule pb-[0.15em] text-[0.85em] font-bold tracking-[0.08em] text-[color:var(--cv-primary)] uppercase"
        >
          {section.heading}
        </h2>
      )}
      <SectionBody section={section} density="compact" />
    </section>
  );
}
