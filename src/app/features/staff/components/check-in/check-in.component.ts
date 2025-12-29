import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VisitsService } from '../../../../services/visits.service';
import { AuthService } from '../../../../features/auth/services/auth.service';

@Component({
    selector: 'app-check-in',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './check-in.component.html',
    styleUrls: ['./check-in.component.css']
})
export class CheckInComponent {
    bookingCode = '';
    isLoading = false;
    message = '';
    isSuccess: boolean | null = null;

    constructor(
        private visitsService: VisitsService,
        private authService: AuthService,
        private router: Router
    ) { }

    onCheckIn() {
        if (!this.bookingCode.trim()) return;

        this.isLoading = true;
        this.message = '';
        this.isSuccess = null;

        this.visitsService.checkIn(this.bookingCode).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.isSuccess = res.isSuccess;
                this.message = res.message || (res.isSuccess ? 'Check-in successful' : 'Check-in failed');
                if (res.isSuccess) {
                    this.bookingCode = ''; // Clear input on success
                }
            },
            error: (err) => {
                this.isLoading = false;
                this.isSuccess = false;
                this.message = err.error?.message || 'An error occurred during check-in.';
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
