import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

interface PaymentState {
  amount?: number;
  credits?: number;
  txnId?: string;
  date?: string;
  planName?: string;
  method?: string;
  reason?: string;
}

@Component({
  selector: 'app-payment-failed',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.css'],
})
export class PaymentFailedComponent {
  state: PaymentState;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.state = (nav?.extras.state as PaymentState) || {};
  }

  get amount(): number {
    return this.state.amount ?? 0;
  }

  get method(): string {
    return this.state.method ?? 'Credit/Debit Card';
  }

  get reason(): string {
    return this.state.reason ?? 'Transaction declined by your bank.';
  }

  changeMethod(): void {
    this.router.navigate(['/choose-plan-payment']);
  }

  tryAgain(): void {
    this.router.navigate(['/choose-plan-payment']);
  }
}
