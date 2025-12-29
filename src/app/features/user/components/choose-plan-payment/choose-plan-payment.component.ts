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

@Component({
  selector: 'app-choose-plan-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './choose-plan-payment.component.html',
  styleUrls: ['./choose-plan-payment.component.css'],
})
export class ChoosePlanPaymentComponent implements OnInit {
  paymentForm!: FormGroup;
  selectedPlan: Plan | null = null;
  selectedPaymentMethod: PaymentMethod | null = null;
  saveCardForFuture: boolean = false;
  isProcessing = false;

  plans: Plan[] = [
    {
      id: 'basic',
      planId: 1, // Assuming IDs based on order
      name: 'Basic',
      price: 250,
      credits: 250,
      isPopular: false,
      selected: false,
    },
    {
      id: 'premium',
      planId: 2,
      name: 'Premium',
      price: 500,
      credits: 500,
      isPopular: true,
      selected: true,
    },
    {
      id: 'gold',
      planId: 3,
      name: 'Gold',
      price: 800,
      credits: 800,
      isPopular: false,
      selected: false,
    },
  ];

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
    private walletService: WalletService
  ) { }

  ngOnInit(): void {
    this.selectedPlan = this.plans[1]; // Premium selected by default
    this.selectedPaymentMethod = this.paymentMethods[0]; // Card selected by default
    this.initializeForm();
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
    if (!this.selectedPlan) {
      console.warn('Please select a plan');
      return;
    }

    this.isProcessing = true;

    this.walletService.rechargeWallet(this.selectedPlan.planId).subscribe({
      next: (response) => {
        if (response && response.redirectUrl) {
          // Redirect the user to the payment gateway
          window.location.href = response.redirectUrl;
        } else {
          console.error('No redirect URL provided');
          this.isProcessing = false;
        }
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
}
