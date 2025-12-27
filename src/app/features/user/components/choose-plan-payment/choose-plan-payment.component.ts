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

interface Plan {
  id: string;
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

  plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 250,
      credits: 250,
      isPopular: false,
      selected: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 500,
      credits: 500,
      isPopular: true,
      selected: true,
    },
    {
      id: 'gold',
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

  constructor(private fb: FormBuilder, private router: Router) {}

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

    const paymentData = {
      amount: parseFloat(this.calculateTotal()),
      baseAmount: this.selectedPlan.price,
      tax: parseFloat(this.calculateTax()),
      credits: this.selectedPlan.credits,
      planName: this.selectedPlan.name,
      method: 'Credit Card',
      txnId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
    };

    // Navigate to payment success
    this.router.navigate(['/payment-success'], { state: paymentData });
  }

  get totalDue(): number {
    return this.selectedPlan?.price || 0;
  }

  proceedToPayment(): void {
    if (!this.selectedPlan) {
      console.warn('Please select a plan');
      return;
    }

    if (!this.selectedPaymentMethod) {
      console.warn('Please select a payment method');
      return;
    }

    if (this.selectedPaymentMethod.id === 'card' && this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      console.warn('Please fill in all card details');
      return;
    }

    const paymentData = {
      amount: this.totalDue,
      credits: this.selectedPlan.credits,
      planName: this.selectedPlan.name,
      method: this.selectedPaymentMethod.name,
      txnId: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toISOString(),
    };

    const shouldFail =
      this.selectedPaymentMethod.id === 'card' &&
      (this.paymentForm.value.cvv === '000' || this.paymentForm.value.cardNumber?.endsWith('0'));

    if (shouldFail) {
      this.router.navigate(['/payment-failed'], { state: paymentData });
      return;
    }

    this.router.navigate(['/payment-success'], { state: paymentData });
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
