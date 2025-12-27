import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Amenity {
  id: number;
  name: string;
}

interface Plan {
  id: number;
  name: string;
  price: number;
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
  
  // Branch Details
  branchName: string = '';
  branchPhone: string = '';
  branchEmail: string = '';
  crn: string = '';
  branchLicense: string = '';
  leaseContract: File | null = null;

  // Location Information
  country: string = 'United States';
  region: string = 'California';
  city: string = 'Los Angeles';
  district: string = '';
  street: string = '';
  buildingNo: string = '';
  postalCode: string = '';
  fullAddress: string = '';

  // Operating Information
  openingDate: string = '';
  openingTime: string = '';
  closingTime: string = '';
  
  workingDays: boolean[] = [false, true, true, true, true, true, false]; // Sun-Sat
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Amenities
  amenities: Amenity[] = [
    { id: 1, name: 'Swimming Pool' },
    { id: 2, name: 'Free Weights' },
    { id: 3, name: 'Cardio Area' }
  ];
  newAmenity: string = '';

  // Plans
  selectedPlanType: string = '';
  availablePlans: Plan[] = [
    { id: 1, name: 'Gold Monthly', price: 99, selected: true },
    { id: 2, name: 'Silver Monthly', price: 69, selected: false },
    { id: 3, name: 'Basic Monthly', price: 49, selected: true }
  ];

  constructor(private router: Router) {}

  toggleWorkingDay(index: number): void {
    this.workingDays[index] = !this.workingDays[index];
  }

  addAmenity(): void {
    if (this.newAmenity.trim()) {
      const newId = this.amenities.length > 0 
        ? Math.max(...this.amenities.map(a => a.id)) + 1 
        : 1;
      this.amenities.push({
        id: newId,
        name: this.newAmenity.trim()
      });
      this.newAmenity = '';
    }
  }

  removeAmenity(id: number): void {
    this.amenities = this.amenities.filter(a => a.id !== id);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.leaseContract = input.files[0];
      console.log('File selected:', this.leaseContract.name);
    }
  }

  togglePlan(plan: Plan): void {
    plan.selected = !plan.selected;
  }

  validateForm(): boolean {
    if (!this.branchName || !this.branchPhone || !this.branchEmail || !this.crn) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }

  onCancel(): void {
    if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      this.router.navigate(['/gym-owner/branches']);
    }
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    const branchData = {
      branchDetails: {
        name: this.branchName,
        phone: this.branchPhone,
        email: this.branchEmail,
        crn: this.crn,
        license: this.branchLicense,
        leaseContract: this.leaseContract?.name
      },
      location: {
        country: this.country,
        region: this.region,
        city: this.city,
        district: this.district,
        street: this.street,
        buildingNo: this.buildingNo,
        postalCode: this.postalCode,
        fullAddress: this.fullAddress
      },
      operating: {
        openingDate: this.openingDate,
        openingTime: this.openingTime,
        closingTime: this.closingTime,
        workingDays: this.workingDays
      },
      amenities: this.amenities.map(a => a.name),
      plans: this.availablePlans.filter(p => p.selected).map(p => p.id)
    };

    console.log('Submitting branch data:', branchData);
    
    // Here you would call your API service
    // this.branchService.addBranch(branchData).subscribe(...)
    
    alert('Branch added successfully!');
    this.router.navigate(['/gym-owner/branches']);
  }
}