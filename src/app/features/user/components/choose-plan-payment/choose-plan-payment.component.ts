import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { WalletService } from '../../../../services/wallet.service';

interface Plan {
  id: string;
  planId: number;
  name: string;
  price: number;
  credits: number;
  isPopular?: boolean;
  selected?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  selected?: boolean;
}

import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-choose-plan-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './choose-plan-payment.component.html',
  styleUrls: ['./choose-plan-payment.component.css'],
})
export class ChoosePlanPaymentComponent implements OnInit {
  isLoggedIn = false;
  readonly navLinks = [
    { label: 'Find Gym', href: '/find-gym', isRoute: true },
    { label: 'Plan', href: '/#plans', isRoute: true },
    { label: 'About Us', href: '/#about', isRoute: true },
    { label: 'Contact', href: '/#contact', isRoute: true },
  ];

  paymentForm!: FormGroup;
  selectedPlan: Plan | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  saveCardForFuture: boolean = false;
  isProcessing = false;
  // ... (code omitted for brevity)
  plans: Plan[] = [];


  paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      selected: true,
    },
    {
      id: 'ewallet',
      name: 'E-Wallet',
      icon: '📱',
      selected: false,
    },
    {
      id: 'instapay',
      name: 'InstaPay',
      icon: '💰',
      selected: false,
    },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private walletService: WalletService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.loadFitHubPlans();
    this.selectedPaymentMethod = this.paymentMethods[0];
    this.initializeForm();
  }

  loadFitHubPlans(): void {
    this.walletService.getAllFitHubPlans().subscribe({
      next: (res) => {
        // Handle various response structures
        const data = res.data || res;

        if (data && Array.isArray(data)) {
          this.plans = data.map((p: any, index: number) => ({
            id: p.name.toLowerCase().replace(/\s+/g, '-'),
            planId: p.id,
            name: p.name,
            price: p.price,
            credits: p.creditsValue,
            isPopular: index === 1,
            selected: index === 1,
          }));

          if (this.plans.length > 0) {
            this.selectedPlan = this.plans.find(p => p.selected) || this.plans[0];
          }
        }
      },
      error: err => console.error('Failed to load plans', err)
    });
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      cardholderName: ['', Validators.required],
      cardNumber: ['', [Validators.required, Validators.minLength(16)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^\d{2}\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.minLength(3)]],
      saveCard: [false],
    });
  }

  selectPlan(plan: Plan): void {
    this.plans.forEach((p) => (p.selected = false));
    plan.selected = true;
    this.selectedPlan = plan;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethods.forEach((m) => (m.selected = false));
    method.selected = true;
    this.selectedPaymentMethod = method;
  }

  calculateTax(): string {
    const basePrice = this.selectedPlan?.price || 500;
    const tax = basePrice * 0.15;
    return tax.toFixed(2);
  }

  calculateTotal(): string {
    const basePrice = this.selectedPlan?.price || 500;
    const total = basePrice + basePrice * 0.15;
    return total.toFixed(2);
  }

  confirmAndPay(): void {
    if (!this.authService.isLoggedIn()) {
      alert('You must be logged in to proceed with the payment. Please log in first.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedPlan) {
      console.warn('Please select a plan');
      return;
    }

    this.isProcessing = true;

    this.walletService.rechargeWallet(this.selectedPlan.planId).subscribe({
      next: (response: any) => {
        // Handle potential ResponseViewModel wrapper
        const data = response.data || response;
        const redirectUrl = data.redirectUrl || data.RedirectUrl;

        if (redirectUrl) {
          // Redirect the user to the payment gateway
          window.location.href = redirectUrl;
        } else {
          // If no redirect URL, assume direct success (mock or internal)
          console.log('Payment successful, redirecting to billing...');
          this.router.navigate(['/billing']);
        }
        this.isProcessing = false;
      },
      error: (error) => {
        console.error('Payment initiation failed', error);
        this.isProcessing = false;
        // Optionally handle error UI here
      },
    });
  }

  get totalDue(): number {
    return this.selectedPlan?.price || 0;
  }

  proceedToPayment(): void {
    // This seems to be an alternative or older method, mapping it to confirmAndPay for consistency if used
    this.confirmAndPay();
  }

  onCardNumberChange(event: any): void {
    let value = event.target.value.replace(/\s/g, '');
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = formattedValue;
    this.paymentForm.patchValue(
      { cardNumber: formattedValue.replace(/\s/g, '') },
      { emitEvent: false }
    );
  }

  onExpiryChange(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    event.target.value = value;
    this.paymentForm.patchValue({ expiryDate: value }, { emitEvent: false });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  handleNav(link: any, event: Event) {
    if (!link.isRoute) {
      // Logic if needed
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
