import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GymOwnerDashboardService, GymOwnerDashboardStats } from '../../../../services/gym-owner-dashboard.service';

@Component({
  selector: 'app-gym-owner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class GymOwnerDashboardComponent implements OnInit {
  stats: GymOwnerDashboardStats | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private dashboardService: GymOwnerDashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.stats = response.data;
        } else {
          this.errorMessage = response.message || 'Failed to load dashboard data';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.errorMessage = 'Failed to load dashboard stats. Please try again.';
        this.isLoading = false;
      }
    });
  }
}