import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, StaffMember } from '../../../../services/staff.service';
import { BranchService } from '../../../../services/branch.service';

@Component({
  selector: 'app-staff-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './staff-details.component.html',
  styleUrls: ['./staff-details.component.css']
})
export class StaffDetailsComponent implements OnInit {

  staffId: number = 0;
  staff: StaffMember | null = null;
  isLoading: boolean = true;
  loadError: string | null = null;
  branchName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private staffService: StaffService,
    private branchService: BranchService
  ) { }

  ngOnInit(): void {
    const staffIdParam = this.route.snapshot.paramMap.get('id');

    console.log('Staff ID from URL:', staffIdParam);

    if (staffIdParam) {
      this.staffId = parseInt(staffIdParam);
      this.loadStaffDetails();
    } else {
      this.loadError = 'Staff ID not provided';
      this.isLoading = false;
    }
  }

  loadStaffDetails(): void {
    this.isLoading = true;
    this.loadError = null;

    console.log('Loading staff details for ID:', this.staffId);

    this.staffService.getStaffMember(this.staffId).subscribe({
      next: (staff) => {
        console.log('Staff details loaded:', staff);
        this.staff = staff;
        this.isLoading = false;

        if (staff.branchId) {
          this.loadBranchName(staff.branchId);
        }
      },
      error: (error) => {
        console.error('Error loading staff details:', error);
        this.loadError = 'Failed to load staff details';
        this.isLoading = false;
      }
    });
  }

  loadBranchName(branchId: number): void {
    this.branchService.getBranchById(branchId).subscribe({
      next: (branch) => {
        this.branchName = branch.branchName;
      },
      error: (error) => {
        console.error('Error loading branch name:', error);
        this.branchName = `Branch #${branchId}`;
      }
    });
  }

  editStaff(): void {
    console.log('Edit staff:', this.staffId);
    this.router.navigate(['/gym-owner/edit-staff', this.staffId]);
  }

  goBack(): void {
    this.router.navigate(['/gym-owner/manage-staff']);
  }

  getStatusClass(): string {
    if (!this.staff) return '';
    return this.staff.status.toLowerCase();
  }

  getStatusText(): string {
    if (!this.staff) return '';
    return this.staff.status.charAt(0).toUpperCase() + this.staff.status.slice(1).toLowerCase();
  }

  getBranchName(): string {
    if (!this.staff || !this.staff.branchId) {
      return 'Not Assigned';
    }
    return this.branchName || `Branch #${this.staff.branchId}`;
  }
}