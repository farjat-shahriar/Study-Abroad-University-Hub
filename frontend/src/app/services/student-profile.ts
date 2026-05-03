import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StudentProfile } from '../models/university.model';

@Injectable({ providedIn: 'root' })
export class StudentProfileService {
  private readonly profileSubject = new BehaviorSubject<StudentProfile | null>(null);
  readonly profile$ = this.profileSubject.asObservable();

  setProfile(profile: StudentProfile): void {
    this.profileSubject.next(profile);
  }

  getProfile(): StudentProfile | null {
    return this.profileSubject.getValue();
  }

  clearProfile(): void {
    this.profileSubject.next(null);
  }
}
