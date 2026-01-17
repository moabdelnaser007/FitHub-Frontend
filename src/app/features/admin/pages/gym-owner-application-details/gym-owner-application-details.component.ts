import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GymOwnersService, PendingOwner } from '../../../../services/gym-owners.service';

interface Document {
  name: string;
  url: string;
}

interface OwnerInfo {
  fullName: string;
  email: string;
  phone: string;
  creationDate: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

interface BusinessInfo {
  gymName: string;
  gymType: string;
  address: string;
  city: string;
  country: string;
  website?: string;
  documents: Document[];
}

@Component({
  selector: 'app-gym-owner-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gym-owner-application-details.component.html',
  styleUrls: ['./gym-owner-application-details.component.css']
})
export class GymOwnerDetailsComponent implements OnInit {
  gymId: string = '';
  isLoading: boolean = true;

  ownerInfo: OwnerInfo = {
    fullName: '',
    email: '',
    phone: '',
    creationDate: '',
    status: 'Pending'
  };

  businessInfo: BusinessInfo = {
    gymName: 'Pending Info',
    gymType: 'General',
    address: '',
    city: '',
    country: 'Egypt',
    website: '',
    documents: []
  };

  submissionDate: string = '';
  adminNotes: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gymOwnersService: GymOwnersService
  ) { }

  ngOnInit(): void {
    // Get ID from URL
    this.gymId = this.route.snapshot.params['id'];
    console.log('Loading gym application with ID:', this.gymId);

    // Load Data
    this.loadGymData(this.gymId);
  }

  loadGymData(id: string): void {
    const numericId = Number(id);
    if (!numericId) {
      this.handleError('Invalid Gym ID');
      return;
    }

    this.isLoading = true;

    this.gymOwnersService.getOwnerById(numericId).subscribe({
      next: (owner: PendingOwner) => {
        // Map API response to Component Interface
        this.ownerInfo = {
          fullName: owner.fullName,
          email: owner.email,
          phone: owner.phone,
          creationDate: new Date(owner.createdAt).toLocaleDateString(),
          status: 'Pending'
        };

        this.businessInfo = {
          gymName: 'N/A',
          gymType: 'General',
          address: owner.city, // Using city as address placeholder as we might not have full address in PendingOwner list
          city: owner.city,
          country: 'Egypt',
          website: '',
          documents: []
        };

        this.submissionDate = new Date(owner.createdAt).toLocaleDateString();
        this.isLoading = false;
        console.log('✅ Loaded owner details:', owner);
      },
      error: (err) => {
        console.error('Failed to load owner', err);
        // Fallback to mock if API fails (optional, but better to show error in production)
        this.handleError('Gym application not found or error loading data');
      }
    });
  }

  handleError(msg: string): void {
    alert(msg);
    this.router.navigate(['/admin/dashboard']);
    this.isLoading = false;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Pending': 'status-pending',
      'Approved': 'status-approved',
      'Denied': 'status-denied'
    };
    return statusClasses[status] || '';
  }

  onApprove(): void {
    if (!confirm('Are you sure you want to approve this application?')) return;

    const numericId = Number(this.gymId);
    this.gymOwnersService.approveOwner(numericId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ownerInfo.status = 'Approved';
          alert('Gym application approved successfully!');
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('Failed to approve: ' + res.message);
        }
      },
      error: (err) => {
        console.error('Approve error', err);
        alert('Error approving application');
      }
    });
  }

  onDeny(): void {
    if (!confirm('Are you sure you want to deny this application?')) return;

    const numericId = Number(this.gymId);
    this.gymOwnersService.rejectOwner(numericId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ownerInfo.status = 'Denied';
          alert('Gym application denied.');
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('Failed to deny: ' + res.message);
        }
      },
      error: (err) => {
        console.error('Deny error', err);
        alert('Error denying application');
      }
    });
  }

  onBackToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  onSendEmail(): void {
    console.log('Sending email with notes:', this.adminNotes);
    alert('Email feature pending backend integration.');
    this.adminNotes = '';
  }

  onViewDocument(document: Document): void {
    window.open(document.url, '_blank');
  }
}
