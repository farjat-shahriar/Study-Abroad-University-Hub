import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FilterOptions, UniversityFilters } from '../../models/university.model';

@Component({
  selector: 'app-filter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './filter.html',
  styleUrl: './filter.scss',
})
export class Filter implements OnInit, OnChanges {
  @Input() filterOptions: FilterOptions | null = null;
  @Input() countryName = 'Germany';
  @Output() filtersApplied = new EventEmitter<UniversityFilters>();

  filterForm!: FormGroup;

  citySearch = '';
  stateSearch = '';
  filteredCities: string[] = [];
  filteredStates: string[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      country: [{ value: this.countryName, disabled: true }],
      city: [''],
      state: [''],
      type: [''],
      degreeType: [''],
      costCategory: [''],
      searchTerm: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countryName'] && this.filterForm) {
      this.filterForm.patchValue({ country: this.countryName });
    }
    if (changes['filterOptions'] && this.filterOptions) {
      this.filteredCities = [...this.filterOptions.cities];
      this.filteredStates = [...this.filterOptions.states];
    }
  }

  onCitySearchChange(): void {
    if (!this.filterOptions) return;
    const term = this.citySearch.toLowerCase();
    this.filteredCities = this.filterOptions.cities.filter((c) =>
      c.toLowerCase().includes(term)
    );
  }

  onStateSearchChange(): void {
    if (!this.filterOptions) return;
    const term = this.stateSearch.toLowerCase();
    this.filteredStates = this.filterOptions.states.filter((s) =>
      s.toLowerCase().includes(term)
    );
  }

  onDropdownOpened(type: 'city' | 'state'): void {
    if (type === 'city') {
      this.citySearch = '';
      this.onCitySearchChange();
    } else {
      this.stateSearch = '';
      this.onStateSearchChange();
    }
  }

  onApplyFilters(): void {
    const raw = this.filterForm.getRawValue();
    this.filtersApplied.emit(raw as UniversityFilters);
  }

  onResetFilters(): void {
    this.filterForm.reset({ country: this.countryName });
    this.citySearch = '';
    this.stateSearch = '';
    if (this.filterOptions) {
      this.filteredCities = [...this.filterOptions.cities];
      this.filteredStates = [...this.filterOptions.states];
    }
    this.filtersApplied.emit({
      country: this.countryName,
      city: '',
      state: '',
      type: '',
      degreeType: '',
      costCategory: '',
      searchTerm: '',
    });
  }
}
