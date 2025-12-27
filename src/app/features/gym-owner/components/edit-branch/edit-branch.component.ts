import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService, BranchData, UpdateBranchRequest } from '../../../../services/branch.service';

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
  selector: 'app-edit-branch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-branch.component.html',
  styleUrls: ['./edit-branch.component.css']
})
export class EditBranchComponent implements OnInit {
  
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
    { label: 'Sun', value: 'sunday', selected: true },
    { label: 'Mon', value: 'monday', selected: true },
    { label: 'Tue', value: 'tuesday', selected: true },
    { label: 'Wed', value: 'wednesday', selected: true },
    { label: 'Thu', value: 'thursday', selected: true },
    { label: 'Fri', value: 'friday', selected: true },
    { label: 'Sat', value: 'saturday', selected: true }
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
  genderType: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    const branchId = this.route.snapshot.paramMap.get('id');
    
    if (branchId) {
      this.branchId = parseInt(branchId);
      this.loadBranchData(this.branchId);
    } else {
      this.loadError = 'Branch ID not found';
      this.isLoading = false;
    }
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

  loadBranchData(id: number): void {
    console.log('🔵 Loading branch data for ID:', id);
    this.isLoading = true;
    this.loadError = null;
    
    this.branchService.getBranchById(id).subscribe({
      next: (branch: BranchData) => {
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
    
    const dayMap: { [key: string]: string } = {
      'sunday': 'Sun',
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat'
    };
    
    this.weekDays.forEach(day => day.selected = false);
    
    const activeDays = workingDaysStr.toLowerCase().split(',').map(d => d.trim());
    
    activeDays.forEach(dayName => {
      const shortDay = dayMap[dayName];
      if (shortDay) {
        const day = this.weekDays.find(d => d.label === shortDay);
        if (day) day.selected = true;
      }
    });
  }

  parseAmenities(amenitiesStr: string): void {
    if (!amenitiesStr) return;
    
    // Normalize amenities from API (handle old formats)
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

  toggleDay(day: WeekDay): void {
    day.selected = !day.selected;
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive'
    };
    return statusMap[status] || status;
  }

  onCancel(): void {
    this.router.navigate(['/gym-owner/manage-branches']);
  }

  onSaveChanges(): void {
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
        console.log('✅ Branch updated successfully:', response);
        alert('Branch updated successfully!');
        this.router.navigate(['/gym-owner/branch-details', this.branchId]);
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

    return true;
  }
}