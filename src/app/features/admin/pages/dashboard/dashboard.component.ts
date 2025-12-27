import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GymOwnersService, PendingOwner } from '../../../../services/gym-owners.service'; // عدّلي المسار

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'warning';
}

interface PendingGym {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: string;
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
      changeType: 'positive'
    },
    {
      title: 'Active Gyms',
      value: '0',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Monthly Revenue',
      value: '$0',
      change: '+0%',
      changeType: 'positive'
    },
    {
      title: 'Pending Gyms',
      value: '0',
      change: 'Action Required',
      changeType: 'warning'
    }
  ];

  pendingGyms: PendingGym[] = [];

  constructor(
    private router: Router,
    private gymOwnersService: GymOwnersService
  ) {}

  ngOnInit(): void {
    this.loadPendingGyms();
  }

  // ✅ تحميل الـ Pending Gyms من الـ API
  loadPendingGyms(): void {
    this.isLoading = true;
    this.loadError = '';

    this.gymOwnersService.getPendingOwners().subscribe({
      next: (owners) => {
        // تحويل البيانات من PendingOwner إلى PendingGym
        this.pendingGyms = owners.map(owner => ({
          id: owner.id.toString(),
          name: owner.gymName || 'N/A',
          owner: owner.fullName,
          location: owner.gymLocation || 'N/A',
          status: owner.status || 'Pending'
        }));

        // تحديث عدد Pending Gyms في الـ Stats
        this.stats[3].value = this.pendingGyms.length.toString();
        
        console.log('✅ Pending gyms loaded:', this.pendingGyms);
        this.isLoading = false;
      },
      error: (error) => {
        this.loadError = 'Failed to load pending gym Owners. Please try again.';
        console.error('❌ Error loading pending gym Owners:', error);
        this.isLoading = false;
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  viewGym(gym: PendingGym): void {
    console.log('👁️ View gym:', gym);
    // لو عندك صفحة لعرض التفاصيل
    // this.router.navigate(['/admin/gym-owner-application', gym.id]);
    alert(`View details for: ${gym.name}\nOwner: ${gym.owner}\nLocation: ${gym.location}`);
  }

  // ✅ قبول Gym
  approveGym(gym: PendingGym): void {
    if (!confirm(`Are you sure you want to approve ${gym.name}?`)) {
      return;
    }

    console.log('✅ Approving gym:', gym);

    this.gymOwnersService.approveOwner(Number(gym.id)).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          alert(`${gym.name} has been approved successfully!`);
          
          // إزالة الـ Gym من القائمة
          this.pendingGyms = this.pendingGyms.filter(g => g.id !== gym.id);
          
          // تحديث العدد في الـ Stats
          this.stats[3].value = this.pendingGyms.length.toString();
          
          console.log('✅ gym Owner approved successfully');
        } else {
          alert(response.message || 'Failed to approve gym Owner');
        }
      },
      error: (error) => {
        console.error('❌ Error approving gym Owner:', error);
        alert('Failed to approve gym Owner. Please try again.');
      }
    });
  }

  // ✅ رفض Gym
  denyGym(gym: PendingGym): void {
    if (!confirm(`Are you sure you want to reject ${gym.name}?`)) {
      return;
    }

    console.log('❌ Rejecting gym Owners:', gym);

    this.gymOwnersService.rejectOwner(Number(gym.id)).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          alert(`${gym.name} has been rejected.`);
          
          // إزالة الـ Gym من القائمة
          this.pendingGyms = this.pendingGyms.filter(g => g.id !== gym.id);
          
          // تحديث العدد في الـ Stats
          this.stats[3].value = this.pendingGyms.length.toString();
          
          console.log('✅ gym Owner rejected successfully');
        } else {
          alert(response.message || 'Failed to reject gym Owner');
        }
      },
      error: (error) => {
        console.error('❌ Error rejecting gym Owner:', error);
        alert('Failed to reject gym Owners. Please try again.');
      }
    });
  }

  // ✅ إعادة تحميل البيانات
  retryLoad(): void {
    this.loadPendingGyms();
  }

  generateReport(): void {
    console.log('Generate report');
    // Add report generation logic
  }

  logout(): void {
    console.log('Logout');
    // Add logout logic
  }
}