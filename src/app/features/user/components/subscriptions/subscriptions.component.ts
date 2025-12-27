import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

interface SubscriptionItem {
  id: string;
  gymName: string;
  planName: string;
  status: 'Active' | 'Paused' | 'Expired';
  visitsUsed: number;
  totalVisits: number;
  renewalDate: string;
  isExpired?: boolean;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './subscriptions.component.html',
  styleUrls: ['./subscriptions.component.css'],
})
export class SubscriptionsComponent {
  subscriptions: SubscriptionItem[] = [
    {
      id: 's1',
      gymName: 'Powerhouse Gym',
      planName: 'Premium Plan',
      status: 'Active',
      visitsUsed: 5,
      totalVisits: 10,
      renewalDate: 'Nov 15, 2024',
    },
    {
      id: 's2',
      gymName: 'Flex Fitness Center',
      planName: 'Gold Plan',
      status: 'Active',
      visitsUsed: 7,
      totalVisits: 15,
      renewalDate: 'Nov 28, 2024',
    },
    {
      id: 's3',
      gymName: 'Urban Yoga Studio',
      planName: 'Basic Plan',
      status: 'Paused',
      visitsUsed: 6,
      totalVisits: 8,
      renewalDate: 'Dec 5, 2024',
    },
    {
      id: 's4',
      gymName: 'City Climb Center',
      planName: '10-Visit Pass',
      status: 'Expired',
      visitsUsed: 10,
      totalVisits: 10,
      renewalDate: 'Oct 31, 2024',
      isExpired: true,
    },
  ];

  getProgressPercentage(sub: SubscriptionItem): number {
    return ((sub.totalVisits - sub.visitsUsed) / sub.totalVisits) * 100;
  }

  getRemainingVisits(sub: SubscriptionItem): number {
    return sub.totalVisits - sub.visitsUsed;
  }

  constructor(private router: Router) {}

  manageSubscription(sub: SubscriptionItem): void {
    console.log('Managing subscription:', sub.gymName);
    this.router.navigate(['/subscriptions/manage', sub.id]);
  }

  renewSubscription(sub: SubscriptionItem): void {
    console.log('Renewing subscription:', sub.gymName);
  }

  logout(): void {
    console.log('Logout clicked');
    // TODO: Implement logout functionality
  }
}
