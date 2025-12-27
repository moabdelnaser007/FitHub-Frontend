import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UsersService, User, UpdateUserRequest } from '../../../../services/users.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  errorMessage = '';
  showSidebarMenu = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('📥 Loading user profile...');

    this.usersService.getMe().subscribe({
      next: (response) => {
        console.log('✅ Profile loaded successfully:', response);
        if (response.isSuccess && response.data) {
          this.currentUser = response.data;
          this.initializeForm(response.data);
          this.isLoading = false;
        } else {
          this.errorMessage = response.message || 'Failed to load profile';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading profile:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
        });
        this.errorMessage = 'Failed to load user profile. Please try again.';
        this.isLoading = false;
        // Initialize form with empty values on error
        this.initializeForm({
          id: 0,
          fullName: '',
          email: '',
          phone: '',
          city: '',
          status: 'Active',
          role: 'User',
          createdAt: '',
        });
      },
    });
  }

  private initializeForm(userData: User): void {
    this.profileForm = this.fb.group({
      fullName: [userData.fullName || '', Validators.required],
      email: [
        { value: userData.email || '', disabled: true },
        [Validators.required, Validators.email],
      ],
      phone: [userData.phone || '', Validators.required],
      city: [userData.city || '', Validators.required],
    });
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formValue = this.profileForm.getRawValue();
    const payload: UpdateUserRequest = {
      fullName: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      city: formValue.city,
      role: this.currentUser?.role || 'User',
      status: this.currentUser?.status || 'Active',
    };

    this.usersService.updateMe(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.isSuccess) {
          alert('Profile updated successfully!');
          this.loadUserProfile(); // Reload to get updated data
        } else {
          this.errorMessage = response.message || 'Failed to update profile';
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating profile:', error);
        this.errorMessage = error.message || 'Failed to update profile. Please try again.';
      },
    });
  }

  onCancel(): void {
    // Reset to current user data
    if (this.currentUser) {
      this.initializeForm(this.currentUser);
    }
    console.log('Profile changes cancelled');
  }

  goToRecharge(): void {
    this.router.navigate(['/choose-plan-payment']);
  }

  logout(): void {
    // Clear authentication data
    localStorage.removeItem('fitHubToken');
    localStorage.removeItem('fitHubUser');

    // Navigate to login page
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return 'U';
    const names = this.currentUser.fullName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  }
}
