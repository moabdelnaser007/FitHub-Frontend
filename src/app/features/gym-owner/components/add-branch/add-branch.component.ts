import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService, CreateBranchRequest } from '../../../../services/branch.service';

interface Amenity {
  name: string;
  selected: boolean;
}

interface WeekDay {
  label: string;
  value: string;
  selected: boolean;
}

@Component({
  selector: 'app-add-branch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-branch.component.html',
  styleUrls: ['./add-branch.component.css']
})
export class AddBranchComponent {
  
  isSubmitting: boolean = false;

  // Branch Information
  branchName: string = '';
  phone: string = '';
  address: string = '';
  city: string = '';
  description: string = '';
  visitCreditsCost: number = 0;

  // Operating Hours
  openingTime: string = '06:00';
  closingTime: string = '22:00';
  
  // Working Days
  weekDays: WeekDay[] = [
    { label: 'Sun', value: 'sunday', selected: true },
    { label: 'Mon', value: 'monday', selected: true },
    { label: 'Tue', value: 'tuesday', selected: true },
    { label: 'Wed', value: 'wednesday', selected: true },
    { label: 'Thu', value: 'thursday', selected: true },
    { label: 'Fri', value: 'friday', selected: true },
    { label: 'Sat', value: 'saturday', selected: true }
  ];

  // Gender Type (must match API enum values exactly)
  genderType: string = '';

  // Branch Status
  branchStatus: string = 'ACTIVE';

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive'
    };
    return statusMap[status] || status;
  }

  // Amenities
  amenities: Amenity[] = [
    { name: 'Wifi', selected: false },
    { name: 'Parking', selected: false },
     { name: 'Locker', selected: false },
    { name: 'Shower', selected: false },
   
    { name: 'Sauna', selected: false },
    { name: 'SwimmingPool', selected: false },
   { name: 'AirConditioning', selected: false },
    { name: 'PersonalTrainer', selected: false }

  ];

  constructor(
    private router: Router,
    private branchService: BranchService
  ) {}

  toggleDay(day: WeekDay): void {
    day.selected = !day.selected;
  }

  formatTimeForAPI(time: string): string {
    if (!time) return '0.00:00:00';
    
    try {
      const [hours, minutes] = time.split(':');
      return `${parseInt(hours)}.${minutes}:00:00`;
    } catch (e) {
      console.error('Error formatting time:', e);
      return '0.00:00:00';
    }
  }

  getWorkingDaysString(): string {
    const activeDays = this.weekDays.filter(day => day.selected);
    
    const dayMap: { [key: string]: string } = {
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday'
    };
    
    return activeDays.map(day => dayMap[day.label]).join(',');
  }

  getAmenitiesString(): string {
    const selectedAmenities = this.amenities.filter(a => a.selected);
    return selectedAmenities.map(a => a.name).join(',');
  }

  validateForm(): boolean {
    if (!this.branchName.trim()) {
      alert('Please enter branch name');
      return false;
    }

    if (!this.phone.trim()) {
      alert('Please enter phone number');
      return false;
    }

    if (!this.address.trim()) {
      alert('Please enter address');
      return false;
    }

    if (!this.city.trim()) {
      alert('Please enter city');
      return false;
    }

    if (!this.genderType) {
      alert('Please select gender type');
      return false;
    }

    if (!this.openingTime || !this.closingTime) {
      alert('Please select opening and closing times');
      return false;
    }

    return true;
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/gym-owner/manage-branches']);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    const branchData: CreateBranchRequest = {
      branchName: this.branchName.trim(),
      phone: this.phone.trim(),
      address: this.address.trim(),
      city: this.city.trim(),
      visitCreditsCost: this.visitCreditsCost || 0,
      description: this.description.trim() || 'No description provided',
      openTime: this.formatTimeForAPI(this.openingTime),
      closeTime: this.formatTimeForAPI(this.closingTime),
      genderType: this.genderType,
      status: this.branchStatus,
      workingDays: this.getWorkingDaysString(),
      amenitiesAvailable: this.getAmenitiesString()
    };

    console.log('✅ Submitting branch data:', branchData);
    console.log('📤 API Request Body:', JSON.stringify(branchData, null, 2));

    this.branchService.createBranch(branchData).subscribe({
      next: (response) => {
        console.log('✅ Branch created successfully:', response);
        alert('Branch added successfully!');
        this.router.navigate(['/gym-owner/manage-branches']);
      },
      error: (error) => {
        console.error('❌ Error creating branch:', error);
        alert('Failed to create branch. Please try again.\n' + error.message);
        this.isSubmitting = false;
      }
    });
  }
}