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
}

export interface UniversityFilters {
  country: string;
  city: string;
  state: string;
  type: string;
  degreeType: string;
  costCategory: string;
  searchTerm: string;
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
