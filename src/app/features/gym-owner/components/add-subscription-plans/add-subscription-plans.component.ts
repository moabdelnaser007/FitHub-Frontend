import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlansService, CreatePlanRequest } from '../../../../services/plans.service';

@Component({
  selector: 'app-add-subscription-plans',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-subscription-plans.component.html',
  styleUrls: ['./add-subscription-plans.component.css'],
})
export class AddSubscriptionPlansComponent implements OnInit {
  planForm!: FormGroup;
  branchId!: number;
  loading = false;
  errorMessage = '';
  successMessage = '';

  durationOptions = [
    { value: 7, label: '7 Days (Weekly)' },
    { value: 30, label: '30 Days (Monthly)' },
    { value: 90, label: '90 Days (Quarterly)' },
    { value: 365, label: '365 Days (Yearly)' },
  ];

  constructor(
    private fb: FormBuilder,
    private plansService: PlansService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Get branchId from URL
    this.route.queryParams.subscribe((params) => {
      this.branchId = +params['branchId'] || 1;
      console.log('🔵 Branch ID:', this.branchId);
    });

    this.initForm();
  }

  initForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      creditsCost: [0, [Validators.required, Validators.min(1)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      visitsLimit: [0, [Validators.required, Validators.min(0)]],
      status: [true], // true = ACTIVE, false = INACTIVE
    });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.markFormGroupTouched(this.planForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.planForm.value;
    const planData: CreatePlanRequest = {
      branchId: this.branchId,
      name: formValue.name,
      description: formValue.description,
      creditsCost: +formValue.creditsCost,
      visitsLimit: +formValue.visitsLimit,
      durationDays: +formValue.durationDays,
      status: formValue.status ? 'ACTIVE' : 'INACTIVE',
    };

    console.log('🟢 Creating plan:', planData);

    this.plansService.createPlan(this.branchId, planData).subscribe({
      next: (response) => {
        this.loading = false;
        // Verify response content here if needed, but service throws error if not success
        console.log('✅ Plan created successfully:', response);
        this.successMessage = 'Plan created successfully!';

        // Return to plans page
        setTimeout(() => {
          this.router.navigate(['/gym-owner/subscription-plans', this.branchId]);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('🔴 Error creating plan:', error);
        this.errorMessage = error.message || 'Error creating plan. Please try again.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/gym-owner/subscription-plans', this.branchId]);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.planForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.planForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['minlength'])
        return `Minimum length is ${field.errors['minlength'].requiredLength}`;
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
    }
    return '';
  }
}
