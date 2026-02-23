// Category type for intelligence content
export type Category = 
  | 'AI_NEWS' 
  | 'PLACEMENT_TRENDS' 
  | 'SKILL_INSIGHTS' 
  | 'EDITORIAL' 
  | 'DAILY_GROWTH';

// Category definition with display properties
export interface CategoryDefinition {
  id: Category;
  label: string;
  color: string;
}

// Categories array for filtering and display
export const CATEGORIES: CategoryDefinition[] = [
  { id: 'AI_NEWS', label: 'AI News', color: 'bg-indigo-500' },
  { id: 'PLACEMENT_TRENDS', label: 'Placement Trends', color: 'bg-emerald-500' },
  { id: 'SKILL_INSIGHTS', label: 'Skill Insights', color: 'bg-amber-500' },
  { id: 'EDITORIAL', label: 'Editorial', color: 'bg-blue-500' },
  { id: 'DAILY_GROWTH', label: 'Daily Growth', color: 'bg-pink-500' },
];

// Deep knowledge structure for articles
export interface DeepKnowledge {
  introduction?: string;
  keyPoints: string[];
  whatNext?: string[];
}

// Content item structure for intelligence feed
export interface ContentItem {
  id: string;
  title: string;
  summary: string;
  category: Category;
  readTime: string;
  date: string;
  impactTag?: string;
  imageUrl?: string;
  relevanceScore?: number;
  deepKnowledge?: DeepKnowledge;
}
