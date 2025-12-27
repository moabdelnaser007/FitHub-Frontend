import { CommonModule, NgFor } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  locations = [
    'Cairo (Al Qāhirah)',
    'Alexandria (Al Iskandariyah)',
    'Giza',
    'Shubra El-Kheima',
    'Port Said',
    'Suez',
    'Luxor',
    'Aswan',
    'Ismailia',
    'Tanta',
  ];

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
    this.selectedRating = rating;
  }
}
