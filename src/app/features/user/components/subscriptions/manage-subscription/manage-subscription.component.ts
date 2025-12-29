import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { UsersService, User } from '../../../../../services/users.service';
import { SubscriptionService, ActiveSubscription } from '../../../../../services/subscription.service';

interface BillingRecord {
  date: string;
  description: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-manage-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './manage-subscription.component.html',
  styleUrls: ['./manage-subscription.component.css'],
})
export class ManageSubscriptionComponent implements OnInit {
  currentUser: User | null = null;
  subscription: ActiveSubscription | null = null;
  subscriptionId: number | null = null;
  isLoading = true;
  errorMessage = '';
  userBalance: number = 0;

  // Billing history (Still hardcoded as per current API scope)

  // Billing history
  billingHistory: BillingRecord[] = [
    {
      date: 'Oct 15, 2024',
      description: 'Monthly Renewal',
      amount: 'EGP 800.00',
      status: 'Paid',
    },
    {
      date: 'Sep 15, 2024',
      description: 'Monthly Renewal',
      amount: 'EGP 800.00',
      status: 'Paid',
    },
    {
      date: 'Aug 15, 2024',
      description: 'Monthly Renewal',
      amount: 'EGP 800.00',
      status: 'Paid',
    },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private usersService: UsersService,
    private subscriptionService: SubscriptionService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.subscriptionId = +idParam;
      this.loadUserProfile();
      this.loadSubscriptionDetails();
      this.loadWalletBalance();
    } else {
      this.errorMessage = 'Invalid Subscription ID';
      this.isLoading = false;
    }
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
      error: (error) => console.error('Error loading profile:', error)
    });
  }

  loadSubscriptionDetails(): void {
    this.isLoading = true;
    this.subscriptionService.getMySubscriptions().subscribe({
      next: (subs) => {
        this.subscription = subs.find(s => s.subscriptionId === this.subscriptionId) || null;
        if (!this.subscription) {
          this.errorMessage = 'Subscription not found';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subscription:', error);
        this.errorMessage = 'Failed to load subscription details.';
        this.isLoading = false;
      }
    });
  }

  pauseSubscription(): void {
    console.log('Pausing subscription for:', this.subscription?.branchName);
    // Add pause subscription logic here
  }

  cancelSubscription(): void {
    if (!this.subscriptionId || !this.subscription) return;

    if (confirm(`Are you sure you want to cancel your subscription to ${this.subscription.branchName}?`)) {
      this.isLoading = true;
      this.subscriptionService.cancelSubscription(this.subscriptionId).subscribe({
        next: (success) => {
          if (success) {
            alert('Subscription cancelled successfully.');
            this.loadSubscriptionDetails(); // Reload to update status
          } else {
            alert('Failed to cancel subscription.');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error cancelling subscription:', error);
          alert('An error occurred while cancelling your subscription.');
          this.isLoading = false;
        }
      });
    }
  }

  backToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  goToRecharge(): void {
    this.router.navigate(['/choose-plan-payment']);
  }

  onLogout(): void {
    localStorage.removeItem('fitHubToken');
    localStorage.removeItem('fitHubUser');
    this.router.navigate(['/login']);
  }
}
