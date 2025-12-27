import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FinancialReport {
  id: string;
  gymName: string;
  period: string;
  creditsConsumed: number;
  payoutAmount: number;
  status: 'Pending' | 'Paid';
  isSelected: boolean;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  reports: FinancialReport[] = [
    {
      id: '1',
      gymName: 'Apex Fitness',
      period: 'October 2023',
      creditsConsumed: 1830,
      payoutAmount: 18300.00,
      status: 'Pending',
      isSelected: false
    },
    {
      id: '2',
      gymName: 'Zenith Yoga Studio',
      period: 'October 2023',
      creditsConsumed: 952,
      payoutAmount: 9520.00,
      status: 'Paid',
      isSelected: false
    },
    {
      id: '3',
      gymName: 'CrossFit Powerhouse',
      period: 'October 2023',
      creditsConsumed: 1120,
      payoutAmount: 11200.00,
      status: 'Pending',
      isSelected: false
    },
    {
      id: '4',
      gymName: 'Momentum Cycling',
      period: 'October 2023',
      creditsConsumed: 640,
      payoutAmount: 6400.00,
      status: 'Paid',
      isSelected: false
    }
  ];

  filteredReports: FinancialReport[] = [];
  selectAll: boolean = false;
  selectedMonth: string = 'October';
  selectedYear: string = '2023';

  months = ['October', 'September', 'August'];
  years = ['2023', '2022', '2021'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredReports = [...this.reports];
  }

  onApplyFilters(): void {
    console.log('Applying filters:', this.selectedMonth, this.selectedYear);
    // Filter logic here
    this.filteredReports = this.reports.filter(report => 
      report.period === `${this.selectedMonth} ${this.selectedYear}`
    );
  }

  onToggleSelectAll(): void {
    this.filteredReports.forEach(report => report.isSelected = this.selectAll);
  }

  onToggleReportSelect(report: FinancialReport): void {
    this.selectAll = this.filteredReports.every(r => r.isSelected);
  }

  onMarkAsPaid(report: FinancialReport): void {
    report.status = 'Paid';
    console.log('Marked as paid:', report);
  }

  onViewReport(report: FinancialReport): void {
    console.log('View report:', report);
    // الانتقال لصفحة التفاصيل مع إرسال الـ ID
    this.router.navigate(['/admin/report-details', report.id]);
  }

  onExportCSV(): void {
    console.log('Exporting to CSV');
    // Export logic here
  }

  getStatusClass(status: string): string {
    return status === 'Paid' ? 'status-paid' : 'status-pending';
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  formatCurrency(amount: number): string {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}