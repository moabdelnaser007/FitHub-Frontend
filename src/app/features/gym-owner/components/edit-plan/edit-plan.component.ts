import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlansService, Plan, UpdatePlanRequest } from '../../../../services/plans.service';

@Component({
  selector: 'app-edit-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-plan.component.html',
  styleUrls: ['./edit-plan.component.css']
})
export class EditPlanComponent implements OnInit {
  planForm!: FormGroup;
  planId!: number;
  branchId!: number;
  isLoading = false;
  isSaving = false;
  loadError = '';
  saveError = '';
  currentPlan?: Plan;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private plansService: PlansService
  ) {}

  ngOnInit(): void {
    // طباعة كل الـ route info للـ debugging
    console.log('🔍 Full Route Debug:', {
      url: this.router.url,
      params: this.route.snapshot.params,
      paramMap: this.route.snapshot.paramMap.keys,
      queryParams: this.route.snapshot.queryParams,
      data: this.route.snapshot.data
    });

    // الحصول على الـ planId من الـ URL
    const planIdParam = this.route.snapshot.paramMap.get('planId') || 
                        this.route.snapshot.params['planId'];
    
    // الحصول على branchId من queryParams (optional)
    const branchIdParam = this.route.snapshot.queryParamMap.get('branchId') ||
                          this.route.snapshot.queryParams['branchId'];
    
    console.log('🔵 Extracted IDs:', {
      planIdParam,
      branchIdParam
    });
    
    if (!planIdParam) {
      console.error('❌ No planId found in route!');
      console.error('Available params:', this.route.snapshot.paramMap.keys);
      this.loadError = 'Invalid plan ID';
      return;
    }

    this.planId = +planIdParam;
    
    if (branchIdParam) {
      this.branchId = +branchIdParam;
    }

    console.log('✅ Final IDs:', {
      planId: this.planId,
      branchId: this.branchId
    });

    // إنشاء الـ Form
    this.initForm();

    // تحميل بيانات الـ Plan
    this.loadPlan();
  }

  initForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      creditsCost: [0, [Validators.required, Validators.min(0)]],
      visitsLimit: [0, [Validators.required, Validators.min(1)]],
      durationDays: [30, [Validators.required, Validators.min(1)]],
      status: ['ACTIVE', Validators.required]
    });
  }

  loadPlan(): void {
    this.isLoading = true;
    this.loadError = '';

    this.plansService.getPlan(this.planId).subscribe({
      next: (plan) => {
        console.log('✅ Plan loaded:', plan);
        this.currentPlan = plan;
        this.branchId = plan.branchId;
        this.populateForm(plan);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading plan:', error);
        this.loadError = error.message || 'Failed to load plan details';
        this.isLoading = false;
      }
    });
  }

  populateForm(plan: Plan): void {
    this.planForm.patchValue({
      name: plan.name,
      description: plan.description,
      creditsCost: plan.creditsCost,
      visitsLimit: plan.visitsLimit,
      durationDays: plan.durationDays,
      status: plan.status
    });
  }

  onSubmit(): void {
    if (this.planForm.invalid) {
      this.markFormGroupTouched(this.planForm);
      return;
    }

    this.isSaving = true;
    this.saveError = '';

    const updateRequest: UpdatePlanRequest = {
      id: this.planId,
      branchId: this.branchId,
      name: this.planForm.value.name,
      description: this.planForm.value.description,
      creditsCost: this.planForm.value.creditsCost,
      visitsLimit: this.planForm.value.visitsLimit,
      durationDays: this.planForm.value.durationDays,
      status: this.planForm.value.status
    };

    console.log('🔵 Updating plan:', updateRequest);

    this.plansService.updatePlan(updateRequest).subscribe({
      next: (updatedPlan) => {
        console.log('✅ Plan updated successfully:', updatedPlan);
        this.isSaving = false;
        // الرجوع لصفحة الـ Plans
      this.router.navigate(['/gym-owner/subscription-plans', this.branchId]);
      },
      error: (error) => {
        console.error('❌ Error updating plan:', error);
        this.saveError = error.message || 'Failed to update plan';
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    if (this.branchId) {
      this.router.navigate(['/gym-owner/subscription-plans', this.branchId]);
    } else {
      this.router.navigate(['/gym-owner/branches-list']);
    }
  }

  getDurationText(days: number): string {
    if (days < 30) {
      return `${days} days`;
    } else if (days === 30) {
      return '1 month';
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  }

  // Helper method لتفعيل validation على كل الـ fields
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper methods للـ validation errors
  getErrorMessage(fieldName: string): string {
    const control = this.planForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control.errors['minlength']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['min']) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors['min'].min}`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Plan Name',
      description: 'Description',
      creditsCost: 'Credits Cost',
      visitsLimit: 'Visits Limit',
      durationDays: 'Duration',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  hasError(fieldName: string): boolean {
    const control = this.planForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }
}