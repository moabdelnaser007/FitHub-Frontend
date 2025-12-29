import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingsService, Booking } from '../../../../services/bookings.service';

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

    showFilterMenu = false;
    selectedStatus = 'All';

    constructor(private bookingsService: BookingsService) { }

    ngOnInit(): void {
        this.loadBookings();
    }

    loadBookings(): void {
        this.bookingsService.getBranchBookings(1).subscribe({
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
            const matchesSearch = b.bookingCode.toLowerCase().includes(this.searchText.toLowerCase()) ||
                b.branchName.toLowerCase().includes(this.searchText.toLowerCase()) ||
                b.status.toLowerCase().includes(this.searchText.toLowerCase());

            const matchesStatus = this.selectedStatus === 'All' || b.status.toUpperCase() === this.selectedStatus.toUpperCase();

            return matchesSearch && matchesStatus;
        });
    }

    getStatusClass(status: string): string {
        switch (status.toUpperCase()) {
            case 'CONFIRMED': return 'status-confirmed';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            case 'NOSHOW': return 'status-noshow';
            default: return 'status-default';
        }
    }
}
