import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
  @Input() totalItems = 0;
  @Input() pagination: PaginationState = { pageIndex: 0, pageSize: 10, totalItems: 0 };
  @Input() countrySlug = 'germany';

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
}
