import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService, Booking } from '../../../../services/bookings.service';
import { BranchService as AdminBranchService, Branch } from '../../../../services/admin-branches.service';

@Component({
    selector: 'app-admin-bookings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './bookings.component.html',
    styleUrls: ['./bookings.component.css']
})
export class AdminBookingsComponent implements OnInit {
    bookings: Booking[] = [];
    isLoading = true;
    error: string | null = null;
    searchText = '';

    branches: Branch[] = [];
    selectedBranch: Branch | null = null;

    showFilterMenu = false;
    selectedStatus = 'All';

    constructor(
        private bookingsService: BookingsService,
        private branchService: AdminBranchService
    ) { }

    ngOnInit(): void {
        this.loadBranches();
    }

    loadBranches(): void {
        this.isLoading = true;
        this.branchService.getAllBranches().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.branches = response.data;
                } else {
                    this.error = response.message || 'Failed to load branches';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading branches', err);
                this.error = 'Failed to load branches';
                this.isLoading = false;
            }
        });
    }

    viewBranchBookings(branch: Branch): void {
        this.selectedBranch = branch;
        this.loadBookings(branch.id);
    }

    backToBranches(): void {
        this.selectedBranch = null;
        this.bookings = [];
        this.error = null;
        this.searchText = '';
        this.selectedStatus = 'All';
    }

    loadBookings(branchId: number): void {
        this.isLoading = true;
        this.bookingsService.getBranchBookings(branchId).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.bookings = response.data;
                } else {
                    this.error = response.message || 'Failed to load bookings';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading bookings', err);
                this.error = 'An error occurred while loading bookings.';
                this.isLoading = false;
            }
        });
    }

    toggleFilterMenu(): void {
        this.showFilterMenu = !this.showFilterMenu;
    }

    selectStatusFilter(status: string): void {
        this.selectedStatus = status;
        this.showFilterMenu = false;
    }

    get filteredBookings() {
        return this.bookings.filter(b => {
            const code = b.bookingCode || '';
            const bName = b.branchName || '';
            const status = b.status || '';

            const matchesSearch = code.toLowerCase().includes(this.searchText.toLowerCase()) ||
                bName.toLowerCase().includes(this.searchText.toLowerCase()) ||
                status.toLowerCase().includes(this.searchText.toLowerCase());

            const matchesStatus = this.selectedStatus === 'All' || status.toUpperCase() === this.selectedStatus.toUpperCase();

            return matchesSearch && matchesStatus;
        });
    }

    getStatusClass(status: string): string {
        if (!status) return 'status-default';
        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'status-confirmed';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            case 'NOSHOW': return 'status-noshow';
            default: return 'status-default';
        }
    }
}
