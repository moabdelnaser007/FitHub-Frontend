import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GymFilterComponent, FilterChange } from './gym-filter/gym-filter.component';
import { GymListComponent } from './gym-list/gym-list.component';
import { Gym } from '../../../../shared/components/gym-card/gym-card.component';
import { AuthService } from '../../../auth/services/auth.service';
import { GymSearchFilters } from '../../../../services/gym.service';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-find-gym',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GymFilterComponent, GymListComponent, FooterComponent],
  templateUrl: './find-gym.component.html',
  styleUrl: './find-gym.component.css',
})
export class FindGymComponent implements OnInit {
  searchQuery = '';
  currentFilters: GymSearchFilters = {};
  showReview = false;
  selectedGym?: Gym;
  rating = 4;
  reviewText = '';
  anonymous = false;
  isLoggedIn = false;

  readonly navLinks = [
    { label: 'Find Gym', href: '/find-gym', isRoute: true },
    { label: 'Plan', href: '/#plans', isRoute: true },
    { label: 'About Us', href: '/#about', isRoute: true },
    { label: 'Contact', href: '/#contact', isRoute: true },
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  handleNav(link: any, event: Event) {
    if (!link.isRoute) {
      // For find-gym, we redirect to home anchors if needed (though I made them routes above)
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

  onSearch(): void {
    this.currentFilters = {
      ...this.currentFilters,
      name: this.searchQuery.trim() || undefined,
    };
  }

  onFilterChange(filters: FilterChange): void {
    this.currentFilters = {
      name: this.searchQuery.trim() || undefined,
      city: filters.location || undefined,
      minRating: filters.rating > 0 ? filters.rating : undefined,
    };
  }

  onRateGym(gym: Gym): void {
    this.selectedGym = gym;
    this.showReview = true;
  }

  setRating(stars: number): void {
    this.rating = stars;
  }

  closeReview(): void {
    this.showReview = false;
    this.reviewText = '';
    this.anonymous = false;
  }

  submitReview(): void {
    if (!this.selectedGym) return;
    console.log('Submit review', {
      gymId: this.selectedGym.id,
      rating: this.rating,
      text: this.reviewText.trim(),
      anonymous: this.anonymous,
    });
    // TODO: Integrate with API
    this.closeReview();
  }
}
