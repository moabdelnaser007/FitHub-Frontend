// gym-owner-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

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

interface GymApplication {
  id: string;
  ownerInfo: OwnerInfo;
  businessInfo: BusinessInfo;
  submissionDate: string;
}

@Component({
  selector: 'app-gym-owner-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gym-owner-Application-details.component.html',
  styleUrls: ['./gym-owner-Application-details.component.css']
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
    gymName: '',
    gymType: '',
    address: '',
    city: '',
    country: '',
    website: '',
    documents: []
  };

  submissionDate: string = '';
  adminNotes: string = '';

  // Mock data للتجربة - هتستبدليها بـ API call
  private mockGymApplications: GymApplication[] = [
    {
      id: '1',
      submissionDate: '2023-10-26',
      ownerInfo: {
        fullName: 'John Doe',
        email: 'john.doe@powerhouse.com',
        phone: '+1 (234) 567-8901',
        creationDate: '2023-10-26',
        status: 'Pending'
      },
      businessInfo: {
        gymName: 'Powerhouse Fitness',
        gymType: 'Strength & Conditioning',
        address: '123 Muscle Ave, Fitville',
        city: 'New York',
        country: 'USA',
        website: 'www.powerhousefitness.com',
        documents: [
          { name: 'business_license.pdf', url: '#' },
          { name: 'commercial_registration.pdf', url: '#' },
          { name: 'ownership_contract.pdf', url: '#' }
        ]
      }
    },
    {
      id: '2',
      submissionDate: '2023-10-25',
      ownerInfo: {
        fullName: 'Jane Smith',
        email: 'jane.smith@irontemple.com',
        phone: '+1 (555) 123-4567',
        creationDate: '2023-10-25',
        status: 'Pending'
      },
      businessInfo: {
        gymName: 'Iron Temple Gym',
        gymType: 'Bodybuilding & CrossFit',
        address: '456 Steel Street',
        city: 'Los Angeles',
        country: 'USA',
        website: 'www.irontemple.com',
        documents: [
          { name: 'business_license.pdf', url: '#' },
          { name: 'tax_certificate.pdf', url: '#' }
        ]
      }
    },
    {
      id: '3',
      submissionDate: '2023-10-24',
      ownerInfo: {
        fullName: 'Mike Johnson',
        email: 'mike@flexappeal.com',
        phone: '+1 (777) 888-9999',
        creationDate: '2023-10-24',
        status: 'Pending'
      },
      businessInfo: {
        gymName: 'Flex Appeal',
        gymType: 'Fitness & Yoga',
        address: '789 Flex Boulevard',
        city: 'Chicago',
        country: 'USA',
        website: 'www.flexappeal.com',
        documents: [
          { name: 'business_license.pdf', url: '#' }
        ]
      }
    },
    {
      id: '4',
      submissionDate: '2023-10-23',
      ownerInfo: {
        fullName: 'Emily Chen',
        email: 'emily@zenithwellness.com',
        phone: '+1 (999) 111-2222',
        creationDate: '2023-10-23',
        status: 'Pending'
      },
      businessInfo: {
        gymName: 'Zenith Wellness',
        gymType: 'Wellness & Recovery',
        address: '321 Wellness Way',
        city: 'San Francisco',
        country: 'USA',
        website: 'www.zenithwellness.com',
        documents: [
          { name: 'business_license.pdf', url: '#' },
          { name: 'health_permit.pdf', url: '#' },
          { name: 'insurance_certificate.pdf', url: '#' }
        ]
      }
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // جلب الـ ID من الـ URL
    this.gymId = this.route.snapshot.params['id'];
    console.log('Loading gym application with ID:', this.gymId);
    
    // تحميل البيانات
    this.loadGymData(this.gymId);
  }

  loadGymData(id: string): void {
    this.isLoading = true;
    
    // هنا هتستبدلي بـ API call
    // this.gymService.getGymApplicationById(id).subscribe(data => { ... });
    
    // Mock data للتجربة
    setTimeout(() => {
      const gymData = this.mockGymApplications.find(gym => gym.id === id);
      
      if (gymData) {
        this.ownerInfo = gymData.ownerInfo;
        this.businessInfo = gymData.businessInfo;
        this.submissionDate = gymData.submissionDate;
        console.log('Loaded gym data:', gymData);
      } else {
        console.error('Gym not found with ID:', id);
        alert('Gym application not found!');
        this.router.navigate(['/admin/dashboard']);
      }
      
      this.isLoading = false;
    }, 500); // Simulate API delay
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
    console.log('Approving gym:', this.gymId);
    // هنا تضيفي API call للـ approval
    // this.gymService.approveGym(this.gymId).subscribe(() => { ... });
    
    this.ownerInfo.status = 'Approved';
    alert('Gym application approved!');
  }

  onDeny(): void {
    console.log('Denying gym:', this.gymId);
    // هنا تضيفي API call للـ denial
    // this.gymService.denyGym(this.gymId).subscribe(() => { ... });
    
    this.ownerInfo.status = 'Denied';
    alert('Gym application denied!');
  }

  onBackToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  onSendEmail(): void {
    console.log('Sending email with notes:', this.adminNotes);
    console.log('To gym:', this.gymId);
    // هنا تضيفي API call لإرسال الإيميل
    // this.gymService.sendEmail(this.gymId, this.adminNotes).subscribe(() => { ... });
    
    alert('Email sent successfully!');
    this.adminNotes = '';
  }

  onViewDocument(document: Document): void {
    console.log('Viewing document:', document.name);
    console.log('For gym:', this.gymId);
    // هنا تفتحي الـ document في tab جديد
    window.open(document.url, '_blank');
  }
}

