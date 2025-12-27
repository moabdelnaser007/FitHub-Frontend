import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

type BookingStatus = 'Confirmed' | 'Completed' | 'Cancelled' | 'No-Show';

interface BookingItem {
  gym: string;
  code: string;
  date: string;
  credits: number;
  status: BookingStatus;
}

@Component({
  selector: 'app-booking-history',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './booking-history.component.html',
  styleUrls: ['./booking-history.component.css'],
})
export class BookingHistoryComponent {
  searchTerm = '';
  statusFilter: 'all' | BookingStatus = 'all';
  currentPage = 1;
  itemsPerPage = 7;
  readonly math = Math;

  // Review modal state
  showReviewModal = false;
  selectedBookingCode = '';
  selectedGymName = '';
  rating = 0;
  reviewText = '';
  isAnonymous = false;

  bookings: BookingItem[] = [
    {
      gym: 'PowerUp Fitness - Downtown',
      code: '#234567',
      date: 'Nov 10, 2023 at 6:00 PM',
      credits: 5,
      status: 'Confirmed',
    },
    {
      gym: 'Zenith Yoga Studio',
      code: '#198765',
      date: 'Oct 28, 2023 at 9:00 AM',
      credits: 3,
      status: 'Completed',
    },
    {
      gym: 'Iron Temple Gym',
      code: '#543210',
      date: 'Oct 22, 2023 at 5:00 PM',
      credits: 4,
      status: 'Cancelled',
    },
    {
      gym: 'The Cycling Hub',
      code: '#987654',
      date: 'Oct 18, 2023 at 7:30 AM',
      credits: 4,
      status: 'No-Show',
    },
    {
      gym: 'AquaFit Center',
      code: '#112233',
      date: 'Oct 15, 2023 at 11:00 AM',
      credits: 6,
      status: 'Completed',
    },
    {
      gym: 'PowerUp Fitness - Uptown',
      code: '#445566',
      date: 'Oct 12, 2023 at 7:00 PM',
      credits: 5,
      status: 'Completed',
    },
    {
      gym: 'Zenith Yoga Studio',
      code: '#778899',
      date: 'Oct 5, 2023 at 9:00 AM',
      credits: 3,
      status: 'Completed',
    },
    {
      gym: 'Urban Boxing Club',
      code: '#334455',
      date: 'Sep 30, 2023 at 6:00 PM',
      credits: 4,
      status: 'Completed',
    },
    {
      gym: 'Pilates Loft',
      code: '#221133',
      date: 'Sep 22, 2023 at 10:00 AM',
      credits: 2,
      status: 'Confirmed',
    },
  ];

  get filteredBookings(): BookingItem[] {
    const term = this.searchTerm.toLowerCase();
    return this.bookings.filter((b) => {
      const matchesTerm = !term || b.gym.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'all' || b.status === this.statusFilter;
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

  leaveReview(code: string): void {
    const booking = this.bookings.find((b) => b.code === code);
    if (booking) {
      this.selectedBookingCode = code;
      this.selectedGymName = booking.gym;
      this.rating = 0;
      this.reviewText = '';
      this.isAnonymous = false;
      this.showReviewModal = true;
    }
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
  }

  submitReview(): void {
    if (this.rating === 0) {
      alert('Please select a rating');
      return;
    }
    console.log('Submitting review:', {
      bookingCode: this.selectedBookingCode,
      gym: this.selectedGymName,
      rating: this.rating,
      review: this.reviewText,
      anonymous: this.isAnonymous,
    });
    // Here you would typically call a service to submit the review
    this.closeReviewModal();
  }

  logout(): void {
    console.log('Logout clicked');
    // TODO: Implement logout functionality
  }
}
