import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  email = '';
  submitted = false;
  statusMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  submit(): void {
    this.submitted = true;
    const isValidEmail = this.email.trim().length > 3 && this.email.includes('@');

    if (!isValidEmail) {
      this.statusMessage = '';
      return;
    }

    this.loading = true;
    this.statusMessage = '';

    // Use AuthService.forgotPassword which calls the correct endpoint
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: () => {
        this.loading = false;
        this.statusMessage = 'OTP sent successfully! Redirecting...';
        // Navigate to verify page with email as query param after a short delay
        setTimeout(() => {
          this.router.navigate(['/verify-otp'], { queryParams: { email: this.email.trim() } });
        }, 1000);
      },
      error: (err) => {
        this.loading = false;

        // Improved error handling - check backend message fields first (capital M for ASP.NET)
        if (err.error?.Message) {
          this.statusMessage = err.error.Message;
        } else if (err.error?.message) {
          this.statusMessage = err.error.message;
        } else if (err.message) {
          this.statusMessage = err.message;
        } else if (err.status === 0) {
          this.statusMessage = 'Unable to connect to server. Please check your connection.';
        } else if (err.status === 404) {
          this.statusMessage = 'Email not found. Please check and try again.';
        } else {
          this.statusMessage = 'Failed to send OTP. Please try again.';
        }

        console.error('❌ Send OTP error:', this.statusMessage);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      },
    });
  }
}
