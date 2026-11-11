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
          {header.contacts.length > 0 ? (
            <ul className="mt-[0.5em] flex flex-wrap gap-y-[0.2em] text-cv-muted [&>li+li]:ml-[0.6em] [&>li+li]:border-l [&>li+li]:border-cv-rule [&>li+li]:pl-[0.6em]">
              {header.contacts.map((contact) => (
                <li key={contact.kind}>
                  {contact.href ? (
                    <a href={contact.href} className="text-inherit no-underline">
                      {contact.text}
                    </a>
                  ) : (
                    contact.text
                  )}
                </li>
              ))}
            </ul>
          ) : null}
        </header>
      ) : null}
      {sections.map((section) => (
        <Section key={section.key} section={section} />
      ))}
    </div>
  );
}

function Section({ section }: { section: ViewSection }) {
  const headingId = `cv-${section.key.replace(/[^a-z0-9]+/gi, "-")}`;
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

function EntryHeading({ title, aside, sub }: { title: string; aside: string; sub: string }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-[1em]">
        {title ? <h3 className="font-semibold">{title}</h3> : <span />}
        {aside ? <p className="shrink-0 text-cv-muted">{aside}</p> : null}
      </div>
      {sub ? <p className="text-cv-muted">{sub}</p> : null}
    </>
  );
}

function SectionBody({ section }: { section: ViewSection }) {
  switch (section.type) {
    case "summary":
    case "custom":
      return <p className="whitespace-pre-line">{section.text}</p>;
    case "experience":
      return (
        <div className="flex flex-col gap-[0.9em]">
          {section.items.map((item) => (
            <div key={item.id}>
              <EntryHeading
                title={item.title}
                aside={item.dates}
                sub={[item.organization, item.location].filter(Boolean).join(", ")}
              />
              {item.bullets.length > 0 ? (
                <ul className="mt-[0.3em] list-disc pl-[1.2em] [&>li+li]:mt-[0.15em]">
                  {item.bullets.map((bullet, index) => (
                    <li key={index}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      );
    case "education":
      return (
        <div className="flex flex-col gap-[0.7em]">
          {section.items.map((item) => (
            <div key={item.id}>
              <EntryHeading
                title={[item.title, item.detail].filter(Boolean).join(", ")}
                aside={item.dates}
                sub={item.organization}
              />
              {item.description ? <p className="mt-[0.2em] whitespace-pre-line">{item.description}</p> : null}
            </div>
          ))}
        </div>
      );
    case "skills":
      return (
        <ul className="flex flex-col gap-[0.15em]">
          {section.groups.map((group) => (
            <li key={group.id}>
              {group.name ? <strong className="font-semibold">{group.name}: </strong> : null}
              {group.skills.join(", ")}
            </li>
          ))}
        </ul>
      );
    case "projects":
      return (
        <div className="flex flex-col gap-[0.7em]">
          {section.items.map((item) => (
            <div key={item.id}>
              <EntryHeading title={item.name} aside="" sub={item.technologies.join(", ")} />
              {item.description ? <p className="mt-[0.2em] whitespace-pre-line">{item.description}</p> : null}
              {item.links.length > 0 ? (
                <p className="mt-[0.2em] text-cv-muted">
                  {item.links.map((link, index) => (
                    <span key={link.href}>
                      {index > 0 ? " | " : null}
                      <a href={link.href} className="text-inherit no-underline">
                        {link.text}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      );
    case "certifications":
      return (
        <ul className="flex flex-col gap-[0.3em]">
          {section.items.map((item) => (
            <li key={item.id}>
              <div className="flex items-baseline justify-between gap-[1em]">
                <span>
                  {item.name ? <strong className="font-semibold">{item.name}</strong> : null}
                  {item.name && item.issuer ? ", " : null}
                  {item.issuer}
                  {item.link ? (
                    <>
                      {" | "}
                      <a href={item.link.href} className="text-cv-muted no-underline">
                        {item.link.text}
                      </a>
                    </>
                  ) : null}
                </span>
                {item.date ? <span className="shrink-0 text-cv-muted">{item.date}</span> : null}
              </div>
            </li>
          ))}
        </ul>
      );
    case "languages":
      return (
        <ul className="flex flex-wrap gap-x-[1.2em] gap-y-[0.15em]">
          {section.items.map((item) => (
            <li key={item.id}>
              {item.language}
              {item.proficiency ? <span className="text-cv-muted"> ({item.proficiency})</span> : null}
            </li>
          ))}
        </ul>
      );
  }
}
