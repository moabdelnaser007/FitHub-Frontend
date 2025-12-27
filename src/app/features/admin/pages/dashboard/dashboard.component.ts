// dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GymOwnersService, PendingOwner } from '../../../../services/gym-owners.service';
import { forkJoin } from 'rxjs';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'warning';
  isLoading?: boolean;
}

interface PendingGym {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  commercialRegNumber: string;
  status: string;
  appliedDate: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  isSidebarOpen = true;
  isLoading = false;
  loadError = '';
  
  stats: StatCard[] = [
    {
      title: 'Total Users',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      isLoading: true
    },
    {
      title: 'Active Gyms',
      value: '0',
      change: '+0%',
      changeType: 'positive',
      isLoading: true
    },
    {
      title: 'Monthly Revenue',
      value: '$0',
      change: '+0%',
      changeType: 'positive',
      isLoading: false
    },
    {
      title: 'Pending Gym Owners',
      value: '0',
      change: 'Action Required',
      changeType: 'warning',
      isLoading: true
    }
  ];

  pendingGyms: PendingGym[] = [];

  constructor(
    private router: Router,
    private gymOwnersService: GymOwnersService
  ) {}

  ngOnInit(): void {
    this.loadAllDashboardData();
  }

  // ✅ تحميل كل بيانات الـ Dashboard دفعة واحدة
  loadAllDashboardData(): void {
    this.isLoading = true;
    this.loadError = '';

    // تحميل كل البيانات بالتوازي
    forkJoin({
      users: this.gymOwnersService.getTotalUsers(),
      gyms: this.gymOwnersService.getActiveGymsCount(),
      pendingOwners: this.gymOwnersService.getPendingOwners()
    }).subscribe({
      next: (results) => {
        // ✅ تحديث Total Users
        this.stats[0].value = results.users.toString();
        this.stats[0].isLoading = false;
        console.log('✅ Total Users:', results.users);

        // ✅ تحديث Active Gyms
        this.stats[1].value = results.gyms.toString();
        this.stats[1].isLoading = false;
        console.log('✅ Active Gyms:', results.gyms);

        // ✅ تحديث Pending Gym Owners
        this.pendingGyms = results.pendingOwners.map(owner => ({
          id: owner.id.toString(),
          name: owner.fullName,
          owner: owner.fullName,
          email: owner.email,
          phone: owner.phone,
          location: owner.city,
          commercialRegNumber: owner.commercialRegistrationNumber,
          status: 'Pending',
          appliedDate: this.formatDate(owner.createdAt)
        }));

        this.stats[3].value = this.pendingGyms.length.toString();
        this.stats[3].isLoading = false;
        console.log('✅ Pending Gym Owners:', this.pendingGyms.length);

        this.isLoading = false;
      },
      error: (error) => {
        this.loadError = error.message || 'Failed to load dashboard data. Please try again.';
        console.error('❌ Error loading dashboard data:', error);
        this.isLoading = false;
        
        // إيقاف loading للـ stats
        this.stats.forEach(stat => stat.isLoading = false);
      }
    });
  }

  // ✅ تحميل الـ Pending Gyms فقط (للاستخدام بعد Approve/Reject)
  loadPendingGyms(): void {
    this.gymOwnersService.getPendingOwners().subscribe({
      next: (owners: PendingOwner[]) => {
        this.pendingGyms = owners.map(owner => ({
          id: owner.id.toString(),
          name: owner.fullName,
          owner: owner.fullName,
          email: owner.email,
          phone: owner.phone,
          location: owner.city,
          commercialRegNumber: owner.commercialRegistrationNumber,
          status: 'Pending',
          appliedDate: this.formatDate(owner.createdAt)
        }));

        this.stats[3].value = this.pendingGyms.length.toString();
        console.log('✅ Pending gym owners reloaded:', this.pendingGyms);
      },
      error: (error) => {
        console.error('❌ Error reloading pending gym owners:', error);
      }
    });
  }

  // ✅ تنسيق التاريخ
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

 /* // ✅ عرض تفاصيل Gym Owner
  viewGym(gym: PendingGym): void {
    console.log('👁️ View gym owner:', gym);
    
    // عرض التفاصيل في Alert
    alert(`📋 Gym Owner Details:

Name: ${gym.owner}
Email: ${gym.email}
Phone: ${gym.phone}
City: ${gym.location}
Commercial Reg: ${gym.commercialRegNumber}
Applied: ${gym.appliedDate}`);
    
    // أو يمكنك التوجيه لصفحة التفاصيل
    // this.router.navigate(['/admin/gym-owner-details', gym.id]);
  }*/

  // ✅ قبول Gym Owner
  approveGym(gym: PendingGym): void {
    if (!confirm(`Are you sure you want to approve ${gym.owner}?`)) {
      return;
    }

    console.log('✅ Approving gym owner:', gym);

    this.gymOwnersService.approveOwner(Number(gym.id)).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          alert(`✅ ${gym.owner} has been approved successfully!`);
          
          // ✅ إزالة الـ Owner من القائمة
          this.pendingGyms = this.pendingGyms.filter(g => g.id !== gym.id);
          
          // ✅ تحديث العدد في الـ Stats
          this.stats[3].value = this.pendingGyms.length.toString();
          
          // ✅ تحديث عدد Active Gyms (لأن في gym جديد اتضاف)
          this.updateActiveGymsCount();
          
          console.log('✅ Gym owner approved successfully');
        } else {
          alert(`❌ ${response.message || 'Failed to approve gym owner'}`);
        }
      },
      error: (error) => {
        console.error('❌ Error approving gym owner:', error);
        alert(`❌ ${error.message || 'Failed to approve gym owner. Please try again.'}`);
      }
    });
  }

  // ✅ رفض Gym Owner
  denyGym(gym: PendingGym): void {
    if (!confirm(`Are you sure you want to reject ${gym.owner}?`)) {
      return;
    }

    console.log('❌ Rejecting gym owner:', gym);

    this.gymOwnersService.rejectOwner(Number(gym.id)).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          alert(`✅ ${gym.owner} has been rejected.`);
          
          // ✅ إزالة الـ Owner من القائمة
          this.pendingGyms = this.pendingGyms.filter(g => g.id !== gym.id);
          
          // ✅ تحديث العدد في الـ Stats
          this.stats[3].value = this.pendingGyms.length.toString();
          
          console.log('✅ Gym owner rejected successfully');
        } else {
          alert(`❌ ${response.message || 'Failed to reject gym owner'}`);
        }
      },
      error: (error) => {
        console.error('❌ Error rejecting gym owner:', error);
        alert(`❌ ${error.message || 'Failed to reject gym owner. Please try again.'}`);
      }
    });
  }

  // ✅ تحديث عدد Active Gyms بعد الـ Approve
  updateActiveGymsCount(): void {
    this.gymOwnersService.getActiveGymsCount().subscribe({
      next: (count) => {
        this.stats[1].value = count.toString();
        console.log('✅ Active gyms count updated:', count);
      },
      error: (error) => {
        console.error('❌ Error updating active gyms count:', error);
      }
    });
  }

  // ✅ إعادة تحميل كل البيانات
  retryLoad(): void {
    this.loadAllDashboardData();
  }

  generateReport(): void {
    console.log('📊 Generate report');
    alert('Report generation feature coming soon!');
  }

  logout(): void {
    console.log('🚪 Logout');
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('fitHubToken');
      this.router.navigate(['/login']);
    }
  }
}