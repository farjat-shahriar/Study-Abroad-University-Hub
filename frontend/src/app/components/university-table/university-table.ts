import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as XLSX from 'xlsx';
import { University, PaginationState, SortState } from '../../models/university.model';

@Component({
  selector: 'app-university-table',
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './university-table.html',
  styleUrl: './university-table.scss',
})
export class UniversityTable {
  @Input() universities: University[] = [];
  @Input() allFilteredUniversities: University[] = [];
  @Input() totalItems = 0;
  @Input() pagination: PaginationState = { pageIndex: 0, pageSize: 10, totalItems: 0 };
  @Input() countrySlug = 'germany';
  @Input() countryName = '';

  @Output() sortChanged = new EventEmitter<SortState>();
  @Output() pageChanged = new EventEmitter<PaginationState>();

  displayedColumns: string[] = [
    'ranking',
    'name',
    'city',
    'state',
    'type',
    'bachelorTuition',
    'masterTuition',
    'bachelorReq',
    'masterReq',
    'website',
  ];

  onSortChange(sort: Sort): void {
    const fieldMap: Record<string, string> = {
      bachelorTuition: 'bachelorTuitionEUR',
      masterTuition: 'masterTuitionEUR',
    };
    this.sortChanged.emit({
      active: fieldMap[sort.active] || sort.active,
      direction: sort.direction as SortState['direction'],
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageChanged.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      totalItems: this.totalItems,
    });
  }

  getCostClass(amount: number, isFree: boolean): string {
    if (isFree || amount === 0) return 'cost-free';
    if (amount < 3000) return 'cost-low';
    if (amount < 10000) return 'cost-medium';
    return 'cost-high';
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'Public': return 'type-public';
      case 'Private': return 'type-private';
      case 'Church-Affiliated': return 'type-church';
      default: return '';
    }
  }

  formatEUR(amount: number, isFree: boolean): string {
    if (isFree || amount === 0) return 'Free';
    return `€${amount.toLocaleString()}/yr`;
  }

  formatBDT(amount: number, isFree: boolean): string {
    if (isFree || amount === 0) return '৳0';
    return `৳${amount.toLocaleString()}/yr`;
  }

  exportToExcel(): void {
    const source = this.allFilteredUniversities.length
      ? this.allFilteredUniversities
      : this.universities;

    const rows = source.map((u) => ({
      'QS Rank': u.ranking ?? '—',
      'University': u.name,
      'Local Name': u.localName !== u.name ? u.localName : '',
      'Country': u.country,
      'City': u.city,
      'State / Region': u.state,
      'Type': u.type,
      'Category': u.category,
      'Degree Types': u.degreeTypes.join(', '),
      'BSc Tuition (EUR/yr)': u.isTuitionFree ? 0 : u.bachelorTuitionEUR,
      'BSc Tuition (BDT/yr)': u.isTuitionFree ? 0 : u.bachelorTuitionBDT,
      'MSc Tuition (EUR/yr)': u.isTuitionFree ? 0 : u.masterTuitionEUR,
      'MSc Tuition (BDT/yr)': u.isTuitionFree ? 0 : u.masterTuitionBDT,
      'Semester Fee (EUR)': u.semesterbeitrag || 0,
      'Tuition Free': u.isTuitionFree ? 'Yes' : 'No',
      'Cost Category': u.costCategory,
      'Tuition Note': u.tuitionNote,
      'BSc Requirements': u.bachelorRequirements,
      'MSc Requirements': u.masterRequirements,
      'Website': u.websiteUrl,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 8 }, { wch: 42 }, { wch: 36 }, { wch: 16 }, { wch: 20 },
      { wch: 20 }, { wch: 18 }, { wch: 26 }, { wch: 22 },
      { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
      { wch: 16 }, { wch: 12 }, { wch: 14 },
      { wch: 45 }, { wch: 45 }, { wch: 45 }, { wch: 45 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Universities');

    const label = this.countryName || this.countrySlug;
    XLSX.writeFile(wb, `${label}-universities.xlsx`);
  }
}
