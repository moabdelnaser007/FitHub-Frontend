import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface BranchInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  email: string;
  website: string;
  licenseDocument: string;
}

interface Staff {
  id: number;
  name: string;
  role: string;
  avatar: string;
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
  branchStatus: 'active' | 'inactive' | 'pending' = 'active';

  branchInfo: BranchInfo = {
    name: 'Downtown Fitness Hub',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Anytown, USA 12345',
    city: 'Anytown',
    country: 'USA',
    email: 'contact@downtownfitness.com',
    website: 'www.downtownfitness.com',
    licenseDocument: 'business_license_2024.pdf'
  };

  amenities: string[] = [
    'Free Weights',
    'Yoga Studio',
    'Swimming Pool',
    'Showers & Lockers',
    'Parking'
  ];

  operatingHours = {
    openingTime: '06:00 AM',
    closingTime: '10:00 PM'
  };

  workingDays = [
    { name: 'Sun', active: false },
    { name: 'Mon', active: true },
    { name: 'Tue', active: true },
    { name: 'Wed', active: true },
    { name: 'Thu', active: true },
    { name: 'Fri', active: true },
    { name: 'Sat', active: true }
  ];

  staff: Staff[] = [
    {
      id: 1,
      name: 'Jane Cooper',
      role: 'Reception',
      avatar: 'https://i.pravatar.cc/150?img=45'
    },
    {
      id: 2,
      name: 'Cody Fisher',
      role: 'Trainer',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 3,
      name: 'Robert Fox',
      role: 'Trainer',
      avatar: 'https://i.pravatar.cc/150?img=33'
    }
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.branchId = +params['id'];
        this.loadBranchDetails(this.branchId);
      }
    });
  }

  loadBranchDetails(id: number): void {
    // Here you would call your API service
    console.log('Loading branch details for ID:', id);
    // this.branchService.getBranchDetails(id).subscribe(...)
  }

  onManagePlans(): void {
    console.log('Manage Plans clicked');
    this.router.navigate(['/gym-owner/branches', this.branchId, 'plans']);
  }

  onManageStaff(): void {
    console.log('Manage Staff clicked');
    this.router.navigate(['/gym-owner/branches', this.branchId, 'staff']);
  }

  onDownloadDocument(): void {
    console.log('Download document:', this.branchInfo.licenseDocument);
    // Add download logic here
  }

  onBackToBranches(): void {
    this.router.navigate(['/gym-owner/branches']);
  }

  getStatusClass(): string {
    return this.branchStatus;
  }

  getStatusText(): string {
    return this.branchStatus.charAt(0).toUpperCase() + this.branchStatus.slice(1);
  }
}