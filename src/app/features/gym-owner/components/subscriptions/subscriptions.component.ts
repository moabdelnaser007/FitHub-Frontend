import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GymSubscriptionsService, Subscription } from '../../../../services/gym-subscriptions.service';

@Component({
    selector: 'app-gym-owner-subscriptions',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subscriptions.component.html',
    styleUrls: ['./subscriptions.component.css']
})
export class GymOwnerSubscriptionsComponent implements OnInit {
    searchText: string = '';
    subscriptions: Subscription[] = [];
    allSubscriptions: Subscription[] = [];
    filteredSubscriptions: Subscription[] = [];
    isLoading: boolean = false;
    error: string | null = null;

    showFilterMenu: boolean = false;
    selectedStatus: string | null = null;
    uniqueStatuses: string[] = [];

    constructor(private subscriptionsService: GymSubscriptionsService) { }

    ngOnInit(): void {
        this.fetchSubscriptions();
    }

    fetchSubscriptions(): void {
        this.isLoading = true;
        this.subscriptionsService.getBranchSubscriptions(1).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.allSubscriptions = response.data;
                    this.uniqueStatuses = [...new Set(this.allSubscriptions.map(s => s.status))];
                    this.applyFilters();
                } else {
                    this.error = response.message || 'Failed to fetch subscriptions';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching subscriptions:', err);
                this.error = 'An error occurred while fetching details.';
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        let result = [...this.allSubscriptions];

        // Filter by Search Text
        if (this.searchText.trim()) {
            const searchLower = this.searchText.toLowerCase();
            result = result.filter(sub =>
                sub.branchName.toLowerCase().includes(searchLower) ||
                sub.planName.toLowerCase().includes(searchLower) ||
                sub.status.toLowerCase().includes(searchLower)
            );
        }

        // Filter by Status
        if (this.selectedStatus) {
            result = result.filter(sub => sub.status === this.selectedStatus);
        }

        this.filteredSubscriptions = result;
        this.subscriptions = this.filteredSubscriptions;
    }

    getStatusClass(status: string): string {
        const statusClasses: { [key: string]: string } = {
            'ACTIVE': 'status-active',
            'EXPIRED': 'status-expired',
            'CANCELLED': 'status-cancelled'
        };
        return statusClasses[status] || '';
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
