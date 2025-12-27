import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gym-filter',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './gym-filter.component.html',
  styleUrls: ['./gym-filter.component.css'],
})
export class GymFilterComponent {
  selectedLocation = 'San Francisco, CA';
  selectedRating = 4;

  locations = ['San Francisco, CA', 'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Austin, TX'];

  ratings = [5, 4, 3, 2, 1];

  applyFilters(): void {
    // Emit filter change event or call service
    console.log('Applying filters:', {
      location: this.selectedLocation,
      rating: this.selectedRating,
    });
  }

  isRatingSelected(rating: number): boolean {
    return this.selectedRating === rating;
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
  }
}
