import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfileDto, UpdateProfileDto } from '../../../../services/user.service';

@Component({
    selector: 'app-admin-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class AdminProfileComponent implements OnInit {
    user: UserProfileDto | null = null;
    isLoading: boolean = true;
    error: string | null = null;

    // Edit Mode
    isEditing: boolean = false;
    isUpdating: boolean = false;
    updateError: string | null = null;

    editForm: UpdateProfileDto = {
        fullName: '',
        email: '',
        phone: '',
        city: ''
    };

    constructor(private userService: UserService) { }

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading = true;
        this.error = null;
        this.userService.getMe().subscribe({
            next: (response) => {
                if (response.isSuccess && response.data) {
                    this.user = response.data;
                } else {
                    this.error = response.message || 'Failed to load profile';
                }
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading profile:', err);
                this.error = 'Failed to load profile details.';
                this.isLoading = false;
            }
        });
    }

    enableEditMode(): void {
        if (this.user) {
            this.editForm = {
                fullName: this.user.fullName,
                email: this.user.email,
                phone: this.user.phone,
                city: this.user.city
            };
            this.updateError = null;
            this.isEditing = true;
        }
    }

    cancelEdit(): void {
        this.isEditing = false;
        this.updateError = null;
    }

    saveProfile(): void {
        this.isUpdating = true;
        this.updateError = null;

        this.userService.updateMe(this.editForm).subscribe({
            next: (response) => {
                if (response.isSuccess) {
                    this.isEditing = false;
                    this.loadProfile(); // Reload to show updated data
                    alert('Profile updated successfully!');
                } else {
                    this.updateError = response.message || 'Failed to update profile';
                }
                this.isUpdating = false;
            },
            error: (err) => {
                console.error('Error updating profile:', err);
                this.updateError = 'An error occurred while updating profile.';
                this.isUpdating = false;
            }
        });
    }
}
