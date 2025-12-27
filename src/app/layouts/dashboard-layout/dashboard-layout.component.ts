import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
export class DashboardLayoutComponent {
  @Output() logoutClicked = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard', active: true },
    { icon: 'store', label: 'Gyms', route: '/admin/manage-gyms' },
    { icon: 'group', label: 'Users', route: '/admin/manage-users' },
   
    { icon: 'calendar_today', label: 'Bookings', route: '/bookings' },
    { icon: 'assessment', label: 'Reports', route: '/admin/reports' },
    { icon: 'settings', label: 'Settings', route: '/settings' }
  ];

  adminInfo = {
    name: 'Admin Name',
    role: 'Super Administrator',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqmvXwjP0TbdFCno1OhPwyj5JfbmJ_Vx9hWSgMrymxP52rnxN49GPUamxi40cbeONLB5cYNE_wyOSaBe-hxjJGKab_tdf2iA2I0ZzafVs-MtK95AZdyKacA6K5hz-Tj6jumT_bwsvysX5s_-yux9TeCNMYWIuHBKzx6XDDYS5Gr_UaN7T5QtsLvmD2Rpx_zcwVOZNkuXTftP9AGIF291iI6a8rI4vBi52CuVsA5Y-uuu7pEHWRfPT_4znDFr4snPWJey_zKeOJems'
  };

  onLogout(): void {
    this.logoutClicked.emit();
  }

  setActiveMenuItem(item: MenuItem): void {
    this.menuItems.forEach(menuItem => menuItem.active = false);
    item.active = true;
  }
}