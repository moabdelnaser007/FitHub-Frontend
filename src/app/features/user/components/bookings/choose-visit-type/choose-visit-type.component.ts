import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../../shared/components/header/header.component';
import { SubscriptionService, ActiveSubscription } from '../../../../../services/subscription.service';

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
    remainingVisits: number = 0;
    currentBalance: number = 0; // Keeping this for now, though not in API response shown

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private subscriptionService: SubscriptionService
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
                // If no gym ID, default to single visit as we can't check sub
                this.selectedType = 'single';
            }
        });
    }

    checkSubscription(): void {
        this.subscriptionService.getActiveSubscriptions(this.gymId).subscribe({
            next: (subs) => {
                if (subs && subs.length > 0) {
                    // Check for ACTIVE status and non-zero visits just in case, but API implies 'Active' subs
                    const activeSub = subs.find(s => s.status === 'ACTIVE');

                    if (activeSub) {
                        this.activePlanName = activeSub.planName;
                        this.remainingVisits = activeSub.remainingVisits;
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
        this.selectedType = 'single';
    }

    selectType(type: 'subscription' | 'single'): void {
        if (type === 'subscription' && !this.activePlanName) {
            return; // Cannot select if no subscription
        }
        this.selectedType = type;
    }

    continue(): void {
        // Navigate to confirmation (mock)
        console.log('Continuing with:', this.selectedType);
        this.router.navigate(['/booking-confirmation'], {
            queryParams: {
                type: this.selectedType,
                gymName: this.gymName,
                date: this.date,
                time: this.time,
                cost: this.selectedType === 'single' ? this.cost : 0
            }
        });
    }

    goBack(): void {
        window.history.back();
    }
}
