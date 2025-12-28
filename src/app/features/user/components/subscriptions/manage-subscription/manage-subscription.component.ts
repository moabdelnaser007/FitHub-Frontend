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
    } else {
      this.errorMessage = 'Invalid Subscription ID';
      this.isLoading = false;
    }
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
    console.log('Cancelling subscription for:', this.subscription?.branchName);
    // Add cancel subscription logic here
  }

  backToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  onLogout(): void {
    localStorage.removeItem('fitHubToken');
    localStorage.removeItem('fitHubUser');
    this.router.navigate(['/login']);
  }
}
