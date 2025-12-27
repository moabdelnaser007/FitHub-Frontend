import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

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
  statusMessage = '';
  errorMessage = '';
  email = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((qp) => {
      if (qp['email']) {
        this.email = qp['email'];
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

    this.statusMessage = 'Your password has been reset successfully.';
    // optionally navigate to login after a short delay
    setTimeout(() => this.router.navigate(['/login']), 1200);
  }
}
