import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, UserViewModel } from '../../../../services/users.service'; // عدّلي المسار

interface UserDetails {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  joinDate: string;
  numberOfBookings: number;
  lastLogin: string;
  membership: string;
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  userId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';
  
  user: UserDetails = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    status: 'Active',
    joinDate: '',
    numberOfBookings: 0,
    lastLogin: '',
    membership: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    console.log('🔍 Loading user with ID:', this.userId);
    
    // ✅ جرّب تجيب البيانات من localStorage الأول
    const savedUserData = localStorage.getItem('viewUserData');
    
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        
        // تأكد إن الـ ID مطابق
        if (userData.id === Number(this.userId)) {
          this.user = this.mapToUserDetails(userData);
          this.isLoading = false;
          console.log('✅ Loaded user data from localStorage:', userData);
          
          // امسح البيانات بعد ما استخدمتها
          localStorage.removeItem('viewUserData');
          return;
        }
      } catch (e) {
        console.error('Error parsing saved user data:', e);
      }
    }
    
    // لو مفيش بيانات محفوظة، اجلبها من الـ API
    console.log('⚠️ No saved data found, loading from API...');
    this.loadUserData(this.userId);
  }

  loadUserData(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // استخدام GetAllUsers وفلترة اليوزر المطلوب
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        const userData = users.find(user => user.id === Number(id));
        
        if (userData) {
          this.user = this.mapToUserDetails(userData);
          console.log('✅ Loaded user data from API:', userData);
        } else {
          this.errorMessage = 'User not found';
          alert('User not found!');
          this.router.navigate(['/admin/manage-users']);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading user:', error);
        this.errorMessage = error.message || 'Failed to load user data';
        alert(this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  // ✅ تحويل UserViewModel إلى UserDetails
  private mapToUserDetails(userData: UserViewModel): UserDetails {
    return {
      id: userData.id.toString(),
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      location: userData.city || 'N/A',
      role: userData.role,
      status: userData.status,
      joinDate: this.formatDate(userData.createdAt),
      numberOfBookings: 0, // لو في API للـ bookings، استخدميه
      lastLogin: 'N/A', // لو في API للـ last login، استخدميه
      membership: 'N/A' // لو في API للـ membership، استخدميه
    };
  }

  // ✅ تنسيق التاريخ
  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'status-active',
      'Inactive': 'status-inactive',
      'Suspended': 'status-suspended'
    };
    return classes[status] || '';
  }

  onEditUser(): void {
    console.log('🚀 Navigate to edit user:', this.userId);
    
    // احفظ البيانات في localStorage قبل الانتقال
    const userToEdit = {
      id: Number(this.user.id),
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone,
      city: this.user.location,
      role: this.user.role,
      status: this.user.status,
      isActive: this.user.status === 'Active',
      createdAt: this.user.joinDate
    };
    
    localStorage.setItem('editUserData', JSON.stringify(userToEdit));
    this.router.navigate(['/admin/edit-user', this.userId]);
  }

  onDeleteUser(): void {
    if (confirm(`Are you sure you want to delete ${this.user.fullName}?`)) {
      console.log('🗑️ Delete user:', this.userId);
      
      this.usersService.deleteUser(Number(this.userId)).subscribe({
        next: (response) => {
          console.log('✅ User deleted successfully:', response);
          alert('User deleted successfully!');
          this.router.navigate(['/admin/manage-users']);
        },
        error: (error) => {
          console.error('❌ Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  onBackToList(): void {
    this.router.navigate(['/admin/manage-users']);
  }
}