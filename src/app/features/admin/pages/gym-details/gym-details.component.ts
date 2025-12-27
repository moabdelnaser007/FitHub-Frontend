// gym-details.component.ts (Admin - Final)
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchService, Branch } from '../../../../services/admin-branches.service';

interface GymDetails {
  id: number;
  ownerId: number;
  branchName: string;
  phone: string;
  address: string;
  city: string;
  visitCreditsCost: number;
  description: string;
  openTime: string;           // ✅ Not openingTime
  closeTime: string;          // ✅ Not closingTime
  genderType: string;
  status: string;
  workingDays: string[];
  amenities: string[];
  createdAt: string;
  updatedAt: string | null;
}

@Component({
  selector: 'app-gym-details-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gym-details.component.html',
  styleUrls: ['./gym-details.component.css']
})
export class GymDetailsComponent implements OnInit {
  gymId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  
  gym: GymDetails = {
    id: 0,
    ownerId: 0,
    branchName: '',
    phone: '',
    address: '',
    city: '',
    visitCreditsCost: 0,
    description: '',
    openTime: '',
    closeTime: '',
    genderType: '',
    status: 'ACTIVE',
    workingDays: [],
    amenities: [],
    createdAt: '',
    updatedAt: null
  };

  allDays = [
    { name: 'Sun', active: false },
    { name: 'Mon', active: false },
    { name: 'Tue', active: false },
    { name: 'Wed', active: false },
    { name: 'Thu', active: false },
    { name: 'Fri', active: false },
    { name: 'Sat', active: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    this.gymId = this.route.snapshot.params['id'];
    console.log('🟢 Loading gym with ID:', this.gymId);
    this.loadGymData(this.gymId);
  }

  loadGymData(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    const branchId = parseInt(id);

    this.branchService.getBranchById(branchId).subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.gym = this.mapBranchToGymDetails(response.data);
          console.log('✅ Loaded gym data:', this.gym);
          this.isLoading = false;
        } else {
          this.errorMessage = response.message || 'Failed to load gym details';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading gym details:', error);
        this.errorMessage = 'Failed to connect to server. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private mapBranchToGymDetails(branch: Branch): GymDetails {
    return {
      id: branch.id,
      ownerId: branch.ownerId,
      branchName: branch.branchName,
      phone: branch.phone,
      address: branch.address,
      city: branch.city,
      visitCreditsCost: branch.visitCreditsCost || 0,
      description: branch.description || 'No description available',
      openTime: this.formatTime(branch.openTime),
      closeTime: this.formatTime(branch.closeTime),
      genderType: this.formatGenderType(branch.genderType),
      status: branch.status,
      workingDays: this.parseWorkingDays(branch.workingDays),
      amenities: this.parseAmenities(branch.amenitiesAvailable),
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt
    };
  }

  private formatTime(time: string): string {
    if (!time) return 'N/A';
    
    try {
      // Format: "9.00:00:00" -> "09:00 AM"
      const parts = time.split('.');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0]);
        const timePart = parts[1];
        const timeComponents = timePart.split(':');
        const minutes = timeComponents[0] || '00';
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHours = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        
        return `${displayHours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')} ${period}`;
      }
      
      // Fallback
      const timeParts = time.split(':');
      if (timeParts.length >= 2) {
        const hour = parseInt(timeParts[0]);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHours = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHours.toString().padStart(2, '0')}:${timeParts[1]} ${period}`;
      }
    } catch (e) {
      console.error('❌ Error formatting time:', e, 'Input:', time);
    }
    
    return time;
  }

  private formatGenderType(genderType: string): string {
    const genderMap: { [key: string]: string } = {
      'Mixed': 'Mixed',
      'MaleOnly': 'Males Only',
      'FemaleOnly': 'Females Only'
    };
    
    return genderMap[genderType] || genderType;
  }

  private parseWorkingDays(workingDaysStr: string): string[] {
    if (!workingDaysStr) return [];
    
    // Reset all days
    this.allDays.forEach(day => day.active = false);
    
    const dayMap: { [key: string]: string } = {
      'sunday': 'Sun',
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat'
    };
    
    const activeDays = workingDaysStr.toLowerCase().split(',').map(d => d.trim());
    const workingDaysArray: string[] = [];
    
    activeDays.forEach(dayName => {
      const shortDay = dayMap[dayName];
      if (shortDay) {
        workingDaysArray.push(shortDay);
        const day = this.allDays.find(d => d.name === shortDay);
        if (day) day.active = true;
      }
    });
    
    return workingDaysArray;
  }

  private parseAmenities(amenitiesStr: string): string[] {
    if (!amenitiesStr) return [];
    
    // Split by comma and format names
    const amenityNames = amenitiesStr.split(',').map(a => a.trim());
    
    // Format amenity names for display (add spaces before capitals)
    return amenityNames.map(name => {
      // Convert "SwimmingPool" to "Swimming Pool"
      // Convert "AirConditioning" to "Air Conditioning"
      return name.replace(/([A-Z])/g, ' $1').trim();
    });
  }

  onToggleStatus(): void {
    const branchId = this.gym.id;
    const isCurrentlyActive = this.gym.status === 'ACTIVE';
    
    const apiCall = isCurrentlyActive
      ? this.branchService.suspendBranch(branchId)
      : this.branchService.resumeBranch(branchId);

    apiCall.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.gym.status = isCurrentlyActive ? 'INACTIVE' : 'ACTIVE';
          console.log('✅ Gym status toggled:', this.gym.status);
          alert(`Branch ${isCurrentlyActive ? 'suspended' : 'activated'} successfully!`);
        } else {
          alert(`Failed to update status: ${response.message}`);
        }
      },
      error: (error) => {
        console.error('❌ Error toggling status:', error);
        alert('Failed to update status. Please try again.');
      }
    });
  }

  isDayActive(day: string): boolean {
    return this.gym.workingDays.includes(day);
  }

  isActive(): boolean {
    return this.gym.status === 'ACTIVE';
  }

  getStatusText(): string {
    return this.gym.status === 'ACTIVE' ? 'Active' : 'Inactive';
  }

  getStatusClass(): string {
    return this.gym.status === 'ACTIVE' ? 'active' : 'inactive';
  }

  onBackToGyms(): void {
    this.router.navigate(['/admin/gym-management']);
  }

  onSuspendGym(): void {
    if (confirm(`Are you sure you want to suspend ${this.gym.branchName}?`)) {
      const branchId = this.gym.id;
      
      this.branchService.suspendBranch(branchId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.gym.status = 'INACTIVE';
            alert('Branch suspended successfully!');
          } else {
            alert(`Failed to suspend branch: ${response.message}`);
          }
        },
        error: (error) => {
          console.error('❌ Error suspending branch:', error);
          alert('Failed to suspend branch. Please try again.');
        }
      });
    }
  }

  onApproveGym(): void {
    if (confirm(`Are you sure you want to approve and activate ${this.gym.branchName}?`)) {
      const branchId = this.gym.id;
      
      this.branchService.resumeBranch(branchId).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.gym.status = 'ACTIVE';
            alert('Branch approved and activated successfully!');
          } else {
            alert(`Failed to approve branch: ${response.message}`);
          }
        },
        error: (error) => {
          console.error('❌ Error approving branch:', error);
          alert('Failed to approve branch. Please try again.');
        }
      });
    }
  }

  retryLoad(): void {
    this.loadGymData(this.gymId);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}