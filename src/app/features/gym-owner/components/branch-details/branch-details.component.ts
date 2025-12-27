// branch-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BranchService, BranchData } from '../../../../services/branch.service';

interface BranchInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  genderType: string;
  description: string;
  visitCreditsCost: number;
}

@Component({
  selector: 'app-branch-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-details.component.html',
  styleUrls: ['./branch-details.component.css']
})
export class BranchDetailsComponent implements OnInit {
  branchId: number = 0;
  branchStatus: 'active' | 'inactive' = 'active';
  isLoading: boolean = true;
  loadError: string | null = null;

  branchInfo: BranchInfo = {
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'Egypt',
    genderType: '',
    description: '',
    visitCreditsCost: 0
  };

  amenities: string[] = [];

  operatingHours = {
    openingTime: '',
    closingTime: ''
  };

  workingDays = [
    { name: 'Sun', active: false },
    { name: 'Mon', active: false },
    { name: 'Tue', active: false },
    { name: 'Wed', active: false },
    { name: 'Thu', active: false },
    { name: 'Fri', active: false },
    { name: 'Sat', active: false }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    const branchId = this.route.snapshot.paramMap.get('id');
    
    console.log('🟢 Branch ID from URL:', branchId);
    
    if (branchId) {
      this.branchId = parseInt(branchId);
      this.loadBranchDetails(this.branchId);
    } else {
      this.loadError = 'Branch ID not provided';
      this.isLoading = false;
    }
  }

  loadBranchDetails(branchId: number): void {
    console.log('🔵 Loading branch details for ID:', branchId);
    this.isLoading = true;
    this.loadError = null;

    this.branchService.getBranchById(branchId).subscribe({
      next: (branch: BranchData) => {
        console.log('✅ Branch data received:', branch);
        
        // Update branch info
        this.branchInfo = {
          name: branch.branchName,
          phone: branch.phone,
          address: branch.address,
          city: branch.city,
          country: 'Egypt',
          genderType: this.formatGenderType(branch.genderType),
          description: branch.description || 'No description available',
          visitCreditsCost: branch.visitCreditsCost
        };

        // Update status
        this.branchStatus = branch.status.toLowerCase() === 'active' ? 'active' : 'inactive';

        // Update operating hours (format: "9.00:00:00")
        this.operatingHours.openingTime = this.formatTime(branch.openTime);
        this.operatingHours.closingTime = this.formatTime(branch.closeTime);

        console.log('🕐 Opening Time:', branch.openTime, '→', this.operatingHours.openingTime);
        console.log('🕐 Closing Time:', branch.closeTime, '→', this.operatingHours.closingTime);

        // Parse amenities
        this.amenities = this.parseAmenities(branch.amenitiesAvailable);

        // Parse working days
        this.parseWorkingDays(branch.workingDays);
        
        this.isLoading = false;
        console.log('✅ All data loaded successfully');
      },
      error: (error) => {
        console.error('❌ Error loading branch:', error);
        this.loadError = error.message || 'Failed to load branch details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  formatTime(time: string): string {
    if (!time) return 'N/A';
    
    try {
      // Format: "9.00:00:00" -> "09:00"
      // The hour is BEFORE the dot, minutes are AFTER the dot
      const parts = time.split('.');
      if (parts.length >= 2) {
        const hour = parseInt(parts[0]); // Hour is the first part
        const timePart = parts[1]; // "00:00:00"
        const timeComponents = timePart.split(':');
        const minutes = timeComponents[0] || '00'; // Minutes are first component after dot
        
        return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }
      
      // Fallback: Format "09:00:00" -> "09:00"
      const timeParts = time.split(':');
      if (timeParts.length >= 2) {
        return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`;
      }
    } catch (e) {
      console.error('Error formatting time:', e, 'Input:', time);
    }
    
    return time;
  }

  formatGenderType(genderType: string): string {
    const genderMap: { [key: string]: string } = {
      'Mixed': 'Mixed',
      'MaleOnly': 'Males Only',
      'FemaleOnly': 'Females Only',
      'Male': 'Males Only',
      'Female': 'Females Only'
    };
    
    return genderMap[genderType] || genderType;
  }

  parseAmenities(amenitiesStr: string): string[] {
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

  parseWorkingDays(workingDaysStr: string): void {
    if (!workingDaysStr) return;
    
    // Reset all days
    this.workingDays.forEach(day => day.active = false);
    
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
    
    activeDays.forEach(dayName => {
      const shortDay = dayMap[dayName];
      if (shortDay) {
        const day = this.workingDays.find(d => d.name === shortDay);
        if (day) day.active = true;
      }
    });
  }

  onManagePlans(): void {
    console.log('Manage Plans clicked');
  }

  onManageStaff(): void {
    this.router.navigate(['/gym-owner/manage-staff', this.branchId]);
  }

  onBackToBranches(): void {
    this.router.navigate(['/gym-owner/manage-branches']);
  }

  getStatusClass(): string {
    return this.branchStatus;
  }

  getStatusText(): string {
    return this.branchStatus.charAt(0).toUpperCase() + this.branchStatus.slice(1);
  }

  onEditBranch(): void {
    this.router.navigate(['/gym-owner/edit-branch', this.branchId]);
  }
}