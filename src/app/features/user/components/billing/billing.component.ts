import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../services/users.service';
import { BookingService, BookingItem } from '../../../../services/booking.service';

interface Transaction {
  id?: number;
  date: string;
  description: string;
  amountPaid: string;
  credits: string;
  status?: string;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
})
export class BillingComponent implements OnInit {
  currentUser: User | null = null;
  searchQuery: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 20;

  transactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  isLoading: boolean = false;
  userBalance: number = 0;

  constructor(
    private usersService: UsersService,
    private bookingService: BookingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadBookings();
    this.loadWalletBalance();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.transactions = response.data.map(item => this.mapBookingToTransaction(item));
          this.totalItems = this.transactions.length;
          this.updatePaginatedTransactions();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.isLoading = false;
      }
    });
  }

  private mapBookingToTransaction(item: BookingItem): Transaction {
    const date = new Date(item.scheduledDateTime);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return {
      id: item.id,
      date: formattedDate,
      description: `${item.branchName} Visit`,
      amountPaid: '0.00 Credits', // Bookings typically use credits already purchased
      credits: `-${item.creditsCost}`,
      status: item.status
    };
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

  updatePaginatedTransactions(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTransactions = this.transactions.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedTransactions();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onRecharge(): void {
    console.log('Recharge button clicked');
    // TODO: Implement recharge functionality
  }

  logout(): void {
    // Clear authentication data
    localStorage.removeItem('fitHubToken');
    localStorage.removeItem('fitHubUser');

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  goToRecharge(): void {
    this.router.navigate(['/gyms']);
  }
}
