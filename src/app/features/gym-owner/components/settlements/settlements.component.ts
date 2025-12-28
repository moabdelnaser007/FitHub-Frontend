import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettlementsService, Settlement } from '../../../../services/settlements.service';

@Component({
    selector: 'app-settlements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settlements.component.html',
    styleUrls: ['./settlements.component.css']
})
export class SettlementsComponent implements OnInit {
    settlements: Settlement[] = [];
    filteredSettlements: Settlement[] = [];
    isLoading: boolean = false;
    error: string | null = null;

    searchText: string = '';
    showFilterMenu: boolean = false;
    selectedStatus: string | null = null;
    uniqueStatuses: string[] = ['PENDING', 'PAID', 'REJECTED']; // Common statuses

    // Create Modal
    showCreateModal: boolean = false;
    newSettlementAmount: number | null = null;
    isCreating: boolean = false;
    createError: string | null = null;

    constructor(private settlementsService: SettlementsService) { }

    ngOnInit(): void {
        this.fetchSettlements();
    }

    fetchSettlements(): void {
        this.isLoading = true;
        this.error = null;
        this.settlementsService.getSettlements().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.settlements = response.data;
                    this.uniqueStatuses = [...new Set(this.settlements.map(s => s.status))];
                    this.applyFilters();
                } else {
                    this.error = response.message || 'Failed to fetch settlements';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching settlements:', err);
                this.error = 'Failed to load settlements.';
                this.isLoading = false;
            }
        });
    }

    applyFilters(): void {
        let result = [...this.settlements];

        if (this.searchText.trim()) {
            const query = this.searchText.toLowerCase();
            result = result.filter(s =>
                s.id.toString().includes(query) ||
                s.status.toLowerCase().includes(query)
            );
        }

        if (this.selectedStatus) {
            result = result.filter(s => s.status === this.selectedStatus);
        }

        this.filteredSettlements = result;
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

    getStatusClass(status: string): string {
        const s = status.toUpperCase();
        if (s === 'PAID') return 'status-completed';
        if (s === 'PENDING') return 'status-no-show'; // Using 'no-show' style for pending (orange) or custom
        if (s === 'REJECTED') return 'status-cancelled';
        return '';
    }

    // Create Modal Logic
    openCreateModal(): void {
        this.showCreateModal = true;
        this.newSettlementAmount = null;
        this.createError = null;
    }

    closeCreateModal(): void {
        this.showCreateModal = false;
        this.newSettlementAmount = null;
        this.createError = null;
    }

    submitSettlement(): void {
        if (!this.newSettlementAmount || this.newSettlementAmount <= 0) {
            this.createError = 'Please enter a valid amount.';
            return;
        }

        this.isCreating = true;
        this.createError = null;

        this.settlementsService.createSettlement({ amount: this.newSettlementAmount }).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    alert('Settlement request created successfully!');
                    this.closeCreateModal();
                    this.fetchSettlements();
                } else {
                    this.createError = response.message || 'Failed to create settlement.';
                }
                this.isCreating = false;
            },
            error: (err) => {
                console.error('Error creating settlement:', err);
                this.createError = 'An error occurred. Please try again.';
                this.isCreating = false;
            }
        });
    }
}
