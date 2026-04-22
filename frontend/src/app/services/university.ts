import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, of, delay, tap } from 'rxjs';
import {
  University,
  UniversityFilters,
  FilterOptions,
  PaginationState,
  SortState,
} from '../models/university.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UniversityService {
  private readonly http = inject(HttpClient);

  // Country → JSON file mapping
  // TODO: Switch to backend API when ready (e.g. /api/universities?country=germany)
  private readonly countryDataUrls: Record<string, string> = {
    germany: 'data/universities.json',
    spain: 'data/spain-universities.json',
    italy: 'data/italy-universities.json',
    sweden: 'data/sweden-universities.json',
    france: 'data/france-universities.json',
    hungary: 'data/hungary-universities.json',
    malta: 'data/malta-universities.json',
    denmark: 'data/denmark-universities.json',
    finland: 'data/finland-universities.json',
    netherlands: 'data/netherlands-universities.json',
    austria: 'data/austria-universities.json',
    'czech-republic': 'data/czech-republic-universities.json',
    norway: 'data/norway-universities.json',
    switzerland: 'data/switzerland-universities.json',
    portugal: 'data/portugal-universities.json',
    belgium: 'data/belgium-universities.json',
    poland: 'data/poland-universities.json',
    greece: 'data/greece-universities.json',
    croatia: 'data/croatia-universities.json',
    romania: 'data/romania-universities.json',
    bulgaria: 'data/bulgaria-universities.json',
    slovakia: 'data/slovakia-universities.json',
    slovenia: 'data/slovenia-universities.json',
    estonia: 'data/estonia-universities.json',
    latvia: 'data/latvia-universities.json',
    lithuania: 'data/lithuania-universities.json',
    iceland: 'data/iceland-universities.json',
    liechtenstein: 'data/liechtenstein-universities.json',
    luxembourg: 'data/luxembourg-universities.json',
  };

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  // Per-country cache
  private cache = new Map<string, University[]>();

  /**
   * Fetch universities for a specific country.
   */
  fetchUniversities(country: string = 'germany'): Observable<University[]> {
    const cached = this.cache.get(country);
    if (cached) {
      return of(cached);
    }

    const path = this.countryDataUrls[country];
    if (!path) {
      this.errorSubject.next(`No data available for ${country}`);
      return of([]);
    }
    const url = environment.apiBaseUrl ? `${environment.apiBaseUrl}/${path}` : path;

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<University[]>(url).pipe(
      delay(300),
      tap((data) => {
        this.cache.set(country, data);
        this.loadingSubject.next(false);
      }),
      catchError((err) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(`Failed to load university data for ${country}. Please try again.`);
        console.error('UniversityService error:', err);
        return of([]);
      })
    );
  }

  getFilterOptions(universities: University[]): FilterOptions {
    return {
      cities: [...new Set(universities.map((u) => u.city))].sort(),
      states: [...new Set(universities.map((u) => u.state).filter(s => s))].sort(),
      types: [...new Set(universities.map((u) => u.type))].sort(),
      degreeTypes: [...new Set(universities.flatMap((u) => u.degreeTypes))].sort(),
      costCategories: ['Free', 'Low', 'Medium', 'High'],
    };
  }

  applyFilters(universities: University[], filters: UniversityFilters): University[] {
    return universities.filter((u) => {
      const matchCity = !filters.city || u.city === filters.city;
      const matchState = !filters.state || u.state === filters.state;
      const matchType = !filters.type || u.type === filters.type;
      const matchDegree = !filters.degreeType || u.degreeTypes.includes(filters.degreeType);
      const matchCost = !filters.costCategory || u.costCategory === filters.costCategory;
      const matchSearch =
        !filters.searchTerm ||
        u.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        u.localName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        u.city.toLowerCase().includes(filters.searchTerm.toLowerCase());

      return matchCity && matchState && matchType && matchDegree && matchCost && matchSearch;
    });
  }

  sortUniversities(universities: University[], sort: SortState): University[] {
    if (!sort.active || sort.direction === '') {
      return universities;
    }

    return [...universities].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const valA = (a as unknown as Record<string, unknown>)[sort.active];
      const valB = (b as unknown as Record<string, unknown>)[sort.active];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }

      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  paginate(universities: University[], pagination: PaginationState): University[] {
    const start = pagination.pageIndex * pagination.pageSize;
    return universities.slice(start, start + pagination.pageSize);
  }

  clearCache(country?: string): void {
    if (country) {
      this.cache.delete(country);
    } else {
      this.cache.clear();
    }
  }

  isCountryAvailable(slug: string): boolean {
    return slug in this.countryDataUrls;
  }
}
