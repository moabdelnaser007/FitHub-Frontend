import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VisitsService, VisitLog } from '../../../../services/visits.service';
import { UserService } from '../../../../services/user.service';

@Component({
    selector: 'app-visit-log',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './visit-log.component.html',
    styleUrls: ['./visit-log.component.css']
})
export class VisitLogComponent implements OnInit {
    logs: VisitLog[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(
        private visitsService: VisitsService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.loadLogs();
    }

    loadLogs(): void {
        // First fetch user profile to get probable branchId
        this.userService.getMe().subscribe({
            next: (userRes) => {
                if (userRes.isSuccess && userRes.data) {
                    // Default to 1 if no branchId found, to ensure data loads as requested
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
}
