import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, StaffMember } from '../../../../services/staff.service';

@Component({
  selector: 'app-assign-unassigned-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-staff.component.html',
  styleUrls: ['./assign-staff.component.css']
})
export class AssignUnassignedStaffComponent implements OnInit {

  branchId: number = 0;
  isLoading: boolean = true;
  isAssigning: boolean = false;
  unassignedStaff: StaffMember[] = [];
  selectedStaffIds: number[] = [];
  selectAll: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private staffService: StaffService
  ) { }

  ngOnInit(): void {
    const branchId = this.route.snapshot.params['id'];
    this.branchId = parseInt(branchId);
    console.log('🔵 Assign Staff to Branch ID:', this.branchId);

    this.loadUnassignedStaff();
  }

  loadUnassignedStaff(): void {
    this.isLoading = true;

    // جيب كل الـ Staff
    this.staffService.getAllBranchStaff().subscribe({
      next: (allStaff) => {
        console.log('✅ All staff loaded:', allStaff);

        // فلتر الـ Staff اللي مالهمش branchId (unassigned)
        this.unassignedStaff = allStaff.filter(staff => !staff.branchId || staff.branchId === 0);

        console.log('✅ Unassigned staff:', this.unassignedStaff);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading staff:', error);
        alert('Failed to load staff members. Please try again.');
        this.isLoading = false;
      }
    });
  }

  toggleStaffSelection(staffId: number): void {
    const index = this.selectedStaffIds.indexOf(staffId);

    if (index > -1) {
      // Remove from selection
      this.selectedStaffIds.splice(index, 1);
    } else {
      // Add to selection
      this.selectedStaffIds.push(staffId);
    }

    // Update select all checkbox
    this.selectAll = this.selectedStaffIds.length === this.unassignedStaff.length;

    console.log('Selected staff IDs:', this.selectedStaffIds);
  }

  isStaffSelected(staffId: number): boolean {
    return this.selectedStaffIds.includes(staffId);
  }

  onToggleSelectAll(): void {
    if (this.selectAll) {
      // Select all
      this.selectedStaffIds = this.unassignedStaff.map(staff => staff.id);
    } else {
      // Deselect all
      this.selectedStaffIds = [];
    }

    console.log('Select all toggled:', this.selectedStaffIds);
  }

  onAssignSelected(): void {
    if (this.selectedStaffIds.length === 0) {
      alert('Please select at least one staff member to assign.');
      return;
    }

    if (!confirm(`Are you sure you want to assign ${this.selectedStaffIds.length} staff member(s) to this branch?`)) {
      return;
    }

    this.isAssigning = true;
    let successCount = 0;
    let errorCount = 0;

    // Assign each selected staff
    const assignPromises = this.selectedStaffIds.map(staffId => {
      return new Promise<void>((resolve) => {
        this.staffService.assignStaffToBranch(staffId, this.branchId).subscribe({
          next: (success) => {
            if (success) {
              console.log(`✅ Staff ${staffId} assigned successfully`);
              successCount++;
            } else {
              console.log(`⚠️ Staff ${staffId} assignment returned false`);
              errorCount++;
            }
            resolve();
          },
          error: (error) => {
            console.error(`❌ Error assigning staff ${staffId}:`, error);
            errorCount++;
            resolve();
          }
        });
      });
    });

    // Wait for all assignments to complete
    Promise.all(assignPromises).then(() => {
      this.isAssigning = false;

      if (successCount > 0) {
        alert(`Successfully assigned ${successCount} staff member(s)!`);
        this.router.navigate(['/gym-owner/manage-staff', this.branchId]);
      } else {
        alert('Failed to assign staff members. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/gym-owner/branch-details', this.branchId]);
  }
}