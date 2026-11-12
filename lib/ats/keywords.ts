import { buildCvView } from "@/lib/cv/render";
import type { CvDocument } from "@/types/cv";

/** `term` is the normalized match key; `display` keeps the first-seen original casing. */
export type Keyword = { term: string; display: string };
export type KeywordMatch = { found: Keyword[]; missing: Keyword[]; total: number };

export const MAX_JOB_DESCRIPTION_LENGTH = 10_000;
export const MAX_KEYWORDS = 20;

// Common English words plus job-ad filler that says nothing about the role's skills.
const STOP_WORDS: ReadonlySet<string> = new Set(
  (
    "a about above after again against all also am an and any are as at be because been before being below " +
    "between both but by can could did do does doing down during each either etc every few for from further " +
    "had has have having he her here hers him his how i if in into is it its itself just may me might more " +
    "most must my no nor not now of off on once only or other our ours out over own per same shall she should " +
    "so some such than that the their theirs them then there these they this those through to too under until " +
    "up upon us very via was we were what when where which while who whom why with within without would yet " +
    "you your yours e.g i.e and/or " +
    "ability able across apply applicant applicants around best candidate candidates company day daily " +
    "environment excellent experience experienced great help hiring ideal ideally including join key knowledge " +
    "like looking make new opportunity plus position preferred required requirement requirements " +
    "responsibilities responsible role skill skills strong team teams understanding using well will work " +
    "working year years"
  ).split(" "),
);

type Token = { raw: string; term: string; stop: boolean };

const URL_OR_EMAIL = /https?:\/\/\S+|\S+@\S+/gi;

// One-dot `.net` and `.io` names are usually tech (asp.net, socket.io), so only longer ones count as domains.
function isDomain(lower: string): boolean {
  if (lower.startsWith("www.") || /\.(com|org|gov|edu|co\.uk)$/.test(lower)) return true;
  return /\.(net|io)$/.test(lower) && lower.split(".").length > 2;
}

function normalize(lower: string): string {
  return lower.length > 3 && lower.endsWith("s") && !lower.endsWith("ss") ? lower.slice(0, -1) : lower;
}

/** Splits text into sentence or line segments so phrases never span a boundary. */
function segments(text: string): string[] {
  return text.split(/[\n!?;:,()[\]{}"“”]+|\.(?=\s|$)/);
}

function tokenize(segment: string): Token[] {
  const tokens: Token[] = [];
  for (const match of segment.match(/[\p{L}\p{N}+#./-]+/gu) ?? []) {
    const raw = match.replace(/^[./-]+|[./-]+$/g, "");
    if (!/\p{L}/u.test(raw)) continue;
    const lower = raw.toLowerCase();
    const term = normalize(lower);
    tokens.push({ raw, term, stop: STOP_WORDS.has(lower) || STOP_WORDS.has(term) || isDomain(lower) });
  }
  return tokens;
}

type Candidate = { keyword: Keyword; count: number; first: number; words: 1 | 2 };
type SingleCandidate = Candidate & { uncovered: number };

/** Counts, per single word, the occurrences that are not part of a kept phrase. */
function countUncovered(segmentTokens: Token[][], singles: Map<string, SingleCandidate>, kept: Set<string>): void {
  for (const tokens of segmentTokens) {
    tokens.forEach((token, index) => {
      const single = singles.get(token.term);
      if (!single || token.stop) return;
      const before = tokens[index - 1];
      const after = tokens[index + 1];
      const covered =
        (before !== undefined && kept.has(`${before.term} ${token.term}`)) ||
        (after !== undefined && kept.has(`${token.term} ${after.term}`));
      if (!covered) single.uncovered += 1;
    });
  }
}

/** Extracts up to MAX_KEYWORDS keywords from a job description. Same input, same output. */
export function extractKeywords(text: string): Keyword[] {
  const segmentTokens = segments(text.slice(0, MAX_JOB_DESCRIPTION_LENGTH).replace(URL_OR_EMAIL, " ")).map(tokenize);

  const singles = new Map<string, SingleCandidate>();
  const pairs = new Map<string, Candidate>();
  let position = 0;

  for (const tokens of segmentTokens) {
    tokens.forEach((token, index) => {
      const at = position + index;
      if (!token.stop && token.term.length >= 2) {
        const single = singles.get(token.term);
        if (single) single.count += 1;
        else
          singles.set(token.term, {
            keyword: { term: token.term, display: token.raw },
            count: 1,
            first: at,
            words: 1,
            uncovered: 0,
          });
      }
      const next = tokens[index + 1];
      if (next && !token.stop && !next.stop) {
        const term = `${token.term} ${next.term}`;
        const pair = pairs.get(term);
        if (pair) pair.count += 1;
        else pairs.set(term, { keyword: { term, display: `${token.raw} ${next.raw}` }, count: 1, first: at, words: 2 });
      }
    });
    position += tokens.length;
  }

  const kept = new Set([...pairs.values()].filter((pair) => pair.count >= 2).map((pair) => pair.keyword.term));

  countUncovered(segmentTokens, singles, kept);

  const candidates: Candidate[] = [
    ...[...pairs.values()].filter((pair) => kept.has(pair.keyword.term)),
    ...[...singles.values()].filter(
      (single) => single.uncovered > 0 && (single.count >= 2 || /[0-9+#./]/.test(single.keyword.term)),
    ),
  ];

  return candidates
    .sort((a, b) => b.count - a.count || b.words - a.words || a.first - b.first)
    .slice(0, MAX_KEYWORDS)
    .map((candidate) => candidate.keyword);
}

/** The visible CV text: hidden sections and disabled entries are already excluded by the view. */
function cvTexts(cv: CvDocument): string[] {
  const view = buildCvView(cv);
  const texts = [view.header.name, view.header.title];
  for (const section of view.sections) {
    switch (section.type) {
      case "summary":
        texts.push(section.text);
        break;
      case "experience":
        for (const item of section.items) texts.push(item.title, item.organization, ...item.bullets);
        break;
      case "education":
        for (const item of section.items) texts.push(item.title, item.organization, item.detail, item.description);
        break;
      case "skills":
        for (const group of section.groups) texts.push(group.name, ...group.skills);
        break;
      case "projects":
        for (const item of section.items) texts.push(item.name, item.description, ...item.technologies);
        break;
      case "certifications":
        for (const item of section.items) texts.push(item.name, item.issuer);
        break;
      case "languages":
        for (const item of section.items) texts.push(item.language, item.proficiency);
        break;
      case "custom":
        texts.push(section.title, section.text);
        break;
    }
  }
  return texts;
}

/** Splits keywords into those whose normalized words appear contiguously in the visible CV, and the rest. */
export function matchKeywords(keywords: Keyword[], cv: CvDocument): KeywordMatch {
  const present = new Set<string>();
  for (const text of cvTexts(cv)) {
    for (const segment of segments(text)) {
      const tokens = tokenize(segment);
      tokens.forEach((token, index) => {
        present.add(token.term);
        const next = tokens[index + 1];
        if (next) present.add(`${token.term} ${next.term}`);
      });
    }
  }
  const found = keywords.filter((keyword) => present.has(keyword.term));
  const missing = keywords.filter((keyword) => !present.has(keyword.term));
  return { found, missing, total: keywords.length };
}
