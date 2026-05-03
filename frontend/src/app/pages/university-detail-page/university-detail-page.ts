import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { UniversityService } from '../../services/university';
import { University } from '../../models/university.model';

@Component({
  selector: 'app-university-detail-page',
  imports: [CommonModule, RouterLink, MatIconModule, MatChipsModule, LoadingSpinner],
  templateUrl: './university-detail-page.html',
  styleUrl: './university-detail-page.scss',
})
export class UniversityDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly universityService = inject(UniversityService);
  private readonly location = inject(Location);

  university: University | null = null;
  countrySlug = '';
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.countrySlug = this.route.snapshot.queryParamMap.get('country') || '';

    if (!this.countrySlug) {
      this.error = 'Country not specified.';
      this.loading = false;
      return;
    }

    this.universityService.fetchUniversities(this.countrySlug).subscribe({
      next: (unis) => {
        this.university = unis.find((u) => u.id === id) ?? null;
        if (!this.university) {
          this.error = `University with ID ${id} not found in ${this.countrySlug}.`;
        }
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load university data.';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  formatEUR(amount: number | undefined, isFree: boolean): string {
    if (!amount && isFree) return 'Free';
    if (!amount) return 'N/A';
    return '€' + amount.toLocaleString() + '/yr';
  }

  formatUSD(amount: number | undefined): string {
    if (amount == null) return 'N/A';
    return '$' + amount.toLocaleString() + '/yr';
  }

  getDifficultyLabel(d: string | undefined): string {
    const map: Record<string, string> = {
      easy: 'Easy',
      moderate: 'Moderate',
      competitive: 'Competitive',
      highly_competitive: 'Highly Competitive',
    };
    return map[d ?? ''] ?? 'Not specified';
  }

  getDifficultyClass(d: string | undefined): string {
    const map: Record<string, string> = {
      easy: 'diff-easy',
      moderate: 'diff-moderate',
      competitive: 'diff-competitive',
      highly_competitive: 'diff-high',
    };
    return map[d ?? ''] ?? '';
  }

  getStudyGapLabel(v: boolean | 'conditional' | undefined): string {
    if (v === true) return 'Yes';
    if (v === 'conditional') return 'Conditional';
    if (v === false) return 'No';
    return 'Not specified';
  }
}
