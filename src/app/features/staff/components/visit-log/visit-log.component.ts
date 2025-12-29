import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisitsService, VisitLog } from '../../../../services/visits.service';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-visit-log',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './visit-log.component.html',
    styleUrls: ['./visit-log.component.css']
})
export class VisitLogComponent implements OnInit {
    logs: VisitLog[] = [];
    isLoading = true;
    error: string | null = null;

    searchTerm: string = '';
    filterType: 'ALL' | 'FREE' | 'DEDUCTED' = 'ALL';
    isDropdownOpen: boolean = false;

    constructor(
        private visitsService: VisitsService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        this.userService.getMe().subscribe({
            next: (userRes) => {
                if (userRes.isSuccess && userRes.data) {
                    const branchId = userRes.data.branchId || userRes.data.gymId || 1;
                    this.fetchVisits(branchId);
                } else {
                    this.error = 'Failed to fetch user profile';
                    this.isLoading = false;
                }
            },
            error: (err) => {
                this.error = 'Failed to load user profile';
                this.isLoading = false;
            }
        });
    }

    fetchVisits(branchId: number): void {
        this.visitsService.getBranchVisits(branchId).subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.logs = res.data;
                } else {
                    this.error = res.message || 'Failed to load visit logs';
                }
                this.isLoading = false;
            },
            error: (err) => {
                this.error = 'An error occurred while loading visit logs';
                this.isLoading = false;
            }
        });
    }

    get filteredLogs(): VisitLog[] {
        return this.logs.filter(log => {
            const term = this.searchTerm.toLowerCase();
            const matchesSearch =
                (log.memberName && log.memberName.toLowerCase().includes(term)) ||
                (log.branchName && log.branchName.toLowerCase().includes(term));

            const matchesFilter =
                this.filterType === 'ALL' ? true :
                    this.filterType === 'FREE' ? log.creditsDeducted === 0 :
                        this.filterType === 'DEDUCTED' ? log.creditsDeducted > 0 : true;

            return matchesSearch && matchesFilter;
        });
    }

    onSearch(): void {
        // Triggered by keyup, logical place for debounce if needed
    }

    toggleFilter(): void {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    setFilter(type: 'ALL' | 'FREE' | 'DEDUCTED'): void {
        this.filterType = type;
        this.isDropdownOpen = false; // Close on selection
    }
}
