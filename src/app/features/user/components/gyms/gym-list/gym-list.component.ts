import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  GymCardComponent,
  Gym,
} from '../../../../../shared/components/gym-card/gym-card.component';

@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, GymCardComponent],
  templateUrl: './gym-list.component.html',
  styleUrl: './gym-list.component.css',
})
export class GymListComponent implements OnInit {
  gyms: Gym[] = [];
  currentPage = 1;
  totalPages = 8;
  @Output() rateGym = new EventEmitter<Gym>();

  ngOnInit(): void {
    this.loadGyms();
  }

  loadGyms(): void {
    // Mock data - replace with actual API call
    this.gyms = [
      {
        id: '1',
        name: 'Powerhouse Gym',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
        rating: 4.9,
        reviewCount: 124,
        location: 'Downtown, San Francisco',
        activities: ['CrossFit', 'Weightlifting'],
      },
      {
        id: '2',
        name: 'ZenFlow Yoga',
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
        rating: 5.0,
        reviewCount: 98,
        location: 'Mission District, San Francisco',
        activities: ['Yoga', 'Pilates'],
      },
      {
        id: '3',
        name: 'The Ascent',
        image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop',
        rating: 4.8,
        reviewCount: 215,
        location: 'Dogpatch, San Francisco',
        activities: ['Climbing', 'Bouldering'],
      },
      {
        id: '4',
        name: 'Iron Will CrossFit',
        image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
        rating: 4.9,
        reviewCount: 155,
        location: 'SoMa, San Francisco',
        activities: ['CrossFit', 'HIIT'],
      },
      {
        id: '5',
        name: 'City Fitness',
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
        rating: 4.7,
        reviewCount: 302,
        location: 'Hayes Valley, San Francisco',
        activities: ['Gym', 'Classes'],
      },
      {
        id: '6',
        name: 'AquaFit Center',
        image: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=600&fit=crop',
        rating: 4.8,
        reviewCount: 89,
        location: 'Marina District, San Francisco',
        activities: ['Swimming', 'Sauna'],
      },
    ];
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Load gyms for this page
    }
  }

  get pages(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 1);
    const end = Math.min(this.totalPages, this.currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  openReview(gym: Gym): void {
    this.rateGym.emit(gym);
  }
}
