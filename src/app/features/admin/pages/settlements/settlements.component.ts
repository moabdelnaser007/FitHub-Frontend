import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, Settlement } from '../../../../services/user.service';

@Component({
    selector: 'app-admin-settlements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './settlements.component.html',
    styleUrls: ['./settlements.component.css']
})
export class AdminSettlementsComponent implements OnInit {
    settlements: Settlement[] = [];
    isLoading = true;
    error: string | null = null;
    processingId: number | null = null;

    searchText: string = '';
    statusFilter: string = 'ALL';

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadSettlements();
    }

    get filteredSettlements() {
        return this.settlements.filter(s => {
            // Search by Amount or ID
            const textMatch = !this.searchText ||
                s.amount.toString().includes(this.searchText) ||
                s.id.toString().includes(this.searchText);

            // Filter by Status
            const statusMatch = this.statusFilter === 'ALL' || s.status === this.statusFilter;

            // Strict filtering: both must match
            return textMatch && statusMatch;
        });
    }

    loadSettlements(): void {
        this.isLoading = true;
        this.userService.getSettlements().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.settlements = res.data;
                } else {
                    this.error = res.message || 'Failed to load settlements';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.error = 'An error occurred while loading settlements.';
                this.isLoading = false;
            }
        });
    }

    onApprove(settlement: Settlement): void {
        if (!confirm(`Are you sure you want to approve settlement #${settlement.id}?`)) return;

        this.processingId = settlement.id;
        this.userService.approveSettlement(settlement.id, { approve: true, adminNotes: 'Approved via Admin Dashboard' }).subscribe({
            next: (res) => {
                if (res.isSuccess) {
                    // Update local state
                    settlement.status = 'PAID'; // Or whatever the approved status is, usually PAID based on curl example
                    settlement.payoutDate = new Date().toISOString();
                } else {
                    alert('Failed to approve: ' + res.message);
                }
                this.processingId = null;
            },
            error: (err) => {
                console.error(err);
                alert('Error approving settlement');
                this.processingId = null;
            }
        });
    }
}
