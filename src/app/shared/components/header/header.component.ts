import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  showProfileMenu = false;
  userName: string = 'User'; // Default value
  userEmail: string = '';
  private destroy$ = new Subject<void>();
  private loginCheckInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check login status on init
    this.checkLoginStatus();

    // Listen to route changes to re-check login status
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        // Delay to ensure token is updated
        setTimeout(() => {
          console.log('🔄 Route changed, checking login status...');
          this.checkLoginStatus();
        }, 200);
      });

    // Listen to localStorage changes (when login happens in same tab)
    window.addEventListener('storage', () => {
      console.log('💾 Storage changed, checking login status...');
      this.checkLoginStatus();
    });

    // Check login status every 300ms to detect token changes immediately
    this.loginCheckInterval = setInterval(() => {
      const currentStatus = this.authService.isLoggedIn();
      if (currentStatus !== this.isLoggedIn) {
        console.log(
          '✅ Login status changed detected! Old:',
          this.isLoggedIn,
          'New:',
          currentStatus
        );
        this.checkLoginStatus();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    if (this.loginCheckInterval) {
      clearInterval(this.loginCheckInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  checkLoginStatus(): void {
    const loggedIn = this.authService.isLoggedIn();
    console.log('🔐 Header - Checking login status:', loggedIn);

    if (loggedIn) {
      const user = this.authService.getUser();
      if (user) {
        // Use first name or full name
        this.userName = user.fullName || 'User';
        this.userEmail = user.email || '';
      }
    }

    this.isLoggedIn = loggedIn;
    this.cdr.markForCheck();
  }

  closeProfileMenu(): void {
    this.showProfileMenu = false;
    this.cdr.markForCheck();
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
    this.cdr.markForCheck();
  }

  navigateToProfile(): void {
    console.log('📍 Navigating to profile...');
    this.closeProfileMenu();
    this.router.navigate(['/profile']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/register']); // Changed to register based on routes
  }

  logout(): void {
    this.closeProfileMenu();
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = 'User';
    this.cdr.markForCheck();
    this.router.navigate(['/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
