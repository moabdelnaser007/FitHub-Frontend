import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../services/users.service';
import { WalletService } from '../../../../services/wallet.service';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amountPaid: number;
  credits: number;
  type: string;
  isPositive: boolean;
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
  totalItems: number = 0;

  transactions: Transaction[] = [];
  paginatedTransactions: Transaction[] = [];
  isLoading: boolean = false;
  userBalance: number = 0;

  constructor(
    private usersService: UsersService,
    private walletService: WalletService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadTransactions();
    this.loadWalletBalance();
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.walletService.getTransactions().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          // Filter out duplicates based on ID
          const seen = new Set();
          this.transactions = response.data.filter((t: Transaction) => {
            const duplicate = seen.has(t.id);
            seen.add(t.id);
            return !duplicate;
          });

          this.totalItems = this.transactions.length;
          this.updatePaginatedTransactions();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
        this.isLoading = false;
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

