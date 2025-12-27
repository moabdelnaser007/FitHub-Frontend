import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterUserDto } from '../../../../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  fullName = '';
  email = '';
  phone = '';
  city = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirm = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  submit(form: NgForm) {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    const dto: RegisterUserDto = {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      city: this.city,
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    this.isLoading = true;

    this.auth.registerUser(dto).subscribe({
      next: (response) => {
        this.isLoading = false;
        // Use message from API response if available
        this.successMessage = 'Account created successfully! Redirecting to login...';

        setTimeout(() => this.router.navigate(['/login']), 1500);
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
          this.errorMessage = 'Registration failed. Please try again.';
        }

        console.error('❌ Register error:', this.errorMessage);
        console.error('❌ Full error object:', JSON.stringify(err, null, 2));
      },
    });
  }
}
