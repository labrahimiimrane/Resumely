import { FixButton } from "@/components/ats/check-list";
import type { AtsRecommendation } from "@/lib/ats/analyze";
import type { EditorSectionId } from "@/lib/cv/sections";
import { cn } from "@/lib/utils";

type RecommendationListProps = {
  recommendations: AtsRecommendation[];
  onFix: (id: EditorSectionId) => void;
};

export function RecommendationList({ recommendations, onFix }: RecommendationListProps) {
  return (
    <section aria-labelledby="ats-recommendations-heading" className="rounded-xl border bg-card p-6 shadow-xs">
      <h2 id="ats-recommendations-heading" className="text-[15px] font-semibold">
        Recommendations
      </h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">Highest impact first</p>
      {recommendations.length === 0 ? (
        <p className="mt-4 text-[13px] text-muted-foreground">Nothing to fix right now.</p>
      ) : (
        <ol className="mt-2">
          {recommendations.map((item, index) => (
            <li key={item.id} className="flex gap-3 border-t py-3 first:border-t-0">
              <span
                aria-hidden="true"
                className="grid size-[22px] shrink-0 place-items-center rounded-md bg-sidebar-accent font-mono text-xs text-sidebar-accent-foreground"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1 break-words">
                <p className="text-[13px] font-medium">
                  {item.title}
                  <span
                    className={cn(
                      "ml-1.5 rounded-full px-[7px] py-px align-[1px] text-[11px] font-medium",
                      item.impact === "High" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning",
                    )}
                  >
                    <span className="sr-only">Impact: </span>
                    {item.impact}
                  </span>
                </p>
                <p className="mt-0.5 text-xs leading-normal text-muted-foreground">{item.advice}</p>
                <div className="mt-1 -ml-2">
                  <FixButton section={item.section} onFix={onFix} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
