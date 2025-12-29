import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, UserProfileDto } from '../../../../services/user.service';

@Component({
  selector: 'app-staff-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-page">
      <div class="admin-page-header">
        <h1>My Profile</h1>
        <p>Manage your account settings.</p>
      </div>

      <div *ngIf="user" class="profile-card">
        <div class="profile-header">
          <div class="header-left">
            <div class="avatar-circle">{{ user.fullName.charAt(0) }}</div>
            <div class="info">
              <h2>{{ user.fullName }}</h2>
              <span class="role-badge">Staff</span>
            </div>
          </div>
          <button class="edit-btn" (click)="toggleEdit()" *ngIf="!isEditing">
            <span class="material-symbols-outlined">edit</span> Edit
          </button>
        </div>
        
        <!-- View Mode -->
        <div class="details-grid" *ngIf="!isEditing">
          <div class="detail-item">
            <label>Email</label>
            <p>{{ user.email }}</p>
          </div>
          <div class="detail-item">
            <label>Phone</label>
            <p>{{ user.phone }}</p>
          </div>
          <div class="detail-item">
            <label>City</label>
            <p>{{ user.city }}</p>
          </div>
          <div class="detail-item">
            <label>Status</label>
            <p>{{ user.status }}</p>
          </div>
           <div class="detail-item" *ngIf="user.branchId">
            <label>Branch ID</label>
            <p>#{{ user.branchId }}</p>
          </div>
        </div>

        <!-- Edit Mode -->
        <div class="edit-form" *ngIf="isEditing">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="editData.fullName" placeholder="Full Name">
            </div>
            <div class="form-group">
                <label>Phone</label>
                <input type="text" [(ngModel)]="editData.phone" placeholder="Phone Number">
            </div>
            <div class="form-group">
                <label>City</label>
                <input type="text" [(ngModel)]="editData.city" placeholder="City">
            </div>
            
            <div class="actions">
                <button class="cancel-btn" (click)="toggleEdit()">Cancel</button>
                <button class="save-btn" (click)="saveProfile()" [disabled]="isSaving">
                    {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
            </div>
        </div>

      </div>
      
      <div *ngIf="!user && !isLoading" class="error-msg">Failed to load profile.</div>
    </div>
  `,
  styles: [`
    .profile-card {
      background: white;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      max-width: 600px;
      margin: 0 auto; /* Center the card */
    }
    .profile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .header-left {
        display: flex;
        align-items: center;
        gap: 24px;
    }
    .avatar-circle {
      width: 80px;
      height: 80px;
      background: #0b1120;
      color: white;
      font-size: 32px;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .role-badge {
      background: #eff6ff;
      color: #2563eb;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .detail-item label {
      display: block;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    .detail-item p {
      font-weight: 500;
      color: #111827;
      margin: 0;
    }
    .edit-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: 1px solid #e5e7eb;
        padding: 8px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }
    .edit-btn:hover { background: #f9fafb; }
    
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 14px; margin-bottom: 8px; font-weight: 500; }
    .form-group input { width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; box-sizing: border-box; }
    
    .actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .cancel-btn { padding: 10px 20px; background: white; border: 1px solid #d1d5db; border-radius: 8px; cursor: pointer; }
    .save-btn { padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 8px; cursor: pointer; }
    .save-btn:disabled { opacity: 0.7; }

    .admin-page-header h1 { margin: 0 0 8px 0; font-size: 24px; }
    .admin-page-header p { margin: 0 0 24px 0; color: #6b7280; }
  `]
})
export class StaffProfileComponent implements OnInit {
  user: UserProfileDto | null = null;
  editData: any = {};
  isLoading = true;
  isEditing = false;
  isSaving = false;

  constructor(private userService: UserService) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getMe().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.user = res.data;
          this.resetEditData();
        }
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  resetEditData() {
    if (this.user) {
      this.editData = { ...this.user };
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.resetEditData();
  }

  saveProfile() {
    if (!this.user) return;
    this.isSaving = true;

    const updateDto = {
      fullName: this.editData.fullName,
      email: this.user.email, // Keep email same
      phone: this.editData.phone,
      city: this.editData.city
    };

    this.userService.updateMe(updateDto).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res.isSuccess) {
          this.isEditing = false;
          this.loadProfile(); // Reload to confirm
        } else {
          alert('Update failed: ' + res.message);
        }
      },
      error: () => {
        this.isSaving = false;
        alert('An error occurred while updating profile.');
      }
    });
  }
}
