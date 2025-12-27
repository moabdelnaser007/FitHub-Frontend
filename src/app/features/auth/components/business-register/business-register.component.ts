import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-business-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './business-register.component.html',
  styleUrls: ['./business-register.component.css'],
})
export class BusinessRegisterComponent {
  businessName = '';
  ownerName = '';
  email = '';
  phone = '';
  city = '';
  crn = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  constructor(private authService: AuthService, private router: Router) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  submit(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    if (form.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Passwords do not match.';
      return;
    }

    if (this.password.length < 6) {
      this.fieldErrors['password'] = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;

    const businessData = {
      fullName: this.ownerName,
      email: this.email,
      phone: this.phone,
      city: this.city,
      commercialRegistrationNumber: this.crn,
      password: this.password,
      confirmPassword: this.confirmPassword,
    };

    this.authService.registerBusiness(businessData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Owner registered. Await admin approval. Redirecting to login...';

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Business registration error:', error);

        // Handle field-specific errors from backend
        if (error.error && error.error.errors) {
          // ASP.NET Core validation errors format
          const errors = error.error.errors;
          Object.keys(errors).forEach((key) => {
            const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
            this.fieldErrors[fieldName] = errors[key][0];
          });
        } else if (error.error && error.error.message) {
          // Custom error message from backend
          this.errorMessage = error.error.message;
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }
}
