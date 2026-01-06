import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GymService } from '../../../../../services/gym.service';
import { PlansService } from '../../../../../services/plans.service';
import { SubscriptionService } from '../../../../../services/subscription.service';
import { BookingService, Review } from '../../../../../services/booking.service'; // Added
// Force rebuild
import { FooterComponent } from '../../../../../shared/components/footer/footer.component';

interface TimeSlot {
  time: string;
  label: string;
}

interface Schedule {
  day: string;
  openingTime: string;
  closingTime: string;
  status: string;
}

// Ensure this matches the API response structure if we are fetching details
interface Plan {
  id?: number; // Added optional ID
  name: string;
  description?: string; // Added description
  credits: number;
  visits: number;
  durationDays?: number; // Added duration
  recommended?: boolean;
}

/* ... existing interfaces ... */

interface Amenity {
  icon: string;
  label: string;
}

import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-gym-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent],
  templateUrl: './gym-detail.component.html',
  styleUrl: './gym-detail.component.css',
})
export class GymDetailComponent implements OnInit {
  isLoggedIn = false;
  readonly navLinks = [
    { label: 'Find Gym', href: '/find-gym', isRoute: true },
    { label: 'Plan', href: '/#plans', isRoute: true },
    { label: 'About Us', href: '/#about', isRoute: true },
    { label: 'Contact', href: '/#contact', isRoute: true },
  ];
  gymId: string = '';
  activeTab: 'about' | 'facilities' | 'schedule' | 'plans' = 'schedule';

  // Modal state
  showModal = false;
  modalMessage = '';
  modalType: 'success' | 'error' = 'success';

  gymName = '';
  rating = 0;
  reviewCount = 0;
  location = '';

  selectedDate = '';
  minDate = '';
  selectedTime = '';
  selectedPlan: Plan | null = null;
  totalCredits = 250;

  images: string[] = [];

  timeSlots: TimeSlot[] = [
    { time: '09:00 AM', label: '09:00 AM' },
    { time: '11:00 AM', label: '11:00 AM' },
    { time: '01:00 PM', label: '01:00 PM' },
    { time: '03:00 PM', label: '03:00 PM' },
    { time: '05:00 PM', label: '05:00 PM' },
    { time: '07:00 PM', label: '07:00 PM' },
  ];

  schedules: Schedule[] = [];

  plans: Plan[] = [];

  amenities: Amenity[] = [];
  aboutText = '';
  reviews: Review[] = [];

  visitCreditsCost = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gymService: GymService,
    private plansService: PlansService,
    private subscriptionService: SubscriptionService,
    private authService: AuthService,
    private bookingService: BookingService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    this.gymId = this.route.snapshot.paramMap.get('id') || '';
    const idNum = Number(this.gymId);
    if (!idNum) return;

    // Fetch active branch details
    this.gymService.getActiveBranchById(idNum).subscribe({
      next: (branch) => {
        this.gymName = branch.branchName;
        this.location = `${branch.city}, ${branch.address}`;
        this.visitCreditsCost = branch.visitCreditsCost;
        this.images = (branch.images || []).map((img) =>
          this.gymService.getImageUrl(branch.branchName, img.imageName)
        );

        // Map amenities string to display list
        const amenities = (branch.amenitiesAvailable || '')
          .split(',')
          .map((a) => a.trim())
          .filter((a) => a.length > 0);

        this.amenities = amenities.map((label) => ({
          icon: this.getAmenityIconKey(label),
          label
        }));

        // About from backend
        this.aboutText = branch.description || '';

        // Build schedule from backend values
        this.schedules = this.buildSchedules(branch.openTime, branch.closeTime, branch.workingDays);
      },
      error: (err) => {
        console.error('Failed to load branch details', err);
      },
    });

    // Preload plans for this branch
    this.loadPlans(idNum);

    // Load reviews
    this.loadReviews(idNum);

    // Set min date to today
    // Set min date to today (Local time to avoid UTC issues)
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  private getAmenityIconKey(label: string): string {
    const lower = label.toLowerCase().replace(/\s/g, '');
    if (lower.includes('locker')) return 'locker';
    if (lower.includes('shower')) return 'shower';
    if (lower.includes('air') || lower.includes('ac') || lower.includes('condition')) return 'ac';
    if (lower.includes('wifi')) return 'wifi';
    if (lower.includes('park')) return 'parking';
    return 'check';
  }

  private loadReviews(branchId: number): void {
    this.bookingService.getReviewsByBranch(branchId).subscribe({
      next: (data) => {
        this.reviews = data;
        this.reviewCount = data.length;
        // Calculate average rating if needed
        if (data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
          this.rating = Math.round((sum / data.length) * 10) / 10;
        }
      },
      error: (err) => console.error('Failed to load reviews', err)
    });
  }

