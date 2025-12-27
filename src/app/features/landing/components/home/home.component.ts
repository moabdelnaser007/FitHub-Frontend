import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../features/auth/services/auth.service';

type ServiceIcon = 'location' | 'plan' | 'ticket';

type NavLink = {
  label: string;
  href: string;
  isRoute: boolean;
  targetId?: string;
};

interface ServiceCard {
  icon: ServiceIcon;
  title: string;
  description: string;
}

interface PlanCard {
  name: string;
  price: number;
  credits: number;
  featured?: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  readonly navLinks: NavLink[] = [
    { label: 'Find Gym', href: '/find-gym', isRoute: true },
    { label: 'Plan', href: '#plans', isRoute: false, targetId: 'plans' },
    { label: 'About Us', href: '#about', isRoute: false, targetId: 'about' },
    { label: 'Contact', href: '#contact', isRoute: false, targetId: 'contact' },
  ];

  readonly services: ServiceCard[] = [
    {
      icon: 'location',
      title: 'Gym Discovery',
      description: 'Easily find and filter gyms by location, amenities, and available classes.',
    },
    {
      icon: 'plan',
      title: 'Flexible Plans',
      description: 'Choose a credit-based plan that matches your lifestyle and fitness goals.',
    },
    {
      icon: 'ticket',
      title: 'Single Membership',
      description: 'One pass is all you need to access hundreds of fitness locations in your city.',
    },
  ];

  readonly plans: PlanCard[] = [
    { name: 'Basic', price: 250, credits: 250 },
    { name: 'Premium', price: 500, credits: 500, featured: true },
    { name: 'Gold', price: 800, credits: 800 },
  ];

  readonly currentYear = new Date().getFullYear();

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  handleNav(link: NavLink, event: Event) {
    if (!link.isRoute && link.targetId) {
      event.preventDefault();
      const target = document.getElementById(link.targetId);
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToPlan(): void {
    this.router.navigate(['/choose-plan-payment']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
