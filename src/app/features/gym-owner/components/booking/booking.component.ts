import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService, Booking } from '../../../../services/bookings.service';
import { BranchService, BranchData } from '../../../../services/branch.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class BookingsComponent implements OnInit {
  searchText: string = '';
  bookings: Booking[] = [];
  allBookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  branches: BranchData[] = [];
  selectedBranch: BranchData | null = null;

  showFilterMenu: boolean = false;
  selectedStatus: string | null = null;
  uniqueStatuses: string[] = [];

  constructor(
    private bookingsService: BookingsService,
    private branchService: BranchService
  ) { }

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.branchService.getAllBranches().subscribe({
      next: (data) => {
        this.branches = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching branches:', err);
        this.error = 'Failed to load branches.';
        this.isLoading = false;
      }
    });
  }

  viewBranchBookings(branch: BranchData): void {
    this.selectedBranch = branch;
    this.fetchBookings(branch.id);
  }

  backToBranches(): void {
    this.selectedBranch = null;
    this.bookings = [];
    this.allBookings = [];
    this.filteredBookings = [];
    this.error = null;
  }

  fetchBookings(branchId: number): void {
    this.isLoading = true;
    this.bookingsService.getBranchBookings(branchId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.allBookings = response.data;
          this.uniqueStatuses = [...new Set(this.allBookings.map(b => b.status))];
          this.applyFilters();
        } else {
          this.error = response.message || 'Failed to fetch bookings';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.error = 'An error occurred while fetching details.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.allBookings];

    // Filter by Search Text
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      result = result.filter(booking =>
        booking.branchName.toLowerCase().includes(searchLower) ||
        booking.status.toLowerCase().includes(searchLower)
      );
    }

    // Filter by Status
    if (this.selectedStatus) {
      result = result.filter(booking => booking.status === this.selectedStatus);
    }

    this.filteredBookings = result;
    this.bookings = this.filteredBookings;
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'COMPLETED': 'status-completed',
      'CONFIRMED': 'status-confirmed',
      'NOSHOW': 'status-no-show',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  selectStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.showFilterMenu = false;
    this.applyFilters();
  }

  onPrevious(): void {
    console.log('Previous page');
  }

  onNext(): void {
    console.log('Next page');
  }
}