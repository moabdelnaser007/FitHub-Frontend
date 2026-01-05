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

  protected readonly Math = Math;

  gyms: Gym[] = [];
  currentPage = 1;
  pageSize = 16;
  totalPages = 1;
  isLoading = false;
  errorMessage = '';

  constructor(
    private gymService: GymService
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

    // Create a copy of filters or use defaults
    const searchFilters: GymSearchFilters = this.filters ? { ...this.filters } : {};

    // Call API with filters (or empty filters for all gyms)
    this.gymService.searchGyms(searchFilters).subscribe({
      next: (gyms) => {
        this.gyms = gyms;
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.gyms.length / this.pageSize);
        this.isLoading = false;
        console.log('✅ Gyms loaded:', this.gyms.length);
      },
      error: (error) => {
        console.error('❌ Error loading gyms:', error);
        this.errorMessage = 'Failed to load gyms. Please try again.';
        this.isLoading = false;
        this.gyms = [];
      },
    });
  }

  get paginatedGyms(): Gym[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.gyms.slice(startIndex, startIndex + this.pageSize);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo(0, 0);
    }
  }

  get pages(): number[] {
    // Simple pagination logic: show all pages for now or a limited window
    // For simplicity, let's show max 5 pages around current page
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + 4);

    // Adjust start if end is limited
    if (end - start < 4) {
      start = Math.max(1, end - 4);
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openReview(gym: Gym): void {
    this.rateGym.emit(gym);
  }
}
