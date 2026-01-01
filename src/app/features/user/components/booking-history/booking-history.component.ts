import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../services/users.service';
import { BookingService, BookingItem } from '../../../../services/booking.service';
import { FormsModule } from '@angular/forms';

type BookingStatus = 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css'],
})
export class BookingHistoryComponent implements OnInit {
  currentUser: User | null = null;

  searchTerm = '';
  statusFilter: 'all' | BookingStatus = 'all';
  userBalance: number = 0;
  currentPage = 1;
  itemsPerPage = 7;
  readonly math = Math;

  constructor(
    private usersService: UsersService,
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadWalletBalance();
    this.loadBookings();
  }



  loadUserProfile(): void {
    this.usersService.getMe().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.currentUser = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  loadWalletBalance(): void {
    this.usersService.getWalletBalance().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.userBalance = response.data.balance;
        }
      },
      error: (error) => {
        console.error('Error loading wallet balance:', error);
      },
    });
  }

  // Review modal state
  showReviewModal = false;
  selectedBookingCode = '';
  selectedGymName = '';
  rating = 0;
  reviewText = '';
  isAnonymous = false;

  // Info modal state
  showInfoModal = false;
  infoMessage = '';

  loadBookings(): void {
    this.bookingService.getMyBookings().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.bookings = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
      }
    });
  }

  bookings: BookingItem[] = [];

  get filteredBookings(): BookingItem[] {
    const term = (this.searchTerm || '').toLowerCase();
    const statusFilterLower = this.statusFilter.toLowerCase();

    return (this.bookings || []).filter((b) => {
      const branchName = (b.branchName || '').toLowerCase();
      const status = (b.status || '').toLowerCase();

      const matchesTerm = !term || branchName.includes(term);
      const matchesStatus = statusFilterLower === 'all' || status === statusFilterLower;

      return matchesTerm && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredBookings.length / this.itemsPerPage));
  }

  get paginatedBookings(): BookingItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBookings.slice(start, start + this.itemsPerPage);
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.currentPage = 1;
  }

  onStatusChange(status: 'all' | BookingStatus): void {
    this.statusFilter = status;
    this.currentPage = 1;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  leaveReview(id: any): void {
    const bookingId = Number(id);
    const booking = this.bookings.find((b) => Number(b.id) === bookingId);
    if (booking) {
      if (booking.status.toUpperCase() === 'CONFIRMED') {
        this.infoMessage = 'You cannot leave a review for a confirmed booking. Please complete your visit first.';
        this.showInfoModal = true;
        return;
      }

      this.selectedBookingCode = booking.id.toString();
      this.selectedGymName = booking.branchName;
      this.rating = 0;
      this.reviewText = '';
      this.isAnonymous = false;
      this.showReviewModal = true;
    }
  }

  closeInfoModal(): void {
    this.showInfoModal = false;
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (this.rating === 0) {
      this.infoMessage = 'Please select a rating';
      this.showInfoModal = true;
      return;
    }

    const bookingId = Number(this.selectedBookingCode);

    this.bookingService.submitReview(
      bookingId,
      this.rating,
      this.reviewText,
      this.isAnonymous
    ).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.closeReviewModal();
          this.infoMessage = response.message || 'Review submitted successfully';
          this.showInfoModal = true;
          this.loadBookings();
        } else {
          this.infoMessage = response.message || 'Failed to submit review';
          this.showInfoModal = true;
        }
      },
      error: (error) => {
        console.error('Error submitting review:', error);
        if (error.error && error.error.message) {
          this.infoMessage = error.error.message;
        } else {
          this.infoMessage = 'An error occurred while submitting your review. Please try again.';
        }
        this.showInfoModal = true;
      }
    });
  }

  logout(): void {
    // Clear authentication data
    localStorage.removeItem('fitHubToken');
    localStorage.removeItem('fitHubUser');

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  goToRecharge(): void {
    this.router.navigate(['/choose-plan-payment']);
  }
}
