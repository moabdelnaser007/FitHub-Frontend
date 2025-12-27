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

  constructor(private authService: AuthService, private router: Router) {}

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
        console.log('✅ Login successful! Token returned:', token);
        console.log('✅ Token in localStorage:', localStorage.getItem('fitHubToken'));
        console.log('✅ isLoggedIn():', this.authService.isLoggedIn());

        this.isLoading = false;
        this.router.navigate(['/']);
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
