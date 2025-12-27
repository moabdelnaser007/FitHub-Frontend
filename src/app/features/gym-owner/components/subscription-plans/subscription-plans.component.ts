import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Plan {
  id: string;
  name: string;
  credits: number;
  price: number;
  duration: string;
  status: 'Active' | 'Inactive' | 'Pending';
}

interface Branch {
  id: string;
  name: string;
  address: string;
  plans: Plan[];
}

@Component({
  selector: 'app-branches-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subscription-plans.component.html',
  styleUrls: ['./subscription-plans.component.css']
})
export class SubscriptionPlansComponent implements OnInit {
  
  branches: Branch[] = [
    {
      id: '1',
      name: 'MetroFlex Downtown',
      address: '123 Fitness Ave, Metro City, ST 12345',
      plans: [
        {
          id: '1',
          name: 'Gold Tier',
          credits: 15,
          price: 79.99,
          duration: 'Monthly',
          status: 'Active'
        },
        {
          id: '2',
          name: 'Silver Tier',
          credits: 8,
          price: 49.99,
          duration: 'Monthly',
          status: 'Active'
        },
        {
          id: '3',
          name: 'Annual Pass',
          credits: 200,
          price: 849.00,
          duration: 'Yearly',
          status: 'Inactive'
        }
      ]
    },
    {
      id: '2',
      name: 'MetroFlex Uptown',
      address: '456 Wellness Blvd, Metro City, ST 12346',
      plans: [
        {
          id: '4',
          name: 'Premium Plus',
          credits: 20,
          price: 99.99,
          duration: 'Monthly',
          status: 'Active'
        },
        {
          id: '5',
          name: 'Basic Plan',
          credits: 5,
          price: 29.99,
          duration: 'Monthly',
          status: 'Active'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // يمكنك هنا جلب البيانات من الـ API
    // this.loadBranches();
  }

  loadBranches(): void {
    // استدعاء الـ API لجلب الفروع والخطط
    // this.branchService.getBranches().subscribe(data => {
    //   this.branches = data;
    // });
  }

  onEditBranch(branch: Branch): void {
    console.log('Edit branch:', branch);
    // الانتقال لصفحة تعديل الفرع
    this.router.navigate(['/branch-details', branch.id]);
  }

  onAddPlan(branch: Branch): void {
    console.log('Add plan to branch:', branch);
    // فتح modal أو الانتقال لصفحة إضافة خطة جديدة
    this.router.navigate(['/add-plan', branch.id]);
  }

  onEditPlan(branch: Branch, plan: Plan): void {
    console.log('Edit plan:', plan, 'in branch:', branch);
    // فتح modal أو الانتقال لصفحة تعديل الخطة
    this.router.navigate(['/edit-plan', branch.id, plan.id]);
  }

  onDeletePlan(branch: Branch, plan: Plan): void {
    const confirmDelete = confirm(`Are you sure you want to delete the plan "${plan.name}"?`);
    
    if (confirmDelete) {
      console.log('Delete plan:', plan, 'from branch:', branch);
      
      // حذف الخطة من الـ array محلياً
      const planIndex = branch.plans.findIndex(p => p.id === plan.id);
      if (planIndex > -1) {
        branch.plans.splice(planIndex, 1);
      }

      // هنا ترسل طلب الحذف للـ API
      // this.planService.deletePlan(branch.id, plan.id).subscribe(
      //   response => {
      //     console.log('Plan deleted successfully');
      //     // يمكنك إعادة تحميل البيانات أو تحديث الـ UI
      //   },
      //   error => {
      //     console.error('Error deleting plan:', error);
      //     alert('Failed to delete plan. Please try again.');
      //     // في حالة الخطأ، أعد الخطة للـ array
      //     branch.plans.splice(planIndex, 0, plan);
      //   }
      // );
    }
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // دوال إضافية مفيدة

  getBranchById(branchId: string): Branch | undefined {
    return this.branches.find(b => b.id === branchId);
  }

  getPlanById(branchId: string, planId: string): Plan | undefined {
    const branch = this.getBranchById(branchId);
    return branch?.plans.find(p => p.id === planId);
  }

  getActivePlansCount(branch: Branch): number {
    return branch.plans.filter(p => p.status === 'Active').length;
  }

  getTotalRevenue(branch: Branch): number {
    return branch.plans
      .filter(p => p.status === 'Active')
      .reduce((total, plan) => total + plan.price, 0);
  }

  togglePlanStatus(branch: Branch, plan: Plan): void {
    // تبديل حالة الخطة بين Active و Inactive
    plan.status = plan.status === 'Active' ? 'Inactive' : 'Active';
    
    console.log(`Plan ${plan.name} status changed to ${plan.status}`);
    
    // هنا ترسل التحديث للـ API
    // this.planService.updatePlanStatus(branch.id, plan.id, plan.status).subscribe(
    //   response => {
    //     console.log('Plan status updated successfully');
    //   },
    //   error => {
    //     console.error('Error updating plan status:', error);
    //     // في حالة الخطأ، أرجع الحالة السابقة
    //     plan.status = plan.status === 'Active' ? 'Inactive' : 'Active';
    //   }
    // );
  }

  sortPlansByPrice(branch: Branch, ascending: boolean = true): void {
    branch.plans.sort((a, b) => {
      return ascending ? a.price - b.price : b.price - a.price;
    });
  }

  filterActivePlans(branch: Branch): Plan[] {
    return branch.plans.filter(p => p.status === 'Active');
  }
}