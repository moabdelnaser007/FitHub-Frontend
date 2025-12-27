// gym-owner-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
interface DashboardStats {
  label: string;
  value: string;
}

interface StatSection {
  title: string;
  stats: DashboardStats[];
}

@Component({
  selector: 'app-gym-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class GymOwnerDashboardComponent implements OnInit {
  todayStats: DashboardStats[] = [
    { label: 'Total Bookings (Today)', value: '125' },
    { label: 'Total Credits Used (Today)', value: '850' },
    { label: 'Net Earnings (Today)', value: '1,230 EGP' }
  ];

  monthStats: DashboardStats[] = [
    { label: 'Total Bookings (This Month)', value: '3,450' },
    { label: 'Total Credits Used (This Month)', value: '23,120' },
    { label: 'Net Earnings (This Month)', value: '32,850 EGP' }
  ];

  yearStats: DashboardStats[] = [
    { label: 'Total Bookings (This Year)', value: '41,200' },
    { label: 'Total Credits Used (This Year)', value: '295,400' },
    { label: 'Net Earnings (This Year)', value: '410,500 EGP' }
  ];

  ngOnInit(): void {
    // Load dashboard data from API
  }
}