import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TimeSlot {
  time: string;
  label: string;
}

interface Schedule {
  day: string;
  openingTime: string;
  closingTime: string;
  status: string;
}

interface Plan {
  name: string;
  credits: number;
  visits: number;
  recommended?: boolean;
}

interface Amenity {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-gym-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gym-detail.component.html',
  styleUrl: './gym-detail.component.css',
})
export class GymDetailComponent implements OnInit {
  gymId: string = '';
  activeTab: 'about' | 'facilities' | 'schedule' | 'plans' = 'schedule';

  gymName = 'Powerhouse Gym';
  rating = 4.7;
  reviewCount = 312;
  location = 'Downtown, Metropolis';

  selectedDate = '';
  selectedTime = '';
  selectedPlan: Plan | null = null;
  totalCredits = 250;

  images = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop',
  ];

  timeSlots: TimeSlot[] = [
    { time: '09:00 AM', label: '09:00 AM' },
    { time: '11:00 AM', label: '11:00 AM' },
    { time: '01:00 PM', label: '01:00 PM' },
    { time: '03:00 PM', label: '03:00 PM' },
    { time: '05:00 PM', label: '05:00 PM' },
    { time: '07:00 PM', label: '07:00 PM' },
  ];

  schedules: Schedule[] = [
    { day: 'Monday', openingTime: '06:00 AM', closingTime: '10:00 PM', status: 'Open' },
    { day: 'Tuesday', openingTime: '06:00 AM', closingTime: '10:00 PM', status: 'Open' },
    { day: 'Wednesday', openingTime: '06:00 AM', closingTime: '10:00 PM', status: 'Open' },
    { day: 'Thursday', openingTime: '06:00 AM', closingTime: '10:00 PM', status: 'Open' },
    { day: 'Friday', openingTime: '06:00 AM', closingTime: '09:00 PM', status: 'Open' },
    { day: 'Saturday', openingTime: '08:00 AM', closingTime: '08:00 PM', status: 'Open' },
    { day: 'Sunday', openingTime: '08:00 AM', closingTime: '06:00 PM', status: 'Closed Today' },
  ];

  plans: Plan[] = [
    { name: 'Basic', credits: 125, visits: 10, recommended: false },
    { name: 'Premium', credits: 250, visits: 20, recommended: true },
    { name: 'Gold', credits: 375, visits: 30, recommended: false },
  ];

  amenities: Amenity[] = [
    { icon: 'fitness', label: 'Free Weights' },
    { icon: 'group', label: 'Group Classes' },
    { icon: 'self_improvement', label: 'Yoga Studio' },
    { icon: 'pool', label: 'Swimming Pool' },
    { icon: 'shower', label: 'Showers & Lockers' },
    { icon: 'local_parking', label: 'Free Parking' },
  ];

  aboutText = `Powerhouse Gym, located in the heart of Downtown Metro City, is a state-of-the-art facility dedicated to helping you achieve your fitness goals. We offer a wide range of equipment, expert trainers, and a motivating atmosphere. Whether you're a beginner or a seasoned athlete, Powerhouse Gym provides everything you need for a complete workout experience.`;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.gymId = this.route.snapshot.paramMap.get('id') || '';
    // Load gym details based on ID
  }

  setActiveTab(tab: 'about' | 'facilities' | 'schedule' | 'plans'): void {
    this.activeTab = tab;
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  selectPlan(plan: Plan): void {
    this.selectedPlan = plan;
  }

  reserveSpot(): void {
    if (!this.selectedDate || !this.selectedTime) {
      alert('Please select a date and time');
      return;
    }
    console.log('Reserving spot:', {
      gym: this.gymName,
      date: this.selectedDate,
      time: this.selectedTime,
    });
  }

  proceedToPayment(): void {
    if (!this.selectedPlan) {
      alert('Please select a plan');
      return;
    }
    console.log('Proceeding to payment:', {
      plan: this.selectedPlan,
      totalCredits: this.selectedPlan.credits,
    });
  }
}