  private loadPlans(branchId: number): void {
    this.plansService.getPlansByBranch(branchId).subscribe({
      next: (plans) => {
        this.plans = plans.map((p) => ({
          id: p.id, // Map ID
          name: p.name,
          credits: p.creditsCost,
          visits: p.visitsLimit,
          recommended: false,
        }));
      },
      error: (err) => console.error('Failed to load plans', err),
    });
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  handleNav(link: any, event: Event) {
    if (!link.isRoute) {
      // Logic if needed
    }
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  setActiveTab(tab: 'about' | 'facilities' | 'schedule' | 'plans'): void {
    this.activeTab = tab;
    if (tab === 'plans') {
      const idNum = Number(this.gymId);
      if (idNum) this.loadPlans(idNum);
    }
  }

  selectTime(time: string): void {
    this.selectedTime = time;
  }

  selectPlan(plan: Plan): void {
    // Select loosely first to update UI immediately
    this.selectedPlan = plan;

    // Fetch full details as requested
    if (plan.id) {
      this.plansService.getPlan(plan.id).subscribe({
        next: (fullPlan) => {
          // Update selectedPlan with detailed data
          this.selectedPlan = {
            id: fullPlan.id,
            name: fullPlan.name,
            description: fullPlan.description,
            credits: fullPlan.creditsCost,
            visits: fullPlan.visitsLimit,
            durationDays: fullPlan.durationDays,
            recommended: plan.recommended
          };
        },
        error: (err) => console.error('Failed to fetch plan details', err)
      });
    }
  }

  reserveSpot(): void {
    if (!this.isLoggedIn) {
      alert('You must be logged in to reserve a spot. Please log in first.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedDate) {
      alert('Please select a date');
      return;
    }

    // Navigate to visit type selection
    this.router.navigate(['/booking/choose-type'], {
      queryParams: {
        gymId: this.gymId, // Pass the Gym ID (Branch ID)
        gymName: this.gymName,
        date: this.selectedDate,
        time: this.selectedTime || '09:00 AM', // Default to 09:00 AM since selection is hidden
        cost: this.visitCreditsCost
      }
    });
  }
  proceedToPayment(): void {
    if (!this.isLoggedIn) {
      alert('You must be logged in to subscribe to a plan. Please log in first.');
      this.router.navigate(['/login']);
      return;
    }

    if (!this.selectedPlan || !this.selectedPlan.id) {
      alert('Please select a plan');
      return;
    }

    const gymIdNum = Number(this.gymId);
    if (!gymIdNum) return;

    this.subscriptionService.createSubscription({
      branchId: gymIdNum,
      planId: this.selectedPlan.id
    }).subscribe({
      next: (success) => {
        if (success) {
          this.modalMessage = 'Subscription created successfully!';
          this.modalType = 'success';
          this.showModal = true;
        } else {
          this.modalMessage = 'Failed to create subscription. Please try again.';
          this.modalType = 'error';
          this.showModal = true;
        }
      },
      error: (err) => {
        console.error('Subscription error', err);
        const msg = err?.error?.message || 'An error occurred while creating the subscription.';
        this.modalMessage = msg;
        this.modalType = 'error';
        this.showModal = true;
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    if (this.modalType === 'success') {
      // Navigate to subscriptions page or booking history after success
      this.router.navigate(['/subscriptions']);
    }
  }

  // =====================
  // Helpers: Schedule
  // =====================
  private buildSchedules(
    openTimeStr: string,
    closeTimeStr: string,
    workingDaysStr: string
  ): Schedule[] {
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const workingDays = (workingDaysStr || '')
      .split(',')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    const openHour = this.extractHour(openTimeStr);
    const closeHour = this.extractHour(closeTimeStr);

    const opening = this.formatTime(openHour, 'open');
    const closing = this.formatTime(closeHour, 'close');

    return daysOfWeek.map((day) => {
      const isOpen = workingDays.includes(day);
      return {
        day,
        openingTime: opening,
        closingTime: closing,
        status: isOpen ? 'Open' : 'Closed Today',
      } as Schedule;
    });
  }

  private extractHour(timeStr: string): number {
    if (!timeStr) return 8; // sensible default
    // Examples: "8.00:00:00" or "08:00:00"
    const cleaned = timeStr.replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2})[\.:]/);
    const h = match ? Number(match[1]) : Number(cleaned.slice(0, 2));
    if (isNaN(h) || h < 0) return 8;
    return h;
  }

  private formatTime(hour: number, kind: 'open' | 'close'): string {
    let h = Math.max(0, Math.min(23, Math.floor(hour)));
    // Heuristic: gyms typically open in morning and close in evening
    const isPM = kind === 'close' ? true : h >= 12 ? true : false;
    if (kind === 'open' && h === 0) h = 12; // 12 AM
    if (kind === 'close' && h <= 12) {
      // keep hour as is for PM display
    }
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const suffix = isPM ? 'PM' : 'AM';
    return `${displayHour.toString().padStart(2, '0')}:00 ${suffix}`;
  }
}
