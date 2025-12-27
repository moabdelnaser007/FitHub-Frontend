import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    { icon: 'settings', label: 'Settings', route: '/gym-owner/settings' }
  ];

  setActiveMenuItem(item: MenuItem): void {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }

  onProfile(): void {
    console.log('Navigate to profile');
  }

  onLogout(): void {
    console.log('Logout');
    // Add logout logic
  }
}