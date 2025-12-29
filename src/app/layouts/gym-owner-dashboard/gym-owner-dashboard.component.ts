import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-gym-owner-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './gym-owner-dashboard.component.html',
  styleUrls: ['./gym-owner-dashboard.component.css']
})
export class GymOwnerLayoutComponent {
  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/gym-owner/dashboard', active: true },
    { icon: 'storefront', label: 'Branches', route: '/gym-owner/manage-branches' },
    { icon: 'group', label: 'Staff', route: '/gym-owner/manage-staff' },
    { icon: 'credit_card', label: 'Subscription Plans', route: '/gym-owner/branches-list' },
    { icon: 'calendar_month', label: 'Bookings', route: '/gym-owner/bookings' },
    { icon: 'card_membership', label: 'Subscriptions', route: '/gym-owner/subscriptions' },
    { icon: 'payments', label: 'Settlements', route: '/gym-owner/settlements' },
  ];

  setActiveMenuItem(item: MenuItem): void {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }

  constructor(private router: Router, private authService: AuthService) { }

  // ...

  onProfile(): void {
    console.log('Navigate to profile');
    this.router.navigate(['/gym-owner/profile']);
  }

  onLogout(): void {
    console.log('Logout');
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}