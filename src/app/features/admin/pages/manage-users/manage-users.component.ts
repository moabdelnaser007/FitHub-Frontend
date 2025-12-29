import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService, UserViewModel } from '../../../../services/users.service';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {
  users: UserViewModel[] = [];
  filteredUsers: UserViewModel[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  
  // Loading State
  isLoading: boolean = false;
  loadError: string = '';
  
  // Delete Modal
  showDeleteModal: boolean = false;
  userToDelete: UserViewModel | null = null;
  isDeleting: boolean = false;

  constructor(
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load users from API
   */
  loadUsers(): void {
    this.isLoading = true;
    this.loadError = '';

    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.isLoading = false;
        console.log('Users loaded successfully:', users);
      },
      error: (error) => {
        this.loadError = 'Failed to load users. Please try again.';
        this.isLoading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter(user => {
      // Search by email, name, or phone
      const searchLower = this.searchQuery.toLowerCase();
      const matchesSearch = 
        user.email.toLowerCase().includes(searchLower) ||
        user.fullName.toLowerCase().includes(searchLower) ||
        user.phone.includes(searchLower);
      
      // Filter by status
      const matchesStatus = this.statusFilter === 'all' || 
                           user.status.toLowerCase() === this.statusFilter.toLowerCase();
      
      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Toggle user status (Active/Inactive)
   */
  onToggleStatus(user: UserViewModel): void {
    if (user.status === 'Suspended') {
      return;
    }
    
    const newStatus = user.isActive ? 'Inactive' : 'Active';
    
    this.usersService.updateUserStatus(user.id, newStatus).subscribe({
      next: (response) => {
        user.isActive = !user.isActive;
        user.status = newStatus as 'Active' | 'Inactive' | 'Suspended';
        console.log('User status updated:', user);
      },
      error: (error) => {
        console.error('Error updating user status:', error);
        alert('Failed to update user status. Please try again.');
        // Revert toggle if API fails
        user.isActive = !user.isActive;
      }
    });
  }

  onViewUser(user: UserViewModel): void {
    console.log('👁️ Viewing user:', user);
    
    // احفظ بيانات اليوزر في localStorage قبل الانتقال
    localStorage.setItem('viewUserData', JSON.stringify(user));
    
    this.router.navigate(['/admin/user-details', user.id]);
  }

  // ✅ العبي هنا - احفظي البيانات في localStorage قبل الـ Navigation
  onEditUser(user: UserViewModel): void {
    console.log('🚀 Navigating to edit with user:', user);
    
    // حفظ بيانات اليوزر مؤقتاً في localStorage
    localStorage.setItem('editUserData', JSON.stringify(user));
    
    this.router.navigate(['/admin/edit-user', user.id]);
  }

  onDeleteUser(user: UserViewModel): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  /**
   * Confirm and delete user
   */
  confirmDelete(): void {
    if (!this.userToDelete) return;
    
    this.isDeleting = true;
    
    this.usersService.deleteUser(this.userToDelete.id).subscribe({
      next: (response) => {
        console.log('User deleted successfully:', response);
        
        // Remove user from local array
        this.users = this.users.filter(u => u.id !== this.userToDelete!.id);
        this.applyFilters();
        
        this.isDeleting = false;
        this.closeDeleteModal();
        
        // Show success message (optional)
        alert('User deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.isDeleting = false;
        alert('Failed to delete user. Please try again.');
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  onAddUser(): void {
    console.log('Add new user');
    this.router.navigate(['/auth/register']);
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'status-active',
      'Inactive': 'status-inactive',
      'Suspended': 'status-suspended'
    };
    return classes[status] || '';
  }

  /**
   * Retry loading users if failed
   */
  retryLoad(): void {
    this.loadUsers();
  }
}