import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface GymForm {
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
  selector: 'app-edit-gym',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-gym-details.component.html',
  styleUrls: ['./edit-gym-details.component.css']
})
export class EditGymComponent implements OnInit {
  gymId: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  newAmenity: string = '';
  
  gym: GymForm = {
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

  countries = ['United States', 'Canada', 'United Kingdom'];
  allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Mock data
  private mockGyms: GymForm[] = [
    {
      id: '1',
      name: 'Flex Fitness Center',
      owner: 'John Doe',
      email: 'contact@flexfitness.com',
      phone: '+1 (212) 555-1234',
      address: '123 Fitness Ave, Manhattan',
      city: 'New York',
      country: 'United States',
      website: 'https://www.flexfitness.com',
      amenities: ['Free Weights', 'Swimming Pool', 'Group Classes', 'Yoga Studio', 'Showers & Lockers', 'Parking'],
      staff: [
        {
          id: '1',
          name: 'Alex Ray',
          role: 'Head Trainer',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkumd0t6byLi8VJPZxeF-wrx-xtmvoFCOW3H8eICD-CvB-lKpqrVOkXqAXjsVYzbTxvmIMhfaHX6ibpPal10Uw7MSVCLV3X5vQW05YXzB5Z9VCk7-rjL9mVmu8xks1xTDqiv6J3dCXJm7E4W7ZxGVc8Qu50y9mpcbgp80dYHtFukNSPLQlS68kylt0mc0A2Nw6bj2Mptx5taMsbYu4zhPynCJNHJ0yWSz91fRiJRv7Ahuacx1b7d4X6LPMPOtlHEJBYc-QlysyLw'
        },
        {
          id: '2',
          name: 'Sarah Chen',
          role: 'Yoga Instructor',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA08J7e2t8FSvjhAAoCDIdN-kUprYwRlM3FQCdyC8o7h86QYqfPEm-I1N25tmrYfS-QvLHdnz_nd13SSz-ELsmIb3gunccp4q9mx_8y78ZeaFDUh2gWTgK108Vj2sWnnkxO8fVWMLrIjwQh940dwKf1rWOWJcSF39CkHXd9LFzIrtBAAvmiyDdHuQoxqjdh2VMhGpikEbTJLXkBbW_UH2n-0ZoMHoUjp9CadiSF64l-YKiiI9DC6NqjhLy7efKtZYid1kLSoca-tA'
        },
        {
          id: '3',
          name: 'Mike Roberts',
          role: 'Receptionist',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_dhFpZEoV1zfSZ1wsZebtlMTlRPi1en1QT20XnZlKaa5mU3tpbyPBxRD8X8Y8IKYfeELRRC42VwueMWATqSdTg6stDv7502Nt06WMD9E2x7SQ9NtBnLOEDXxf4UAD8DmJodF6EYyLd1nEzzRk7bKUhu_F0Th50MTdsnMftrOEI7SjHRIkp7KmAFo-Of1XoBluypwfESt7RbPrNhgKrr7gaB1N69wCqPIPM-bH9qTtlAHUX_x47DKxMxpby2CT1rRNZ71qvfwa1w'
        }
      ],
      status: 'Active',
      isActive: true,
      document: 'business_license_2024.pdf',
      openingTime: '06:00',
      closingTime: '22:00',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.gymId = this.route.snapshot.params['id'];
    console.log('Editing gym with ID:', this.gymId);
    this.loadGymData(this.gymId);
  }

  loadGymData(id: string): void {
    this.isLoading = true;
    
    setTimeout(() => {
      const gymData = this.mockGyms.find(gym => gym.id === id);
      
      if (gymData) {
        this.gym = { ...gymData };
        console.log('Loaded gym data for editing:', gymData);
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
  }

  isDayActive(day: string): boolean {
    return this.gym.workingDays.includes(day);
  }

  onToggleDay(day: string): void {
    if (this.isDayActive(day)) {
      this.gym.workingDays = this.gym.workingDays.filter(d => d !== day);
    } else {
      this.gym.workingDays.push(day);
    }
  }

  onAddAmenity(): void {
    if (this.newAmenity.trim()) {
      this.gym.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  onRemoveAmenity(amenity: string): void {
    this.gym.amenities = this.gym.amenities.filter(a => a !== amenity);
  }

  onReplaceFile(): void {
    console.log('Replace file clicked');
    // Open file picker
  }

  onCancel(): void {
    if (confirm('Discard changes?')) {
      this.router.navigate(['/admin/gym-details', this.gymId]);
    }
  }

  onSave(): void {
    this.isSaving = true;
    console.log('Saving gym:', this.gym);
    
    setTimeout(() => {
      alert('Gym updated successfully!');
      this.isSaving = false;
      this.router.navigate(['/admin/gym-details', this.gymId]);
    }, 1000);
  }
}