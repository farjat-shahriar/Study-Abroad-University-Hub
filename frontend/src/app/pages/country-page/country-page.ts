import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Filter } from '../../components/filter/filter';
import { UniversityTable } from '../../components/university-table/university-table';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { UniversityService } from '../../services/university';
import { SCHENGEN_COUNTRIES, Country } from '../../models/country.model';
import {
  University,
  UniversityFilters,
  FilterOptions,
  PaginationState,
  SortState,
} from '../../models/university.model';

@Component({
  selector: 'app-country-page',
  imports: [CommonModule, MatIconModule, Filter, UniversityTable, LoadingSpinner],
  templateUrl: './country-page.html',
  styleUrl: './country-page.scss',
})
export class CountryPage implements OnInit, OnDestroy {
  private readonly universityService = inject(UniversityService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private routeSub!: Subscription;

  // Country info
  countrySlug = '';  // empty so first load always triggers
  countryInfo: Country | null = null;

  allUniversities: University[] = [];
  filteredUniversities: University[] = [];
  displayedUniversities: University[] = [];

  filterOptions: FilterOptions | null = null;
  loading = false;
  error: string | null = null;

  currentFilters: UniversityFilters = {
    country: '',
    city: '',
    state: '',
    type: '',
    degreeType: '',
    costCategory: '',
    searchTerm: '',
  };

  pagination: PaginationState = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
  };

  currentSort: SortState = { active: 'ranking', direction: 'asc' };

  ngOnInit(): void {
    this.universityService.loading$.subscribe((l) => (this.loading = l));
    this.universityService.error$.subscribe((e) => (this.error = e));

    // Detect country from route
    this.routeSub = this.route.url.subscribe((segments) => {
      const slug = segments.length > 0 ? segments[segments.length - 1].path : 'germany';
      if (slug !== this.countrySlug) {
        this.countrySlug = slug;
        this.countryInfo = SCHENGEN_COUNTRIES.find((c) => c.slug === slug) || null;
        this.currentFilters.country = this.countryInfo?.name || 'Germany';
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadData(): void {
    this.allUniversities = [];
    this.filteredUniversities = [];
    this.displayedUniversities = [];
    this.filterOptions = null;
    this.pagination.pageIndex = 0;

    this.universityService.fetchUniversities(this.countrySlug).subscribe((data) => {
      this.allUniversities = data;
      this.filterOptions = this.universityService.getFilterOptions(data);
      this.applyCurrentPipeline();
    });
  }

  onFiltersApplied(filters: UniversityFilters): void {
    this.currentFilters = filters;
    this.pagination.pageIndex = 0;
    this.applyCurrentPipeline();
  }

  onSortChanged(sort: SortState): void {
    this.currentSort = sort;
    this.applyCurrentPipeline();
  }

  onPageChanged(page: PaginationState): void {
    this.pagination = page;
    this.updateDisplayed();
  }

  private applyCurrentPipeline(): void {
    let result = this.universityService.applyFilters(this.allUniversities, this.currentFilters);
    result = this.universityService.sortUniversities(result, this.currentSort);
    this.filteredUniversities = result;
    this.pagination.totalItems = result.length;
    this.updateDisplayed();
  }

  private updateDisplayed(): void {
    this.displayedUniversities = this.universityService.paginate(
      this.filteredUniversities,
      this.pagination
    );
  }
}
