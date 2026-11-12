import type { PageView } from "@/lib/cv/paginate";
import type { PresentationSettings } from "@/types/cv";

export type TemplateProps = {
  view: PageView;
  settings: PresentationSettings;
};
