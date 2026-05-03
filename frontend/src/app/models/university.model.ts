export interface University {
  id: number;
  name: string;
  localName: string;        // germanName → localName (works for all countries)
  country: string;
  city: string;
  state: string;
  type: 'Public' | 'Private' | 'Church-Affiliated';
  category: string;
  degreeTypes: string[];
  ranking: number | null;

  // Tuition — separate Bachelor & Master
  bachelorTuitionEUR: number;
  bachelorTuitionBDT: number;
  masterTuitionEUR: number;
  masterTuitionBDT: number;
  semesterbeitrag: number;         // Germany-specific semester contribution
  isTuitionFree: boolean;
  costCategory: 'Free' | 'Low' | 'Medium' | 'High';
  tuitionNote: string;             // feeNote → tuitionNote

  // Requirements — separate Bachelor & Master
  bachelorRequirements: string;
  masterRequirements: string;

  websiteUrl: string;

  // ── Phase 1 decision-support fields (optional — populated incrementally) ──
  livingCostUSD?: number;
  totalCostUSD?: number;
  gpaRequirement?: number;
  ieltsRequirement?: number;
  englishMediumAllowed?: boolean;
  studyGapAllowed?: boolean | 'conditional';
  admissionDifficulty?: 'easy' | 'moderate' | 'competitive' | 'highly_competitive';
  intakeSessions?: string[];
  applicationDeadline?: string;
  scholarshipAvailable?: boolean;
  scholarshipDetails?: string;
  applicationUrl?: string;
}

export interface UniversityFilters {
  country: string;
  city: string;
  state: string;
  type: string;
  degreeType: string;
  costCategory: string;
  searchTerm: string;
  // Advanced eligibility filters
  budgetMin?: number;
  budgetMax?: number;
  gpaMin?: number;
  ieltsMin?: number;
  admissionDifficulty?: string;
  scholarshipOnly?: boolean;
  studyGapAllowed?: boolean;
}

// ── Student profile ──
export interface StudentProfile {
  gpa: number;       // 0–4.0
  ielts: number;     // 0–9.0
  budgetMin: number; // USD/yr
  budgetMax: number; // USD/yr
}

// ── Recommendation output ──
export interface UniversityRecommendation {
  university: University;
  countrySlug: string;
  countryName: string;
  matchScore: number; // 0–100, higher = better match
}

export interface FilterOptions {
  cities: string[];
  states: string[];
  types: string[];
  degreeTypes: string[];
  costCategories: string[];
}

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems: number;
}

export type SortDirection = 'asc' | 'desc' | '';

export interface SortState {
  active: string;
  direction: SortDirection;
}
