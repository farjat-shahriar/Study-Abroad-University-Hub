import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { University, StudentProfile, UniversityRecommendation } from '../models/university.model';
import { UniversityService } from './university';
import { REGION_GROUPS } from '../models/country.model';

@Injectable({ providedIn: 'root' })
export class RecommendationService {
  private readonly universityService = inject(UniversityService);

  /** Country slug → display name, built from REGION_GROUPS */
  private readonly countryNames: Record<string, string> = Object.fromEntries(
    REGION_GROUPS.flatMap((g) => g.countries.map((c) => [c.slug, c.name]))
  );

  /**
   * Load universities from all available countries in parallel.
   * Returns a flat array of all universities with their countrySlug attached.
   */
  loadAllCountries(): Observable<(University & { _countrySlug: string })[]> {
    const slugs = this.universityService.getAllCountrySlugs();

    const requests = slugs.map((slug) =>
      this.universityService.fetchUniversities(slug).pipe(
        map((unis) => unis.map((u) => ({ ...u, _countrySlug: slug }))),
        catchError(() => of([] as (University & { _countrySlug: string })[]))
      )
    );

    return forkJoin(requests).pipe(
      map((results) => results.flat())
    );
  }

  /**
   * Filter universities based on student eligibility.
   * A university is eligible if the student meets its requirements AND
   * the total cost fits within the budget.
   * Universities without requirement data are included (to surface all options).
   */
  filterEligible(
    universities: (University & { _countrySlug: string })[],
    profile: StudentProfile
  ): (University & { _countrySlug: string })[] {
    return universities.filter((u) => {
      const gpaOk = u.gpaRequirement == null || profile.gpa >= u.gpaRequirement;
      const ieltsOk = u.ieltsRequirement == null || profile.ielts >= u.ieltsRequirement;
      const budgetOk =
        u.totalCostUSD == null || u.totalCostUSD <= profile.budgetMax;
      return gpaOk && ieltsOk && budgetOk;
    });
  }

  /**
   * Score and rank eligible universities.
   * Score (0–100) is composed of:
   *  - GPA headroom        30 pts  (how comfortably the student exceeds GPA req)
   *  - IELTS headroom      20 pts
   *  - Budget savings      30 pts  (% of budget remaining after total cost)
   *  - Difficulty bonus    20 pts  (easier admission = safer choice = ranks higher)
   *
   * Ties broken by QS ranking (lower number wins).
   */
  scoreAndRank(
    universities: (University & { _countrySlug: string })[],
    profile: StudentProfile
  ): UniversityRecommendation[] {
    const scored = universities.map((u) => {
      const gpaScore =
        u.gpaRequirement != null
          ? Math.min(((profile.gpa - u.gpaRequirement) / 4) * 30, 30)
          : 15; // neutral if no data

      const ieltsScore =
        u.ieltsRequirement != null
          ? Math.min(((profile.ielts - u.ieltsRequirement) / 9) * 20, 20)
          : 10;

      const budgetScore =
        u.totalCostUSD != null && profile.budgetMax > 0
          ? Math.max(
              Math.min(((profile.budgetMax - u.totalCostUSD) / profile.budgetMax) * 30, 30),
              0
            )
          : 15;

      const difficultyMap: Record<string, number> = {
        easy: 20,
        moderate: 15,
        competitive: 8,
        highly_competitive: 0,
      };
      const diffScore =
        u.admissionDifficulty != null ? difficultyMap[u.admissionDifficulty] ?? 10 : 10;

      const matchScore = Math.round(gpaScore + ieltsScore + budgetScore + diffScore);

      return {
        university: u,
        countrySlug: u._countrySlug,
        countryName: this.countryNames[u._countrySlug] ?? u.country,
        matchScore,
      } as UniversityRecommendation;
    });

    return scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      // Tie-break: lower QS rank wins (null ranks go to end)
      const rA = a.university.ranking ?? 99999;
      const rB = b.university.ranking ?? 99999;
      return rA - rB;
    });
  }
}
