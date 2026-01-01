import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserService } from '../../services/user.service';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  @Output() logoutClicked = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard', active: true },
    { icon: 'store', label: 'Gyms', route: '/admin/manage-gyms' },
    { icon: 'group', label: 'Users', route: '/admin/manage-users' },

    { icon: 'calendar_today', label: 'Bookings', route: '/admin/bookings' },
    { icon: 'assessment', label: 'Subscription', route: '/admin/subscription' },
    { icon: 'paid', label: 'Settlement', route: '/admin/settlements' }
  ];

  adminInfo = {
    name: 'Loading...',
    role: 'Administrator'
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadAdminProfile();
  }

  loadAdminProfile(): void {
    this.userService.getMe().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.adminInfo.name = res.data.fullName;
          this.adminInfo.role = res.data.status || 'Administrator';
        }
      },
      error: (err) => console.error('Failed to load admin profile', err)
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.logoutClicked.emit();
  }

  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  setActiveMenuItem(item: MenuItem): void {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
    this.closeSidebar();
  }
}