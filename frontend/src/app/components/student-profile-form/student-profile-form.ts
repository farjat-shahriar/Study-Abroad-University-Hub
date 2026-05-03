import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { StudentProfile } from '../../models/university.model';

@Component({
  selector: 'app-student-profile-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './student-profile-form.html',
  styleUrl: './student-profile-form.scss',
})
export class StudentProfileForm implements OnInit {
  @Output() profileSubmitted = new EventEmitter<StudentProfile>();

  form!: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      gpa: [3.0, [Validators.required, Validators.min(0), Validators.max(4)]],
      ielts: [6.5, [Validators.required, Validators.min(0), Validators.max(9)]],
      budgetMin: [0, [Validators.required, Validators.min(0)]],
      budgetMax: [30000, [Validators.required, Validators.min(0)]],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid) return;
    this.profileSubmitted.emit(this.form.value as StudentProfile);
  }

  formatUSD(value: number): string {
    return '$' + value.toLocaleString();
  }
}
