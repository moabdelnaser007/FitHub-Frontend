import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OtpService, OtpResponse } from '../../services/otp.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.css'],
})
export class VerifyOtpComponent implements OnInit {
  otp = '';
  submitted = false;
  statusMessage = '';
  email = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private otpService: OtpService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // read email from query params
    this.route.queryParams.subscribe((qp) => {
      if (qp['email']) {
        this.email = qp['email'];
      }
    });
  }

  submit(): void {
    this.submitted = true;
    const isValidOtp = this.otp.trim().length === 6;

    if (!isValidOtp) {
      this.statusMessage = '';
      return;
    }

    if (!this.email) {
      this.statusMessage = 'Email not provided. Please start password reset again.';
      return;
    }

    this.loading = true;
    this.otpService.verifyOtp(this.email, this.otp.trim()).subscribe({
      next: (res: OtpResponse) => {
        this.loading = false;
        // debug log (dev only)
        // eslint-disable-next-line no-console
        console.log('[VerifyOtp] verify response', res);

        if (res.success) {
          this.statusMessage = 'OTP verified. Redirecting to reset password...';
          // short delay so user sees the success message before navigation
          setTimeout(() => {
            this.router.navigate(['/reset-password'], { queryParams: { email: this.email } });
          }, 600);
        } else {
          this.statusMessage = res.message || 'Invalid OTP. Try again.';
        }
      },
      error: () => {
        this.loading = false;
        this.statusMessage = 'Verification failed. Try again.';
      },
    });
  }

  resend(): void {
    if (!this.email) {
      this.statusMessage = 'Email not available to resend OTP.';
      return;
    }
    this.loading = true;
    this.otpService.resendOtp(this.email).subscribe((r: OtpResponse) => {
      this.loading = false;
      this.statusMessage = r.success
        ? 'A new OTP has been sent to your email.'
        : r.message || 'Failed to resend OTP';
    });
  }
}
