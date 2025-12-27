import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, StaffMember } from '../../../../services/staff.service';

@Component({
  selector: 'app-manage-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-staff.component.html',
  styleUrls: ['./manage-staff.component.css']
})
export class ManageStaffComponent implements OnInit {
  
  branchId: number | null = null; // ✅ nullable عشان نفرق بين All Staff و Branch Staff
  branchName: string = '';
  
  staffMembers: StaffMember[] = [];
  filteredStaff: StaffMember[] = [];
  
  searchQuery: string = '';
  isLoading: boolean = true;
  loadError: string | null = null;
  
  // Delete Modal
  showDeleteModal: boolean = false;
  staffToDelete: StaffMember | null = null;
  isDeleting: boolean = false;

  // ✅ للتفريق بين All Staff و Branch Staff
  isViewingBranchStaff: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    const branchIdParam = this.route.snapshot.paramMap.get('id');
    
    if (branchIdParam) {
      // ✅ لو في branchId، يبقى نعرض Staff البرانش ده بس
      this.branchId = parseInt(branchIdParam);
      this.isViewingBranchStaff = true;
      console.log('🔵 Viewing staff for branch:', this.branchId);
      this.loadBranchStaff(this.branchId);
    } else {
      // ✅ لو مفيش branchId، يبقى نعرض كل الـ Staff
      this.isViewingBranchStaff = false;
      console.log('🔵 Viewing all staff');
      this.loadAllStaff();
    }
  }
loadAllStaff(): void {
  this.isLoading = true;
  this.loadError = null;

  console.log('🟢 Loading all staff members...');

  this.staffService.getAllBranchStaff().subscribe({
    next: (staff) => {
      console.log('🟢 All staff loaded:', staff);
      console.log('🟢 Number of staff:', staff.length);
      this.staffMembers = staff;
      this.filteredStaff = staff;
      this.isLoading = false;
    },
    error: (error) => {
      console.error('🔴 Error loading all staff:', error);
      this.loadError = 'Failed to load staff members';
      this.isLoading = false;
    }
  });
}

  loadBranchStaff(branchId: number): void {
    this.isLoading = true;
    this.loadError = null;

    console.log('🟢 Loading staff for branch:', branchId);

    this.staffService.getStaffMembers(branchId).subscribe({
      next: (staff) => {
        console.log('🟢 Branch staff loaded:', staff);
        this.staffMembers = staff;
        this.filteredStaff = staff;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('🔴 Error loading branch staff:', error);
        this.loadError = 'Failed to load staff members';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredStaff = this.staffMembers;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredStaff = this.staffMembers.filter(staff => 
      staff.fullName.toLowerCase().includes(query) ||
      staff.email.toLowerCase().includes(query) ||
      staff.role.toLowerCase().includes(query) ||
      staff.phone.includes(query)
    );
  }

  toggleStatus(staff: StaffMember): void {
    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    console.log(`Toggling ${staff.fullName} status to ${newStatus}`);
    staff.status = newStatus;
  }

viewStaff(staff: StaffMember): void {
  console.log('View staff:', staff);
  this.router.navigate(['/gym-owner/staff-details', staff.id]);
}

  editStaff(staff: StaffMember): void {
    console.log('Edit staff:', staff);
    this.router.navigate(['/gym-owner/edit-staff', staff.id]);
  }

  deleteStaff(staff: StaffMember): void {
    this.staffToDelete = staff;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
      this.staffToDelete = null;
    }
  }
confirmDelete(): void {
  if (!this.staffToDelete) {
    console.log('⚠️ No staff selected for deletion');
    return;
  }

  this.isDeleting = true;
  const staffId = this.staffToDelete.id;
  const staffName = this.staffToDelete.fullName;

  console.log('🗑️ Full staff object:', this.staffToDelete);
  console.log('🗑️ Staff ID:', staffId);
  console.log('🗑️ Staff ID type:', typeof staffId);
  
  // تأكد من الـ ID مش undefined أو 0
  if (!staffId || staffId === 0) {
    console.error('❌ Invalid staff ID!');
    alert('Invalid staff ID. Cannot delete.');
    this.isDeleting = false;
    return;
  }

  this.staffService.deleteStaffMember(staffId).subscribe({
    next: (success) => {
      console.log('✅ Delete operation result:', success);
      console.log('✅ Result type:', typeof success);
      
      if (success === true) { // ✅ تحقق صريح
        console.log('✅ Removing from local arrays...');
        
        this.staffMembers = this.staffMembers.filter(s => s.id !== staffId);
        this.filteredStaff = this.filteredStaff.filter(s => s.id !== staffId);
        
        console.log('✅ Remaining staff count:', this.staffMembers.length);
        
        this.showDeleteModal = false;
        this.staffToDelete = null;
        this.isDeleting = false;
        
        alert(`✅ "${staffName}" has been removed successfully!`);
      } else {
        console.log('⚠️ Delete returned false - staff might be in use');
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.staffToDelete = null;
        alert('Cannot delete this staff member. They might be assigned to active sessions or have related data.');
      }
    },
    error: (error) => {
      console.error('🔴 Error deleting staff:', error);
      this.isDeleting = false;
      alert('Failed to delete staff member. Please try again.\n' + error.message);
    }
  });
}
addNewStaff(): void {
  console.log('🟢 Add New Staff clicked');
  console.log('🟢 isViewingBranchStaff:', this.isViewingBranchStaff);
  console.log('🟢 branchId:', this.branchId);
  
  if (this.isViewingBranchStaff && this.branchId) {
    // ✅ لو في branch، روح لصفحة Add مع الـ branchId
    console.log('🟢 Navigating with branchId:', this.branchId);
    this.router.navigate(['/gym-owner/add-staff', this.branchId]);
  } else {
    // ✅ لو All Staff، روح لصفحة Add بدون branchId
    console.log('🟢 Navigating without branchId');
    this.router.navigate(['/gym-owner/add-staff']);
  }
}

  goBack(): void {
    if (this.isViewingBranchStaff && this.branchId) {
      // ✅ لو جاي من branch، ارجع للـ branch details
      this.router.navigate(['/gym-owner/branch-details', this.branchId]);
    } else {
      // ✅ لو All Staff، ارجع للـ dashboard
      this.router.navigate(['/gym-owner/dashboard']);
    }
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }
}