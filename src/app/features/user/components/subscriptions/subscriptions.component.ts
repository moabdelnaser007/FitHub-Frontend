import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../services/users.service';
import { SubscriptionService, ActiveSubscription } from '../../../../services/subscription.service';

interface SubscriptionItem {
  subscriptionId: number;
  branchName: string;
  planName: string;
  remainingVisits: number;
  status: string;
  endDate: string;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css'],
})
export class SubscriptionsComponent implements OnInit {
  currentUser: User | null = null;

  subscriptions: SubscriptionItem[] = [];
  isLoading = false;
  errorMessage = '';
  userBalance: number = 0;

  getProgressPercentage(sub: SubscriptionItem): number {
    // Since we only have remainingVisits, we can't show progress unless we know the total.
    // For now, let's assume a default total if it's not provided, or hide the bar.
    return 100;
  }

  getRemainingVisits(sub: SubscriptionItem): number {
    return sub.remainingVisits;
  }

  constructor(
    private router: Router,
    private usersService: UsersService,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadSubscriptions();
    this.loadWalletBalance();
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

  loadSubscriptions(): void {
    this.isLoading = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => {
        this.subscriptions = subs;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscriptions:', error);
        this.errorMessage = 'Failed to load your subscriptions. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  manageSubscription(sub: SubscriptionItem): void {
    console.log('Managing subscription:', sub.branchName);
    this.router.navigate(['/subscriptions/manage', sub.subscriptionId]);
  }

  renewSubscription(sub: SubscriptionItem): void {
    console.log('Renewing subscription:', sub.branchName);
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
