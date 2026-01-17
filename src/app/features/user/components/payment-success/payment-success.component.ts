import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';

interface PaymentState {
  amount?: number;
  credits?: number;
  txnId?: string;
  date?: string;
  planName?: string;
  method?: string;
}

import { WalletService } from '../../../../services/wallet.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css'],
})
export class PaymentSuccessComponent implements OnInit {
  state: PaymentState = {};
  redirectMessage = 'Redirecting to billing in 2 seconds...';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private walletService: WalletService
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.state = nav.extras.state as PaymentState;
    }
  }

  ngOnInit(): void {
    // Check for query params if state is empty (external redirect)
    this.route.queryParams.subscribe((params) => {
      if (!this.state.txnId && params['id']) {
        this.state = {
          txnId: params['id'],
          amount: params['amount_cents'] ? Number(params['amount_cents']) / 100 : 0,
          date: params['created_at'],
          method: 'Card', // Default or derived
          credits: 0 // Paymob doesn't return this, backend would need to sync it
        };
      }
    });

    // 🔄 Sync Balance immediately
    this.walletService.getTransactions().subscribe({
      next: () => console.log('✅ Transactions & Balance Synced'),
      error: (err) => console.error('⚠️ Sync failed:', err)
    });

    // Auto-redirect to billing as requested
    setTimeout(() => {
      this.viewTransactions();
    }, 2000);
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
