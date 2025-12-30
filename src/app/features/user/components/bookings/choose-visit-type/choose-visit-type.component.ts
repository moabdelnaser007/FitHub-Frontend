import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { SubscriptionService, ActiveSubscription } from '../../../../../services/subscription.service';
import { BookingService } from '../../../../../services/booking.service';
import { UsersService } from '../../../../../services/users.service';

@Component({
    selector: 'app-choose-visit-type',
    standalone: true,
    imports: [CommonModule, RouterModule, HeaderComponent],
    templateUrl: './choose-visit-type.component.html',
    styleUrls: ['./choose-visit-type.component.css']
})
export class ChooseVisitTypeComponent implements OnInit {
    selectedType: 'subscription' | 'single' = 'subscription';

    // Data passed from previous screen
    gymId: number = 0;
    gymName: string = '';
    date: string = '';
    time: string = '';
    cost: number = 0;

    // Subscription Data
    activePlanName: string | null = null;
    activeSubscriptionId: number | null = null;
    remainingVisits: number = 0;
    currentBalance: number = 0;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private subscriptionService: SubscriptionService,
        private bookingService: BookingService,
        private usersService: UsersService
    ) { }

    ngOnInit(): void {
        // Retrieve data from query params
        this.route.queryParams.subscribe(params => {
            this.gymId = Number(params['gymId']) || 0;
            this.gymName = params['gymName'] || 'Gym';
            this.date = params['date'] || '';
            this.time = params['time'] || '';
            this.cost = Number(params['cost']) || 0;

            if (this.gymId) {
                this.checkSubscription();
            } else {
                this.selectedType = 'single';
            }
        });

        // Load wallet balance
        this.loadWalletBalance();
    }

    loadWalletBalance(): void {
        this.usersService.getWalletBalance().subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.currentBalance = response.data.balance;
                }
            },
            error: (err) => console.error('Failed to load wallet balance', err)
        });
    }

    checkSubscription(): void {
        this.subscriptionService.getActiveSubscriptions(this.gymId).subscribe({
            next: (subs) => {
                if (subs && subs.length > 0) {
                    const activeSub = subs.find(s => s.status === 'ACTIVE');

                    if (activeSub) {
                        this.activePlanName = activeSub.planName;
                        this.remainingVisits = activeSub.remainingVisits;
                        this.activeSubscriptionId = activeSub.subscriptionId;
                        this.selectedType = 'subscription';
                    } else {
                        this.setNoSubscription();
                    }
                } else {
                    this.setNoSubscription();
                }
            },
            error: (err) => {
                console.error('Error checking subscription', err);
                this.setNoSubscription();
            }
        });
    }

    setNoSubscription(): void {
        this.activePlanName = null;
        this.activeSubscriptionId = null;
        this.selectedType = 'single';
    }

    selectType(type: 'subscription' | 'single'): void {
        if (type === 'subscription' && !this.activePlanName) {
            return;
        }
        this.selectedType = type;
    }

    continue(): void {
        if (this.selectedType === 'single') {
            this.handleSingleVisitBooking();
        } else if (this.selectedType === 'subscription') {
            this.handleSubscriptionBooking();
        }
    }

    private getScheduledDateTime(): string {
        try {
            const [year, month, day] = this.date.split('-').map(Number);
            let [timeStr, modifier] = this.time.split(' ');
            let [hours, minutes] = timeStr.split(':').map(Number);

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            // Note: Months are 0-indexed in JS Date
            const dateObj = new Date(year, month - 1, day, hours, minutes);
            return dateObj.toISOString();
        } catch (e) {
            console.error('Error parsing date/time', e);
            return new Date().toISOString();
        }
    }

    private handleSingleVisitBooking(): void {
        const scheduledDateTime = this.getScheduledDateTime();

        this.bookingService.createBooking(this.gymId, scheduledDateTime).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.navigateToConfirmation(response.data);
                } else {
                    alert(response.message || 'Booking failed');
                }
            },
            error: (err) => {
                console.error('Booking API error', err);
                alert('An error occurred while confirming your booking.');
            }
        });
    }

    private handleSubscriptionBooking(): void {
        if (!this.activeSubscriptionId) {
            alert('No active subscription found.');
            return;
        }

        const scheduledDateTime = this.getScheduledDateTime();

        // Call updated API with subscriptionId
        this.bookingService.createBooking(this.gymId, scheduledDateTime, this.activeSubscriptionId).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.navigateToConfirmation(response.data);
                } else {
                    alert(response.message || 'Subscription booking failed');
                }
            },
            error: (err) => {
                console.error('Subscription booking API error', err);
                alert('An error occurred while confirming your subscription booking.');
            }
        });
    }

    private navigateToConfirmation(bookingCode?: string): void {
        this.router.navigate(['/booking-confirmation'], {
            queryParams: {
                type: this.selectedType,
                gymName: this.gymName,
                date: this.date,
                time: this.time,
                cost: this.selectedType === 'single' ? this.cost : 0,
                bookingCode: bookingCode
            }
        });
    }

    goBack(): void {
        window.history.back();
    }
}
