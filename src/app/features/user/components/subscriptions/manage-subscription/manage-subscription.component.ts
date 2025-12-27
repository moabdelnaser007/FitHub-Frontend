import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';

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
export class ManageSubscriptionComponent {
  // Subscription details
  gymName = 'Powerhouse Gym';
  planName = 'Premium Plan';
  status = 'Active';
  visitsRemaining = 5;
  totalVisits = 10;
  renewalDate = 'Nov 15, 2024';

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

  constructor(private router: Router) {}

  pauseSubscription(): void {
    console.log('Pausing subscription for:', this.gymName);
    // Add pause subscription logic here
  }

  cancelSubscription(): void {
    console.log('Cancelling subscription for:', this.gymName);
    // Add cancel subscription logic here
  }

  backToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  onLogout(): void {
    console.log('Logout clicked');
    // TODO: Implement logout functionality
  }
}
