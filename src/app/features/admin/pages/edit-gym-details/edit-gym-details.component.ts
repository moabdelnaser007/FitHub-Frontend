import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService, UpdateBranchRequest, Branch } from '../../../../services/admin-branches.service';

interface BranchFormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  description: string;
  visitCreditsCost: number;
}

interface OperatingHours {
  opening: string;
  closing: string;
}

interface WeekDay {
  label: string;
  value: string;
  selected: boolean;
}

interface Amenity {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-edit-gym',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gym-details.component.html',
  styleUrls: ['./edit-gym-details.component.css']
})
export class EditGymComponent implements OnInit {
  
  branchId: number = 0;
  isLoading: boolean = true;
  isSaving: boolean = false;
  loadError: string | null = null;
  
  branchData: BranchFormData = {
    name: '',
    phone: '',
    address: '',
    city: '',
    description: '',
    visitCreditsCost: 0
  };

  operatingHours: OperatingHours = {
    opening: '06:00',
    closing: '22:00'
  };

  weekDays: WeekDay[] = [
    { label: 'Sun', value: 'Sunday', selected: true },
    { label: 'Mon', value: 'Monday', selected: true },
    { label: 'Tue', value: 'Tuesday', selected: true },
    { label: 'Wed', value: 'Wednesday', selected: true },
    { label: 'Thu', value: 'Thursday', selected: true },
    { label: 'Fri', value: 'Friday', selected: true },
    { label: 'Sat', value: 'Saturday', selected: true }
  ];

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

  branchStatus: string = 'ACTIVE';
  genderType: string = 'Mixed';
  genderTypes: string[] = ['Mixed', 'MaleOnly', 'FemaleOnly'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.branchId = parseInt(id);
    console.log('Editing branch with ID:', this.branchId);
    this.loadGymData();
  }

  // Helper method to normalize gender type values from API
  normalizeGenderType(apiGenderType: string): string {
    const mapping: { [key: string]: string } = {
      'Mixed': 'Mixed',
      'Male': 'MaleOnly',
      'Males': 'MaleOnly',
      'MaleOnly': 'MaleOnly',
      'Female': 'FemaleOnly',
      'Females': 'FemaleOnly',
      'FemaleOnly': 'FemaleOnly'
    };
    
    return mapping[apiGenderType] || 'Mixed';
  }

