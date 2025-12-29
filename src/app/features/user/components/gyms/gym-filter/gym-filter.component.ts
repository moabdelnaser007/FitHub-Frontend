import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EGYPT_CITIES } from '../../../../../shared/data/cities';

export interface FilterChange {
  location: string;
  rating: number;
}

@Component({
  selector: 'app-gym-filter',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './gym-filter.component.html',
  styleUrls: ['./gym-filter.component.css'],
})
export class GymFilterComponent {
  @Output() filterChange = new EventEmitter<FilterChange>();

  selectedLocation = '';
  selectedRating = 0;

  locations = EGYPT_CITIES;

  ratings = [5, 4, 3, 2, 1];

  applyFilters(): void {
    this.filterChange.emit({
      location: this.selectedLocation,
      rating: this.selectedRating,
    });
  }

  isRatingSelected(rating: number): boolean {
    return this.selectedRating === rating;
  }

  selectRating(rating: number): void {
    if (this.selectedRating === rating) {
      this.selectedRating = 0;
    } else {
      this.selectedRating = rating;
    }
  }
}
