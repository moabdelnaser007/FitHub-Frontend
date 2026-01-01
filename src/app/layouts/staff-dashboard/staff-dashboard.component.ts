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
    selector: 'app-staff-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './staff-dashboard.component.html',
    styleUrls: ['./staff-dashboard.component.css']
})
export class StaffLayoutComponent {
    menuItems: MenuItem[] = [
        { icon: 'qr_code_scanner', label: 'Check In', route: '/staff/check-in', active: true },
        { icon: 'history', label: 'Visit Log', route: '/staff/visit-log' }
    ];

    isSidebarOpen = false;

    setActiveMenuItem(item: MenuItem): void {
        this.menuItems.forEach(menuItem => menuItem.active = false);
        item.active = true;
        this.closeSidebar();
    }

    toggleSidebar(): void {
        this.isSidebarOpen = !this.isSidebarOpen;
    }

    closeSidebar(): void {
        this.isSidebarOpen = false;
    }

    constructor(private router: Router, private authService: AuthService) { }

    onProfile(): void {
        this.router.navigate(['/staff/profile']);
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