  loadGymData(): void {
    console.log('🔵 Loading branch data for ID:', this.branchId);
    this.isLoading = true;
    this.loadError = null;
    
    this.branchService.getBranchById(this.branchId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          const branch = response.data;
          console.log('✅ Branch data loaded:', branch);
          
          this.branchData = {
            name: branch.branchName,
            phone: branch.phone,
            address: branch.address,
            city: branch.city,
            description: branch.description || '',
            visitCreditsCost: branch.visitCreditsCost || 0
          };

          this.operatingHours = {
            opening: this.parseTimeFromAPI(branch.openTime),
            closing: this.parseTimeFromAPI(branch.closeTime)
          };

          this.branchStatus = branch.status;
          this.genderType = this.normalizeGenderType(branch.genderType);
          
          console.log('📊 Normalized Gender Type:', this.genderType);
          
          if (branch.workingDays) {
            this.parseWorkingDays(branch.workingDays);
          }

          if (branch.amenitiesAvailable) {
            this.parseAmenities(branch.amenitiesAvailable);
          }
          
          this.isLoading = false;
        } else {
          console.error('Failed to load gym:', response.message);
          this.loadError = response.message || 'Failed to load branch data';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading branch:', error);
        this.loadError = error.message || 'Failed to load branch data';
        this.isLoading = false;
      }
    });
  }

  parseTimeFromAPI(time: string): string {
    if (!time) return '00:00';
    
    try {
      const parts = time.split('.');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0]);
        const timePart = parts[1];
        const [minutes] = timePart.split(':');
        
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
      }
    } catch (e) {
      console.error('Error parsing time:', e);
    }
    
    return '00:00';
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

  parseWorkingDays(workingDaysStr: string): void {
    if (!workingDaysStr) return;
    
    this.weekDays.forEach(day => day.selected = false);
    
    const activeDays = workingDaysStr.split(',').map(d => d.trim());
    
    activeDays.forEach(dayName => {
      const day = this.weekDays.find(d => d.value.toLowerCase() === dayName.toLowerCase());
      if (day) day.selected = true;
    });
  }

  parseAmenities(amenitiesStr: string): void {
    if (!amenitiesStr) return;
    
    const normalizeAmenity = (amenity: string): string => {
      const normalized = amenity.trim().replace(/\s+/g, '');
      const mapping: { [key: string]: string } = {
        'swimmingpool': 'SwimmingPool',
        'airconditioning': 'AirConditioning',
        'personaltrainer': 'PersonalTrainer',
        'lockers': 'Locker',
        'locker': 'Locker',
        'showers': 'Shower',
        'shower': 'Shower',
        'wifi': 'Wifi',
        'parking': 'Parking',
        'sauna': 'Sauna'
      };
      
      return mapping[normalized.toLowerCase()] || amenity.trim();
    };
    
    const apiAmenities = amenitiesStr.split(',').map(a => normalizeAmenity(a));
    
    this.amenities.forEach(amenity => {
      amenity.selected = apiAmenities.some(api => 
        api.toLowerCase() === amenity.name.toLowerCase()
      );
    });
  }

  getWorkingDaysString(): string {
    const activeDays = this.weekDays.filter(day => day.selected);
    return activeDays.map(day => day.value).join(',');
  }

  getAmenitiesString(): string {
    const selectedAmenities = this.amenities.filter(a => a.selected);
    return selectedAmenities.map(a => a.name).join(',');
  }

  toggleDay(day: WeekDay): void {
    day.selected = !day.selected;
  }

  toggleAmenity(amenity: Amenity): void {
    amenity.selected = !amenity.selected;
  }

  get isActive(): boolean {
    return this.branchStatus === 'ACTIVE';
  }

  onToggleStatus(): void {
    this.branchStatus = this.branchStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Active' : 'Inactive';
  }

  onCancel(): void {
    if (confirm('Are you sure you want to discard changes?')) {
      this.router.navigate(['/admin/gym-management']);
    }
  }

  onSave(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    const updateData: UpdateBranchRequest = {
      branchName: this.branchData.name,
      phone: this.branchData.phone,
      address: this.branchData.address,
      city: this.branchData.city,
      visitCreditsCost: this.branchData.visitCreditsCost || 0,
      description: this.branchData.description || 'No description provided',
      openTime: this.formatTimeForAPI(this.operatingHours.opening),
      closeTime: this.formatTimeForAPI(this.operatingHours.closing),
      genderType: this.genderType,
      status: this.branchStatus,
      workingDays: this.getWorkingDaysString(),
      amenitiesAvailable: this.getAmenitiesString()
    };

    console.log('✅ Saving branch data:', updateData);
    console.log('📤 Full Request JSON:', JSON.stringify(updateData, null, 2));
    console.log('🔑 Gender Type:', this.genderType);
    console.log('📅 Working Days:', this.getWorkingDaysString());
    console.log('🏋️ Amenities:', this.getAmenitiesString());

    this.branchService.updateBranch(this.branchId, updateData).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          console.log('✅ Branch updated successfully:', response.data);
          alert('Gym updated successfully!');
          this.router.navigate(['/admin/gym-management']);
        } else {
          console.error('Failed to update gym:', response.message);
          alert(`Failed to update gym: ${response.message}`);
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('❌ Error updating branch:', error);
        console.error('❌ Error details:', error.error);
        alert('Failed to update branch. Please try again.\n' + (error.error?.message || error.message));
        this.isSaving = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.branchData.name || !this.branchData.phone) {
      alert('Please fill in Branch Name and Phone');
      return false;
    }
    
    if (!this.branchData.address || !this.branchData.city) {
      alert('Please fill in Address and City');
      return false;
    }

    if (!this.genderType) {
      alert('Please select Gender Type');
      return false;
    }

    const selectedDays = this.weekDays.filter(d => d.selected);
    if (selectedDays.length === 0) {
      alert('Please select at least one working day');
      return false;
    }

    return true;
  }
}