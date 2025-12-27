import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-cadd-subscription-plans',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-subscription-plans.component.html',
  styleUrls: ['./add-subscription-plans.component.css']
})
export class  AddSubscriptionPlansComponent implements OnInit {
  planForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialize the form with validation
   */
  private initializeForm(): void {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      credits: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required]],
      duration: ['30', Validators.required],
      isActive: [true]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.planForm.valid) {
      const planData = this.planForm.value;
      
      // Format the plan data
      const formattedPlan = {
        name: planData.name.trim(),
        description: planData.description.trim(),
        credits: parseInt(planData.credits, 10),
        price: this.formatPrice(planData.price),
        duration: this.getDurationLabel(planData.duration),
        status: planData.isActive ? 'Active' : 'Inactive',
        createdAt: new Date().toISOString()
      };

      console.log('Plan created:', formattedPlan);
      
      // TODO: Call your service to save the plan
      // this.planService.createPlan(formattedPlan).subscribe({
      //   next: (response) => {
      //     console.log('Plan created successfully:', response);
      //     this.router.navigate(['/branches-plans']);
      //   },
      //   error: (error) => {
      //     console.error('Error creating plan:', error);
      //   }
      // });

      // For now, just navigate back
      this.router.navigate(['/branches-plans']);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.planForm.controls).forEach(key => {
        this.planForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    if (this.planForm.dirty) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (confirmLeave) {
        this.router.navigate(['/branches-plans']);
      }
    } else {
      this.router.navigate(['/branches-plans']);
    }
  }

  /**
   * Format price to ensure it has currency symbol
   */
  private formatPrice(price: string): string {
    // Remove any existing $ symbol and spaces
    let cleanPrice = price.replace(/[$\s]/g, '');
    
    // If it's a valid number, format it
    if (!isNaN(parseFloat(cleanPrice))) {
      return `$${parseFloat(cleanPrice).toFixed(2)}`;
    }
    
    return price;
  }

  /**
   * Get duration label based on value
   */
  private getDurationLabel(duration: string): string {
    const durationMap: { [key: string]: string } = {
      '30': 'Monthly',
      '90': 'Quarterly',
      '365': 'Yearly',
      'custom': 'Custom'
    };
    
    return durationMap[duration] || 'Monthly';
  }

  /**
   * Get form control value
   */
  getFormValue(controlName: string): any {
    return this.planForm.get(controlName)?.value;
  }

  /**
   * Check if form control has error
   */
  hasError(controlName: string, errorName: string): boolean {
    const control = this.planForm.get(controlName);
    return control ? control.hasError(errorName) && control.touched : false;
  }
}