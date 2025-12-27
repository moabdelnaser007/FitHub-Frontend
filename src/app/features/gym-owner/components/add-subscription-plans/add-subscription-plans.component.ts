import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface CreatePlanDto {
  branchId: number;
  name: string;
  description: string;
  price: number;
  creditsCost: number;
  visitsLimit: number;
  durationDays: number;
  status: string;
}

interface ApiResponse {
  data: any;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

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

  private apiUrl = `${environment.apiBaseUrl}/owner/Plans`;
  private token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjIiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJyb2NrZ3ltQG93bmVyLmNvbSIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6Ik93bmVyIiwiZXhwIjoxNzY2ODY0ODY3LCJpc3MiOiJGaXRIdWIiLCJhdWQiOiJGaXRIdWJVc2VycyJ9.ZhboWQLNWYenZdFK6fBhsh2RtNtfwApbzwbvw2HD2mE';

  durationOptions = [
    { value: 30, label: '30 Days (Monthly)' },
    { value: 90, label: '90 Days (Quarterly)' },
    { value: 365, label: '365 Days (Yearly)' },
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // احصل على branchId من الـ URL
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
      price: [0, [Validators.required, Validators.min(0)]],
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
    const planData: CreatePlanDto = {
      branchId: this.branchId,
      name: formValue.name,
      description: formValue.description,
      price: +formValue.price,
      creditsCost: +formValue.creditsCost,
      visitsLimit: +formValue.visitsLimit,
      durationDays: +formValue.durationDays,
      status: formValue.status ? 'ACTIVE' : 'INACTIVE',
    };

    console.log('🟢 Creating plan:', planData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    });

    this.http
      .post<ApiResponse>(`${this.apiUrl}/${this.branchId}/Create`, planData, { headers })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.isSuccess) {
            console.log('✅ Plan created successfully:', response);
            this.successMessage = response.message || 'Plan created successfully!';

            // ارجع لصفحة الـ Plans بعد 2 ثانية
            setTimeout(() => {
              this.router.navigate(['/gym-owner/subscription-plans', this.branchId]);
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to create plan.';
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('🔴 Error creating plan:', error);
          this.errorMessage = error.error?.message || 'Error creating plan. Please try again.';
        },
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
