import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  GymCardComponent,
  Gym,
} from '../../../../../shared/components/gym-card/gym-card.component';
import { GymService, GymSearchFilters } from '../../../../../services/gym.service';

@Component({
  selector: 'app-gym-list',
  standalone: true,
  imports: [CommonModule, GymCardComponent],
  templateUrl: './gym-list.component.html',
  styleUrl: './gym-list.component.css',
})
export class GymListComponent implements OnInit, OnChanges {
  @Input() filters?: GymSearchFilters;
  @Output() rateGym = new EventEmitter<Gym>();

  gyms: Gym[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  errorMessage = '';

  constructor(private gymService: GymService) {}

  ngOnInit(): void {
    this.loadGyms();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.loadGyms();
    }
  }

  loadGyms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Check if any filters are applied
    const hasFilters =
      this.filters && (this.filters.name || this.filters.city || this.filters.minRating);

    const apiCall = hasFilters
      ? this.gymService.searchGyms(this.filters!)
      : this.gymService.getAllActiveBranches();

    apiCall.subscribe({
      next: (gyms) => {
        this.gyms = gyms;
        this.totalPages = Math.ceil(gyms.length / 6); // Assuming 6 gyms per page
        this.isLoading = false;
        console.log('✅ Gyms loaded:', gyms);
      },
      error: (error) => {
        console.error('❌ Error loading gyms:', error);
        this.errorMessage = 'Failed to load gyms. Please try again.';
        this.isLoading = false;
      },
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Load gyms for this page (currently loading all)
      window.scrollTo(0, 0);
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
