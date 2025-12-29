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
    'Cairo', 'Giza', 'Alexandria', 'Shubra El Kheima', 'Port Said', 'Suez',
    'El Mahalla El Kubra', 'Luxor', 'Mansoura', 'Tanta', 'Asyut', 'Ismailia',
    'Fayoum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef',
    'Qena', 'Sohag', 'Hurghada', '6th of October', 'Shibin El Kom', 'Banha',
    'Kafr El Sheikh', 'Arish', 'Mallawi', '10th of Ramadan', 'Bilbais',
    'Marsa Matruh', 'Idfu', 'Mit Ghamr', 'Al-Hamidiyya', 'Desouk', 'Qalyub',
    'Abu Kabir', 'Kafr El Dawwar', 'Girga', 'Akhmim', 'Matareya'
  ].sort();

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
