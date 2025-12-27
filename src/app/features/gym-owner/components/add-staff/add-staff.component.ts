import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, CreateStaffRequest } from '../../../../services/staff.service';
import { BranchService } from '../../../../services/branch.service'; // ✅ أضف import
import { forkJoin } from 'rxjs'; // ✅ أضف import

@Component({
  selector: 'app-add-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-staff.component.html',
  styleUrls: ['./add-staff.component.css']
})
export class AddStaffComponent implements OnInit {
  
  branchId: number = 0;
  isSubmitting: boolean = false;
  isLoadingBranches: boolean = false; // ✅ جديد
  
  // Form Data
  fullName: string = '';
  email: string = '';
  phone: string = '';
  city: string = '';
 
  password: string = '';
  confirmPassword: string = '';
  status: string = 'ACTIVE';
  selectedBranchId: number = 0; // ✅ جديد
  
  // Password visibility
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // ✅ قائمة البرانشات
  branches: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private staffService: StaffService,
    private branchService: BranchService // ✅ أضف
  ) {}

  ngOnInit(): void {
    const branchIdParam = this.route.snapshot.paramMap.get('id');
  
  console.log('🔵 Add Staff - branchId from URL:', branchIdParam);
  
  if (branchIdParam) {
    this.branchId = parseInt(branchIdParam);
    this.selectedBranchId = this.branchId; // ✅ اختار البرانش تلقائياً
    console.log('🔵 Pre-selected branch:', this.branchId);
  } else {
    console.log('🔵 No branch pre-selected - user will choose');
  }
  
  // ✅ جيب كل البرانشات في الحالتين
  this.loadBranches();
    
    // ✅ جيب كل البرانشات
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoadingBranches = true;
    
    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        this.branches = branches.map((b, index) => ({
          id: index + 1,
          name: b.branchName,
          city: b.city
        }));
        console.log('Branches loaded:', this.branches);
        this.isLoadingBranches = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoadingBranches = false;
        alert('Failed to load branches. Please refresh the page.');
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  validateForm(): boolean {
    if (!this.fullName.trim()) {
      alert('Please enter full name');
      return false;
    }

    if (!this.email.trim()) {
      alert('Please enter email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Please enter a valid email address');
      return false;
    }

    if (!this.phone.trim()) {
      alert('Please enter phone number');
      return false;
    }

    if (!this.city.trim()) {
      alert('Please enter city');
      return false;
    }

  

    if (!this.password.trim()) {
      alert('Please enter password');
      return false;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return false;
    }

    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return false;
    }

    // ✅ تحقق من اختيار البرانش
    if (!this.selectedBranchId || this.selectedBranchId === 0) {
      alert('Please select a branch to assign this staff member');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const staffData: CreateStaffRequest = {
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      city: this.city.trim(),
      password: this.password,
      confirmPassword: this.confirmPassword,
      status: this.status
    };

    console.log('Creating staff member:', staffData);

    this.staffService.createStaff(staffData).subscribe({
      next: (response) => {
        console.log('✅ Staff created successfully:', response);
        
        // ✅ الآن نحتاج الـ staffId عشان نعمل Assign
        // المشكلة: الـ API مش بيرجع staffId
        
        // ✅ Workaround: نستخدم الـ email للبحث عن الـ Staff اللي اتضاف
        this.findAndAssignStaff(this.email.trim());
      },
      error: (error) => {
        console.error('Error creating staff:', error);
        alert('Failed to add staff member. Please try again.\n' + error.message);
        this.isSubmitting = false;
      }
    });
  }

  // ✅ Method جديدة للبحث والـ Assign
  findAndAssignStaff(email: string): void {
    console.log('🔍 Searching for staff with email:', email);
    
    // نجيب كل الـ Staff ونبحث عن الـ email
    this.staffService.getAllBranchStaff().subscribe({
      next: (allStaff) => {
        const newStaff = allStaff.find(s => s.email.toLowerCase() === email.toLowerCase());
        
        if (newStaff) {
          console.log('✅ Found staff:', newStaff);
          this.assignStaffToBranch(newStaff.id);
        } else {
          console.log('⚠️ Staff not found in list, trying to assign anyway...');
          // في الحالة دي، ممكن نفترض إن آخر Staff هو اللي اتضاف
          alert('Staff member created but could not auto-assign. Please assign manually from staff list.');
          this.navigateBack();
        }
      },
      error: (error) => {
        console.error('Error finding staff:', error);
        alert('Staff member created but could not auto-assign. Please assign manually from staff list.');
        this.navigateBack();
      }
    });
  }

  // ✅ Method للـ Assign
  assignStaffToBranch(staffId: number): void {
    console.log(`🔗 Assigning staff ${staffId} to branch ${this.selectedBranchId}`);
    
    this.staffService.assignStaffToBranch(staffId, this.selectedBranchId).subscribe({
      next: (success) => {
        if (success) {
          console.log('✅ Staff assigned successfully!');
          alert('Staff member added and assigned to branch successfully!');
          this.navigateBack();
        } else {
          console.log('⚠️ Assign returned false');
          alert('Staff member created but assignment failed. Please assign manually.');
          this.navigateBack();
        }
      },
      error: (error) => {
        console.error('Error assigning staff:', error);
        alert('Staff member created but assignment failed. Please assign manually.');
        this.navigateBack();
      }
    });
  }
navigateBack(): void {
  this.isSubmitting = false;
  
  console.log('🔵 Navigating back - branchId:', this.branchId);
  
  if (this.branchId) {
    // لو جاي من branch معين، ارجع للـ branch staff
    this.router.navigate(['/gym-owner/manage-staff', this.branchId]);
  } else {
    // لو جاي من All Staff، ارجع لـ All Staff
    this.router.navigate(['/gym-owner/manage-staff']);
  }
}
  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.navigateBack();
    }
  }
}