import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../services/users.service';

interface Transaction {
  date: string;
  description: string;
  amountPaid: string;
  credits: string;
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

  transactions: Transaction[] = [
    {
      date: 'Oct 15, 2023',
      description: 'Pro Plan (50 Credits)',
      amountPaid: '$49.99',
      credits: '+50',
    },
    {
      date: 'Sep 15, 2023',
      description: 'Pro Plan (50 Credits)',
      amountPaid: '$49.99',
      credits: '+50',
    },
    {
      date: 'Aug 15, 2023',
      description: 'Starter Plan (20 Credits)',
      amountPaid: '$24.99',
      credits: '+20',
    },
    {
      date: 'Jul 15, 2023',
      description: 'Starter Plan (20 Credits)',
      amountPaid: '$24.99',
      credits: '+20',
    },
    {
      date: 'Jun 10, 2023',
      description: 'Top-up (10 Credits)',
      amountPaid: '$15.00',
      credits: '+10',
    },
    {
      date: 'May 20, 2023',
      description: 'Pro Plan (50 Credits)',
      amountPaid: '$49.99',
      credits: '+50',
    },
    {
      date: 'Apr 10, 2023',
      description: 'Starter Plan (20 Credits)',
      amountPaid: '$24.99',
      credits: '+20',
    },
    {
      date: 'Mar 5, 2023',
      description: 'Top-up (15 Credits)',
      amountPaid: '$20.00',
      credits: '+15',
    },
  ];

  paginatedTransactions: Transaction[] = [];

  constructor(
    private usersService: UsersService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.updatePaginatedTransactions();
    this.loadUserProfile();
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
