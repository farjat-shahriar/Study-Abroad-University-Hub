import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StudentProfileForm } from '../../components/student-profile-form/student-profile-form';
import { RecommendationCard } from '../../components/recommendation-card/recommendation-card';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { StudentProfileService } from '../../services/student-profile';
import { RecommendationService } from '../../services/recommendation';
import { StudentProfile, UniversityRecommendation } from '../../models/university.model';

@Component({
  selector: 'app-home-page',
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressBarModule,
    StudentProfileForm,
    RecommendationCard,
    LoadingSpinner,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly profileService = inject(StudentProfileService);
  private readonly recommendationService = inject(RecommendationService);

  profileSubmitted = false;
  loading = false;
  error: string | null = null;
  recommendations: UniversityRecommendation[] = [];
  totalScanned = 0;

  ngOnInit(): void {
    const saved = this.profileService.getProfile();
    if (saved) {
      this.profileSubmitted = true;
      this.triggerRecommendations(saved);
    }
  }

  onProfileSubmitted(profile: StudentProfile): void {
    this.profileService.setProfile(profile);
    this.profileSubmitted = true;
    this.triggerRecommendations(profile);
  }

  private triggerRecommendations(profile: StudentProfile): void {
    this.loading = true;
    this.error = null;
    this.recommendations = [];

    this.recommendationService.loadAllCountries().subscribe({
      next: (all) => {
        this.totalScanned = all.length;
        const eligible = this.recommendationService.filterEligible(all, profile);
        this.recommendations = this.recommendationService.scoreAndRank(eligible, profile);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load university data. Please try again.';
        this.loading = false;
      },
    });
  }

  get currentProfile(): StudentProfile | null {
    return this.profileService.getProfile();
  }

  editProfile(): void {
    this.profileSubmitted = false;
    this.recommendations = [];
  }
}
