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
}

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent {
  state: PaymentState;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.state = (nav?.extras.state as PaymentState) || {};
  }

  get amount(): number {
    return this.state.amount ?? 0;
  }

  get credits(): number {
    return this.state.credits ?? 0;
  }

  get txnId(): string {
    return this.state.txnId ?? '#TXN-00000';
  }

  get dateTime(): string {
    return this.state.date
      ? new Date(this.state.date).toLocaleString()
      : new Date().toLocaleString();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  viewTransactions(): void {
    this.router.navigate(['/billing']);
  }
}
