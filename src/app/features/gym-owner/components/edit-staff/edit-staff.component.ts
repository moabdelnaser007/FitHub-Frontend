import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService, StaffMember, UpdateStaffRequest } from '../../../../services/staff.service';

@Component({
  selector: 'app-edit-staff',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-staff.component.html',
  styleUrls: ['./edit-staff.component.css']
})
export class EditStaffComponent implements OnInit {
  
  staffId: number = 0;
  isLoading: boolean = true;
  isSaving: boolean = false;
  loadError: string | null = null;

  // Form Data
  fullName: string = '';
  email: string = '';
  phone: string = '';
  city: string = '';
  role: string = '';
  status: string = 'ACTIVE';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private staffService: StaffService
  ) {}

  ngOnInit(): void {
    const staffIdParam = this.route.snapshot.paramMap.get('id');
    
    if (staffIdParam) {
      this.staffId = parseInt(staffIdParam);
      console.log('Staff ID:', this.staffId);
      this.loadStaffData();
    } else {
      this.loadError = 'Staff ID not found';
      this.isLoading = false;
    }
  }

  loadStaffData(): void {
    this.isLoading = true;
    this.loadError = null;

    this.staffService.getStaffMember(this.staffId).subscribe({
      next: (staff: StaffMember) => {
        console.log('Staff data loaded:', staff);
        
        // Fill form with staff data
        this.fullName = staff.fullName;
        this.email = staff.email;
        this.phone = staff.phone;
        this.city = staff.city;
        this.role = staff.role || '';
        this.status = staff.status;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading staff:', error);
        this.loadError = 'Failed to load staff data';
        this.isLoading = false;
      }
    });
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

    if (!this.role.trim()) {
      alert('Please select a role');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    const updateData: UpdateStaffRequest = {
      id: this.staffId,
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      role: this.role,
      status: this.status
    };

    console.log('Updating staff:', updateData);

    this.staffService.updateStaffMember(this.staffId, updateData).subscribe({
      next: (response) => {
        console.log('Staff updated successfully:', response);
        alert('Staff member updated successfully!');
        this.router.navigate(['/gym-owner/staff-details', this.staffId]);
      },
      error: (error) => {
        console.error('Error updating staff:', error);
        alert('Failed to update staff member. Please try again.\n' + error.message);
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/gym-owner/staff-details', this.staffId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/gym-owner/manage-staff']);
  }
}