import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, UpdateUserRequest } from '../../../../services/users.service'; // عدّلي المسار حسب مشروعك

interface UserForm {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-user-details.component.html',
  styleUrls: ['./edit-user-details.component.css']
})
export class EditUserComponent implements OnInit {
  userId: string = '';
  isLoading: boolean = true;
  isSaving: boolean = false;
  errorMessage: string = '';
  
  user: UserForm = {
    id: '',
    fullName: '',
    email: '',
    phone: '',
    city: '',
    role: 'Normal User',
    status: 'Active'
  };

  roles = ['Normal User', 'Gym Owner', 'Admin'];
  statuses = ['Active', 'Inactive', 'Suspended'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService // ✅ حقن الـ Service
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id'];
    console.log('🔍 Editing user with ID:', this.userId);
    
    // ✅ جرّب تجيب البيانات من localStorage الأول
    const savedUserData = localStorage.getItem('editUserData');
    
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        
        // تأكد إن الـ ID مطابق
        if (userData.id === Number(this.userId)) {
          this.user = {
            id: userData.id.toString(),
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            city: userData.city || '',
            role: userData.role,
            status: userData.status
          };
          this.isLoading = false;
          console.log('✅ Loaded user data from localStorage:', userData);
          
          // امسح البيانات بعد ما استخدمتها
          localStorage.removeItem('editUserData');
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

  // ✅ تحميل بيانات المستخدم من الـ API
  loadUserData(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    // استخدام GetAllUsers وفلترة اليوزر المطلوب
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        const userData = users.find(user => user.id === Number(id));
        
        if (userData) {
          this.user = {
            id: userData.id.toString(),
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            city: userData.city || '',
            role: userData.role,
            status: userData.status
          };
          console.log('Loaded user data for editing:', userData);
        } else {
          this.errorMessage = 'User not found';
          alert('User not found!');
          this.router.navigate(['/admin/manage-users']);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = error.message || 'Failed to load user data';
        alert(this.errorMessage);
        this.isLoading = false;
      }
    });
  }

  // ✅ حفظ التعديلات
  onSave(): void {
    // Validation بسيطة
    if (!this.user.fullName || !this.user.email || !this.user.phone) {
      alert('Please fill in all required fields');
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    
    const updateData: UpdateUserRequest = {
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone,
      city: this.user.city,
      role: this.user.role,
      status: this.user.status
    };

    console.log('Saving user:', updateData);
    
    this.usersService.updateUser(Number(this.userId), updateData).subscribe({
      next: (response) => {
        console.log('Update response:', response);
        
        if (response.isSuccess) {
          alert('User updated successfully!');
          this.router.navigate(['/admin/user-details', this.userId]);
        } else {
          this.errorMessage = response.message || 'Failed to update user';
          alert(this.errorMessage);
        }
        
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.errorMessage = error.message || 'An error occurred while updating the user';
        alert(this.errorMessage);
        this.isSaving = false;
      }
    });
  }

  onCancel(): void {
    if (confirm('Discard changes?')) {
      this.router.navigate(['/admin/user-details', this.userId]);
    }
  }

  // ✅ Helper function لعرض الـ Errors في الـ Template
  hasError(): boolean {
    return this.errorMessage !== '';
  }
}