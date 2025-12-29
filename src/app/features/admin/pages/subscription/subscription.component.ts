import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, CreditHistory } from '../../../../services/user.service';

@Component({
    selector: 'app-subscription-history',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './subscription.component.html',
    styleUrls: ['./subscription.component.css']
})
export class SubscriptionComponent implements OnInit {
    history: CreditHistory[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(private userService: UserService, private router: Router) { }

    ngOnInit(): void {
        this.loadHistory();
    }

    loadHistory(): void {
        this.userService.getAllUsersCreditHistory().subscribe({
            next: (res) => {
                if (res.isSuccess && res.data) {
                    this.history = res.data;
                } else {
                    this.error = res.message || 'Failed to load subscription history';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error(err);
                this.error = 'An error occurred while loading data.';
                this.isLoading = false;
            }
        });
    }

    get filteredHistory() {
        return this.history;
    }
}
