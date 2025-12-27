import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

interface GymData {
  gymName: string;
  ownerName: string;
  location: string;
  period: string;
  creditsConsumed: number;
  payoutAmount: string;
}

interface PaymentInfo {
  method: string;
  accountName: string;
  bankName: string;
  iban: string;
  vodafoneCash: string | null;
  instaPay: string | null;
  notes: string;
}

interface PayoutHistoryItem {
  period: string;
  credits: number;
  amount: string;
  date: string;
  status: string;
}

interface CurrentPayout {
  period: string;
  credits: number;
  amount: string;
}

@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.css']
})
export class ReportDetailsComponent implements OnInit {

  reportId!: number;

  // ================= MOCK DATA (بدل API حالياً) =================
  reports = [
    {
      id: 1,
      gymData: {
        gymName: 'Apex Fitness',
        ownerName: 'Ahmed El-Sayed',
        location: 'Cairo, Egypt',
        period: 'October 2023',
        creditsConsumed: 1830,
        payoutAmount: '18,300.00'
      },
      paymentInfo: {
        method: 'Bank Transfer',
        accountName: 'Ahmed El-Sayed',
        bankName: 'CIB Egypt',
        iban: 'EG8300040001000000123456789',
        vodafoneCash: null,
        instaPay: null,
        notes: 'Please process payment before the 5th of the month.'
      },
      payoutHistory: [
        {
          period: 'September 2023',
          credits: 1650,
          amount: '16,500.00',
          date: 'Oct 03, 2023',
          status: 'Paid'
        },
        {
          period: 'August 2023',
          credits: 1920,
          amount: '19,200.00',
          date: 'Sep 05, 2023',
          status: 'Paid'
        }
      ],
      currentPayout: {
        period: 'October 2023',
        credits: 1830,
        amount: '18,300.00'
      }
    },
    {
      id: 2,
      gymData: {
        gymName: 'Iron Gym',
        ownerName: 'Mohamed Ali',
        location: 'Giza, Egypt',
        period: 'October 2023',
        creditsConsumed: 1200,
        payoutAmount: '12,000.00'
      },
      paymentInfo: {
        method: 'Vodafone Cash',
        accountName: 'Mohamed Ali',
        bankName: '',
        iban: '',
        vodafoneCash: '01012345678',
        instaPay: null,
        notes: ''
      },
      payoutHistory: [
        {
          period: 'September 2023',
          credits: 1100,
          amount: '11,000.00',
          date: 'Oct 01, 2023',
          status: 'Paid'
        }
      ],
      currentPayout: {
        period: 'October 2023',
        credits: 1200,
        amount: '12,000.00'
      }
    }
  ];

  // ================= BINDINGS (مهمة عشان الـ HTML) =================
  gymData!: GymData;
  paymentInfo!: PaymentInfo;
  payoutHistory: PayoutHistoryItem[] = [];
  currentPayout!: CurrentPayout;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.reportId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadReportData(this.reportId);
  }

  loadReportData(id: number): void {
    const report = this.reports.find(r => r.id === id);

    if (!report) {
      console.error('Report not found');
      return;
    }

    this.gymData = report.gymData;
    this.paymentInfo = report.paymentInfo;
    this.payoutHistory = report.payoutHistory;
    this.currentPayout = report.currentPayout;
  }

  confirmPayment(): void {
    alert('Payment confirmed successfully!');
  }

  markAsFailed(): void {
    const ok = confirm('Are you sure you want to mark this payment as failed?');
    if (ok) {
      alert('Payment marked as failed.');
    }
  }
}
