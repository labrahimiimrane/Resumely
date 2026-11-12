// Built-in writing help. Static, plain-text content shipped with the app: no AI API, no network.

export type ActionVerbGroup = {
  readonly id: string;
  readonly label: string;
  readonly verbs: readonly string[];
};

export const SUMMARY_EXAMPLES: readonly string[] = [
  "Operations manager with 8 years of experience running multi-site logistics teams. Known for turning messy processes into clear, measurable workflows that cut costs and delays. Comfortable leading teams of 20+ through growth and change.",
  "Software engineer with 6 years of experience building reliable web applications in TypeScript and Python. Focused on clean architecture, thorough testing, and shipping features that customers actually use. Enjoys mentoring and improving team practices.",
  "Product designer with 7 years of experience shaping digital products from research to launch. Combines user research, interaction design, and design systems to deliver interfaces that are simple to use and easy to build.",
  "Marketing specialist with 5 years of experience planning and running campaigns across email, social, and paid search. Uses data to test ideas quickly and grow qualified leads. Strong writer and collaborative partner to sales teams.",
  "Financial analyst with 4 years of experience in budgeting, forecasting, and performance reporting. Turns complex data into clear recommendations for leadership. Skilled in financial modeling and building dashboards that support better decisions.",
  "Customer success manager with 6 years of experience supporting B2B software customers. Builds long-term relationships, reduces churn, and turns customer feedback into product improvements. Calm, organized, and focused on outcomes.",
];

export const PROFESSIONAL_PHRASES: readonly string[] = [
  "with a track record of",
  "years of experience in",
  "known for",
  "skilled in",
  "focused on delivering",
  "cross-functional teams",
  "from concept to launch",
  "measurable results",
  "data-driven decisions",
  "passionate about",
  "proven ability to",
  "committed to continuous improvement",
];

export const ACTION_VERB_GROUPS: readonly ActionVerbGroup[] = [
  {
    id: "leadership",
    label: "Leadership",
    verbs: ["Mentored", "Championed", "Coordinated", "Facilitated", "Scaled", "Spearheaded", "Directed", "Guided", "Led"],
  },
  {
    id: "achievement",
    label: "Achievement",
    verbs: ["Achieved", "Delivered", "Exceeded", "Earned", "Secured", "Surpassed", "Won", "Completed"],
  },
  {
    id: "building",
    label: "Building",
    verbs: ["Built", "Designed", "Developed", "Launched", "Created", "Established", "Implemented", "Introduced", "Founded"],
  },
  {
    id: "improvement",
    label: "Improvement",
    verbs: ["Improved", "Streamlined", "Reduced", "Increased", "Optimized", "Automated", "Simplified", "Accelerated", "Modernized"],
  },
  {
    id: "communication",
    label: "Communication",
    verbs: ["Presented", "Negotiated", "Collaborated", "Advised", "Authored", "Trained", "Persuaded", "Partnered"],
  },
  {
    id: "analysis",
    label: "Analysis",
    verbs: ["Analyzed", "Evaluated", "Researched", "Forecasted", "Identified", "Measured", "Assessed", "Audited", "Investigated"],
  },
];

export const ACHIEVEMENT_EXAMPLES: readonly string[] = [
  "Mentored 3 designers and introduced weekly critique, cutting review cycles from 5 days to 2.",
  "Led the redesign of the booking flow, lifting completed appointments by 23% in two quarters.",
  "Reduced monthly cloud costs by 30% by consolidating services and removing unused resources.",
  "Increased qualified leads by 45% in 6 months through targeted email and search campaigns.",
  "Automated weekly reporting, saving the team 10 hours per week and reducing errors.",
  "Delivered a new onboarding program that raised 90-day customer retention from 78% to 89%.",
  "Built and maintained a 120-component design system used by 4 product teams.",
  "Negotiated supplier contracts that lowered annual purchasing costs by $250,000.",
];
