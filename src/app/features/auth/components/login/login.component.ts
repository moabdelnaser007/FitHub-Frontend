import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;

  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup(): void {
    this.router.navigate(['/register']);
  }

  submit(): void {
    this.errorMessage = '';
    this.isLoading = true;

    console.log('🚀 Starting login with:', this.email);

    this.authService.login(this.email, this.password).subscribe({
      next: (token) => {
        console.log('✅ Login successful!');

        // Check role from token for immediate redirect
        const role = this.authService.getRoleFromToken(token);
        console.log('🔑 Role from token:', role);

        // Fetch current user details to update state
        this.authService.getCurrentUser().subscribe({
          next: (user) => {
            console.log('✅ User details fetched:', user);
          },
          error: (err) => console.error('❌ Failed to fetch user details:', err)
        });

        this.isLoading = false;

        if (role && (role === 'Owner' || role === 'GymOwner' || role.toLowerCase() === 'gymowner')) {
          console.log('🔀 Redirecting to Gym Owner Dashboard (based on token)');
          this.router.navigate(['/gym-owner/dashboard']);
        } else {
          console.log('🔀 Redirecting to Home');
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;

        // Extract error message from API response
        if (err.error?.message) {
          this.errorMessage = err.error.message;
        } else if (err.error?.Message) {
          this.errorMessage = err.error.Message;
        } else if (err.message) {
          this.errorMessage = err.message;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }

        console.error('❌ Login error:', this.errorMessage);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      },
    });
  }
}
