import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlansService, Plan } from '../../../../services/plans.service';

@Component({
  selector: 'app-subscription-plans',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css']
})
export class SubscriptionPlansComponent implements OnInit {

  branchId!: number;

  plans: Plan[] = [];
  filteredPlans: Plan[] = [];

  searchQuery = '';
  isLoading = true;
  loadError: string | null = null;

  // Delete Modal
  showDeleteModal = false;
  planToDelete: Plan | null = null;
  isDeleting = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private plansService: PlansService
  ) {}

  ngOnInit(): void {
    const branchIdParam = this.route.snapshot.paramMap.get('id');

    if (!branchIdParam) {
      this.loadError = 'Branch ID is missing';
      this.isLoading = false;
      return;
    }

    this.branchId = +branchIdParam;
    this.loadBranchPlans(this.branchId);
  }

  /* =========================
     Load Plans By Branch
  ========================= */
  loadBranchPlans(branchId: number): void {
    this.isLoading = true;
    this.loadError = null;

    this.plansService.getPlansByBranch(branchId).subscribe({
      next: plans => {
        this.plans = plans;
        this.filteredPlans = plans;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Failed to load plans';
        this.isLoading = false;
      }
    });
  }

  getDurationText(days: number): string {
    if (days >= 365) return `${Math.round(days / 365)} Year(s)`;
    if (days >= 30) return `${Math.round(days / 30)} Month(s)`;
    return `${days} Day(s)`;
  }

  /* =========================
     Search
  ========================= */
  onSearch(): void {
    const q = this.searchQuery.toLowerCase();

    this.filteredPlans = this.plans.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  /* =========================
     Toggle Status (API)
  ========================= */
  toggleStatus(plan: Plan): void {
    if (plan.status === 'ACTIVE') {
      this.plansService.deactivatePlan(plan.id).subscribe(success => {
        if (success) plan.status = 'INACTIVE';
      });
    } else {
      this.plansService.activatePlan(plan.id).subscribe(success => {
        if (success) plan.status = 'ACTIVE';
      });
    }
  }

  /* =========================
     Navigation
  ========================= */
  viewPlan(plan: Plan): void {
    this.router.navigate(['/gym-owner/plan-details', plan.id]);
  }

  editPlan(plan: Plan): void {
    this.router.navigate(['/gym-owner/edit-plan', plan.id]);
  }

 addNewPlan(): void {
  this.router.navigate(['/gym-owner/add-subscription-plan'], { 
    queryParams: { branchId: this.branchId } 
  });
}

  goBack(): void {
    // تم تعديل العودة لقائمة الفروع
    this.router.navigate(['/gym-owner/branches-list']);
  }

  /* =========================
     Delete
  ========================= */
  deletePlan(plan: Plan): void {
    this.planToDelete = plan;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
      this.planToDelete = null;
    }
  }

  confirmDelete(): void {
    if (!this.planToDelete) return;

    this.isDeleting = true;

    this.plansService.deletePlan(this.planToDelete.id).subscribe(success => {
      if (success) {
        this.plans = this.plans.filter(p => p.id !== this.planToDelete!.id);
        this.filteredPlans = this.filteredPlans.filter(p => p.id !== this.planToDelete!.id);
      }

      this.showDeleteModal = false;
      this.planToDelete = null;
      this.isDeleting = false;
    });
  }

  /* =========================
     Helpers
  ========================= */
  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusText(status: string): string {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }
}
