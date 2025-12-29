import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../../features/auth/services/auth.service';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

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

import { WalletService } from '../../../../services/wallet.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private destroy$ = new Subject<void>();

  // Contact Form
  contactName = '';
  contactEmail = '';
  contactMessage = '';

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

  plans: PlanCard[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadPlans();
  }

  loadPlans() {
    this.walletService.getAllFitHubPlans().subscribe({
      next: (res) => {
        if (res.isSuccess && res.data) {
          this.plans = res.data.map((p: any) => ({
            name: p.name,
            price: p.price,
            credits: p.creditsValue,
            featured: p.name === 'Premium' // Auto-highlight Premium
          }));
        }
      },
      error: (err) => console.error('Failed to load plans', err)
    });
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

  sendMessage(): void {
    if (this.contactName && this.contactEmail && this.contactMessage) {
      alert('we receve your commit and we will contact you');
      this.contactName = '';
      this.contactEmail = '';
      this.contactMessage = '';
    } else {
      alert('Please fill in all fields');
    }
  }
}
