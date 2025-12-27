import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface GymDetails {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website: string;
  amenities: string[];
  staff: StaffMember[];
  status: 'Active' | 'Inactive';
  isActive: boolean;
  document: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
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
  
  gym: GymDetails = {
    id: '',
    name: '',
    owner: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    website: '',
    amenities: [],
    staff: [],
    status: 'Active',
    isActive: true,
    document: '',
    openingTime: '',
    closingTime: '',
    workingDays: []
  };

  allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock data
  private mockGyms: GymDetails[] = [
    {
      id: '1',
      name: 'Flex Fitness Center',
      owner: 'John Doe',
      email: 'owner@flexfitness.com',
      phone: '+1 234 567 890',
      address: '123 Muscle Lane, Workout City, NY 10001',
      city: 'New York',
      country: 'United States',
      website: 'https://www.flexfitness.com',
      amenities: ['Free Weights', 'Swimming Pool', 'Showers', 'Parking', 'Sauna', 'Yoga Studio'],
      staff: [
        {
          id: '1',
          name: 'Sarah Connor',
          role: 'Manager',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMwzhVFDy00ex6eyeX3YBnn62X17Pcw0vPxHvBT2AT4LUrT9pwmEGrVBMh_PL9D9qkmUmp63DECKJE1YW0IqXYQOjQFIjJVD_yppp7udBrOguBHGvkggPSgeQucdXeBN7vsLWF2X0OM4cNqBTuCKp4OtaANdAQWxLrMa1cefxBb0W7cgemeDo6--hMYf_SxxpBSq8YR9uflb5g0mv5yF0gr3nMOw-L6Q8k3EjSH6yvbBzg4DuzpXhKq6cxQr5iegzB-ZpHgxR1mA'
        },
        {
          id: '2',
          name: 'Kyle Reese',
          role: 'Trainer',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9bGMjKdQCzVCx6GpgXEMRUxM38bMdpIpef2K_cWI5mo2lIK9O5IyhF7x66txSJx1CmcuHbIAAWx4dBYKJwUSE6ynV1ojJ-ABTmH9cJugLzTn1UolVblenmBojnSzjSq0dlbfKuD3zXK-wdwerK5yuwL4-Uj83PIN2mBZUQVsmGo8dR3HAuQAoocX85PEE3eJYF871cfcnKQCzCtJJ3skQNdlrNvVH2fNqHke1ymsLtbR-2uWdqHqXUsLDy9_3wLyBr8BrtByu9g'
        },
        {
          id: '3',
          name: 'John Matrix',
          role: 'Reception',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBykiIEkhNl2ovIMLVioyR-GaIuWEuvBigf8UJoz5dVgIyI0zorAj9rNZA3OrnpQjgUEURFBd31-Ej2Et1AufgDeHgLdgFZoUudB_SfREnOu0Iu2YCPbuIeJFSII_XTLSOeW0hLBRJ-6Rb_7hSeI0zTys1rdiz6siz9XCTcpJaiEAzK1NFUcRRDCXiLV0q-XO5DoSIsgLoZ4PfG8xcY9Q5BhSRLmEJnr_tBBVf2LJde_F911makwhePVMy4zK18VDHyKfseejNakg'
        }
      ],
      status: 'Active',
      isActive: true,
      document: 'CRN_License.pdf',
      openingTime: '06:00 AM',
      closingTime: '10:00 PM',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    },
    {
      id: '2',
      name: 'Iron Paradise',
      owner: 'Jane Smith',
      email: 'jane@ironparadise.com',
      phone: '+1 555 123 456',
      address: '456 Steel Street, Los Angeles, CA 90001',
      city: 'Los Angeles',
      country: 'United States',
      website: 'https://www.ironparadise.com',
      amenities: ['Free Weights', 'Cardio Machines', 'Personal Training'],
      staff: [],
      status: 'Inactive',
      isActive: false,
      document: 'business_license.pdf',
      openingTime: '05:00 AM',
      closingTime: '11:00 PM',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gymId = this.route.snapshot.params['id'];
    console.log('Loading gym with ID:', this.gymId);
    this.loadGymData(this.gymId);
  }

  loadGymData(id: string): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const gymData = this.mockGyms.find(gym => gym.id === id);
      
      if (gymData) {
        this.gym = { ...gymData };
        console.log('Loaded gym data:', gymData);
      } else {
        console.error('Gym not found with ID:', id);
        alert('Gym not found!');
        this.router.navigate(['/admin/gym-management']);
      }
      
      this.isLoading = false;
    }, 500);
  }

  onToggleStatus(): void {
    this.gym.isActive = !this.gym.isActive;
    this.gym.status = this.gym.isActive ? 'Active' : 'Inactive';
    console.log('Gym status toggled:', this.gym.status);
  }

  isDayActive(day: string): boolean {
    return this.gym.workingDays.includes(day);
  }

  onDownloadDocument(): void {
    console.log('Downloading document:', this.gym.document);
    // Add download logic
  }

  onViewStaff(staff: StaffMember): void {
    console.log('View staff:', staff);
    // Navigate to staff details or open modal
  }

  onBackToGyms(): void {
    this.router.navigate(['/admin/gym-management']);
  }

  onSuspendGym(): void {
    if (confirm(`Are you sure you want to suspend ${this.gym.name}?`)) {
      console.log('Suspending gym:', this.gym.name);
      this.gym.status = 'Inactive';
      this.gym.isActive = false;
      alert('Gym suspended successfully!');
    }
  }

  onApproveGym(): void {
    console.log('Approving/Activating gym:', this.gym.name);
    this.gym.status = 'Active';
    this.gym.isActive = true;
    alert('Gym approved and activated successfully!');
  }
}