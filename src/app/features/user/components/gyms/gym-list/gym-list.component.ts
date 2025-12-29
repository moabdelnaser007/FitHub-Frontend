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
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  GymCardComponent,
  Gym,
} from '../../../../../shared/components/gym-card/gym-card.component';
import { GymService, GymSearchFilters } from '../../../../../services/gym.service';
import { BookingService } from '../../../../../services/booking.service';

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

  constructor(
    private gymService: GymService,
    private bookingService: BookingService
  ) { }

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

    // Create a copy of filters to avoid modifying the input
    // We remove minRating from the service call because ratings are fetched client-side
    const searchFilters = { ...this.filters };
    const minRating = searchFilters.minRating;
    delete searchFilters.minRating;

    const hasFilters =
      searchFilters && (searchFilters.name || searchFilters.city);

    const apiCall = hasFilters
      ? this.gymService.searchGyms(searchFilters)
      : this.gymService.getAllActiveBranches();

    apiCall.subscribe({
      next: (gyms) => {
        // Prepare requests to fetch ratings for all gyms
        const ratingRequests = gyms.map((gym) => {
          const gymId = Number(gym.id);
          if (!gymId) return of(gym); // Return observable of gym if no ID

          return this.bookingService.getReviewsByBranch(gymId).pipe(
            map((reviews) => {
              gym.reviewCount = reviews.length;
              if (reviews.length > 0) {
                const total = reviews.reduce((sum, r) => sum + r.rating, 0);
                gym.rating = Math.round((total / reviews.length) * 10) / 10;
              } else {
                gym.rating = 0;
              }
              return gym;
            }),
            catchError((err) => {
              console.error(`Failed to load reviews for gym ${gym.id}`, err);
              return of(gym); // Return the gym even if ratings fail
            })
          );
        });

        // Wait for all ratings to be fetched
        forkJoin(ratingRequests).subscribe({
          next: (updatedGyms) => {
            // Now apply the rating filter
            if (minRating && minRating > 0) {
              this.gyms = updatedGyms.filter((g) => g.rating >= minRating);
            } else {
              this.gyms = updatedGyms;
            }

            this.totalPages = Math.ceil(this.gyms.length / 6);
            this.isLoading = false;
            console.log('✅ Gyms loaded and filtered:', this.gyms);
          },
          error: (err) => {
            console.error('Error processing ratings:', err);
            // Fallback: show gyms without rating filtering if forkJoin fails unexpectedly
            this.gyms = gyms;
            this.isLoading = false;
          }
        });
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
