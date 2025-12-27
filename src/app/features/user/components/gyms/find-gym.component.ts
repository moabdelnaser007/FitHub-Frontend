import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GymFilterComponent } from './gym-filter/gym-filter.component';
import { GymListComponent } from './gym-list/gym-list.component';
import { Gym } from '../../../../shared/components/gym-card/gym-card.component';

@Component({
  selector: 'app-find-gym',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GymFilterComponent, GymListComponent],
  templateUrl: './find-gym.component.html',
  styleUrl: './find-gym.component.css',
})
export class FindGymComponent {
  searchQuery = '';
  showReview = false;
  selectedGym?: Gym;
  rating = 4;
  reviewText = '';
  anonymous = false;

  onSearch(): void {
    console.log('Searching for:', this.searchQuery);
    // Implement search logic
  }

  onRateGym(gym: Gym): void {
    this.selectedGym = gym;
    this.showReview = true;
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  closeReview(): void {
    this.showReview = false;
    this.reviewText = '';
    this.anonymous = false;
  }

  submitReview(): void {
    if (!this.selectedGym) return;
    console.log('Submit review', {
      gymId: this.selectedGym.id,
      rating: this.rating,
      text: this.reviewText.trim(),
      anonymous: this.anonymous,
    });
    // TODO: Integrate with API
    this.closeReview();
  }
}
