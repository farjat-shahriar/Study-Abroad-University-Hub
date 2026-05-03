import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniversityRecommendation } from '../../models/university.model';
import { REGION_GROUPS } from '../../models/country.model';

@Component({
  selector: 'app-recommendation-card',
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule],
  templateUrl: './recommendation-card.html',
  styleUrl: './recommendation-card.scss',
})
export class RecommendationCard {
  @Input() recommendation!: UniversityRecommendation;
  @Input() rank = 1;

  private readonly flagMap = Object.fromEntries(
    REGION_GROUPS.flatMap((g) => g.countries.map((c) => [c.slug, c.flag]))
  );

  get flag(): string {
    return this.flagMap[this.recommendation.countrySlug] ?? '🌍';
  }

  get difficultyLabel(): string {
    const map: Record<string, string> = {
      easy: 'Easy',
      moderate: 'Moderate',
      competitive: 'Competitive',
      highly_competitive: 'Highly Competitive',
    };
    return map[this.recommendation.university.admissionDifficulty ?? ''] ?? 'N/A';
  }

  get difficultyClass(): string {
    const map: Record<string, string> = {
      easy: 'diff-easy',
      moderate: 'diff-moderate',
      competitive: 'diff-competitive',
      highly_competitive: 'diff-high',
    };
    return map[this.recommendation.university.admissionDifficulty ?? ''] ?? '';
  }

  formatCost(usd: number | undefined): string {
    if (usd == null) return 'N/A';
    return '$' + usd.toLocaleString() + '/yr';
  }
}
