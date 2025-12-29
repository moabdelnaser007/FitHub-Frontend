import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  submitted = false;
  loading = false;
  statusMessage = '';
  errorMessage = '';
  email = '';
  otp = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((qp) => {
      if (qp['email']) {
        this.email = qp['email'];
      }
      if (qp['otp']) {
        this.otp = qp['otp'].trim();
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  submit(): void {
    this.submitted = true;
    this.statusMessage = '';
    this.errorMessage = '';

    const meetsLength = this.password.trim().length >= 8;
    const matches = this.password === this.confirmPassword;

    if (!meetsLength) {
      this.errorMessage = 'Password must be at least 8 characters long.';
      return;
    }

    if (!matches) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    if (!this.email || !this.otp) {
      this.errorMessage = 'Missing reset information. Please start again.';
      return;
    }

    this.loading = true;
    this.authService
      .resetPassword(this.email, this.otp, this.password.trim(), this.confirmPassword.trim())
      .subscribe({
        next: (res: any) => { // Added 'res: any' to the next callback signature
          this.loading = false; // Keep loading = false
          if (res.success) {
            this.statusMessage = res.message || 'OTP verified. Redirecting to reset password...';
            // Navigate to login after a short delay
            setTimeout(() => this.router.navigate(['/login']), 2000);
          } else { // Added else block to handle non-success cases if res.success is false
            this.errorMessage = res.message || 'Failed to reset password. Please try again.';
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ Reset password error:', err);

          // The server might return PascalCase or camelCase
          const apiMessage = err.error?.Message || err.error?.message;
          this.errorMessage = apiMessage || err.message || 'Failed to reset password. Please try again.';
        },
      });
  }
}
