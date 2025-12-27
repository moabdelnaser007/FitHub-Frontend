import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface BranchData {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  website: string;
  email: string;
}

interface OperatingHours {
  opening: string;
  closing: string;
}

interface WeekDay {
  label: string;
  value: string;
  selected: boolean;
}

interface Amenity {
  name: string;
  selected: boolean;
}

@Component({
  selector: 'app-edit-branch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-branch.component.html',
  styleUrls: ['./edit-branch.component.css']
})
export class EditBranchComponent implements OnInit {
  
  branchId: string = '';
  userName: string = 'John Doe';
  
  branchData: BranchData = {
    name: 'Downtown Fitness Hub',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'Anytown',
    country: 'USA',
    website: 'https://downtownfitness.fithub.com',
    email: 'contact@downtownfitness.com'
  };

  businessLicense: string = 'business_license_2024.pdf';

  operatingHours: OperatingHours = {
    opening: '6:00 AM',
    closing: '10:00 PM'
  };

  weekDays: WeekDay[] = [
    { label: 'Sun', value: 'sunday', selected: false },
    { label: 'Mon', value: 'monday', selected: true },
    { label: 'Tue', value: 'tuesday', selected: true },
    { label: 'Wed', value: 'wednesday', selected: true },
    { label: 'Thu', value: 'thursday', selected: true },
    { label: 'Fri', value: 'friday', selected: true },
    { label: 'Sat', value: 'saturday', selected: false }
  ];

  amenities: Amenity[] = [
    { name: 'Free Weights', selected: true },
    { name: 'Swimming Pool', selected: false },
    { name: 'Group Classes', selected: true },
    { name: 'Yoga Studio', selected: false },
    { name: 'Showers & Lockers', selected: true },
    { name: 'Parking', selected: true }
  ];

  branchStatus: string = 'active';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // استقبال الـ ID من الـ URL إذا كان موجود
    this.branchId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.branchId) {
      // هنا تحمل بيانات الفرع من الـ API
      this.loadBranchData(this.branchId);
    }
  }

  loadBranchData(id: string): void {
    // هنا تستدعي الـ API لجلب بيانات الفرع
    console.log('Loading branch data for ID:', id);
    
    // مثال:
    // this.branchService.getBranchById(id).subscribe(data => {
    //   this.branchData = data.branchData;
    //   this.operatingHours = data.operatingHours;
    //   this.weekDays = data.weekDays;
    //   this.amenities = data.amenities;
    //   this.branchStatus = data.status;
    //   this.businessLicense = data.businessLicense;
    // });
  }

  toggleDay(day: WeekDay): void {
    day.selected = !day.selected;
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      // هنا تضيف منطق رفع الملف
      // this.uploadFile(file);
    }
  }

  onReplaceDocument(): void {
    console.log('Replace document clicked');
    // هنا تفتح نافذة اختيار الملف
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  }

  onCancel(): void {
    // الرجوع للصفحة السابقة
    this.router.navigate(['/branches']);
  }

  onSaveChanges(): void {
    // جمع كل البيانات
    const branchUpdateData = {
      id: this.branchId,
      branchData: this.branchData,
      operatingHours: this.operatingHours,
      workingDays: this.weekDays.filter(day => day.selected).map(day => day.value),
      amenities: this.amenities.filter(amenity => amenity.selected).map(amenity => amenity.name),
      status: this.branchStatus
    };

    console.log('Saving branch data:', branchUpdateData);

    // هنا ترسل البيانات للـ API
    // this.branchService.updateBranch(branchUpdateData).subscribe(
    //   response => {
    //     console.log('Branch updated successfully:', response);
    //     alert('Branch details updated successfully!');
    //     this.router.navigate(['/branches']);
    //   },
    //   error => {
    //     console.error('Error updating branch:', error);
    //     alert('Failed to update branch details. Please try again.');
    //   }
    // );

    // للتجربة فقط
    alert('Branch details saved successfully!');
  }

  // دوال إضافية يمكن استخدامها

  private uploadFile(file: File): void {
    // منطق رفع الملف للسيرفر
    const formData = new FormData();
    formData.append('file', file);
    
    // this.branchService.uploadDocument(formData).subscribe(
    //   response => {
    //     console.log('File uploaded:', response);
    //   },
    //   error => {
    //     console.error('Upload error:', error);
    //   }
    // );
  }

  validateForm(): boolean {
    // التحقق من صحة البيانات قبل الحفظ
    if (!this.branchData.name || !this.branchData.phone) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  }
}