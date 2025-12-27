// manage-gyms.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService, Branch } from '../../../../services/admin-branches.service';

interface Gym {
  id: string;
  name: string;
  owner: string;
  location: string;
  phone: string;
  address: string;
  openTime: string;
  closeTime: string;
  genderType: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-gym-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-gyms.component.html',
  styleUrls: ['./manage-gyms.component.css']
})
export class ManageGymsComponent implements OnInit {
  gyms: Gym[] = [];
  filteredGyms: Gym[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  cityFilter: string = 'all';
  
  selectAll: boolean = false;
  
  // Loading & Error States
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Delete Modal
  showDeleteModal: boolean = false;
  gymToDelete: Gym | null = null;
  isDeleting: boolean = false;

  constructor(
    private router: Router,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    this.loadGyms();
  }

  // Load Gyms from API
  loadGyms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.branchService.getAllBranches().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.gyms = response.data.map(branch => this.mapBranchToGym(branch));
          this.totalItems = this.gyms.length;
          this.applyFilters();
          this.isLoading = false;
        } else {
          this.errorMessage = response.message || 'Failed to load gyms';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading gyms:', error);
        this.errorMessage = 'Failed to connect to server. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // Map Branch data to Gym interface
  private mapBranchToGym(branch: Branch): Gym {
    return {
      id: branch.id.toString(),
      name: branch.branchName,
      owner: `Owner #${branch.ownerId}`,
      location: branch.city,
      phone: branch.phone,
      address: branch.address,
      openTime: branch.openTime,
      closeTime: branch.closeTime,
      genderType: branch.genderType,
      status: branch.status === 'ACTIVE' ? 'Active' : 'Inactive',
      isActive: branch.status === 'ACTIVE',
      isSelected: false
    };
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1;
    this.applyFilters();
  }

  onCityFilterChange(city: string): void {
    this.cityFilter = city;
    this.currentPage = 1;
    this.applyFilters();
  }

  get uniqueCities(): string[] {
    const cities = [...new Set(this.gyms.map(gym => gym.location))];
    return cities;
  }

  get statusOptions(): string[] {
    return ['all', 'active', 'inactive'];
  }

  applyFilters(): void {
    this.filteredGyms = this.gyms.filter(gym => {
      const matchesSearch = 
        gym.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        gym.owner.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        gym.location.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesStatus = this.statusFilter === 'all' || 
                           gym.status.toLowerCase() === this.statusFilter.toLowerCase();
      
      const matchesCity = this.cityFilter === 'all' || 
                         gym.location.toLowerCase() === this.cityFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesCity;
    });

    this.totalItems = this.filteredGyms.length;
  }

  onToggleSelectAll(): void {
    this.paginatedGyms.forEach(gym => gym.isSelected = this.selectAll);
  }

  onToggleGymSelect(gym: Gym): void {
    this.selectAll = this.paginatedGyms.every(g => g.isSelected);
  }

  onToggleStatus(gym: Gym): void {
    const branchId = parseInt(gym.id);
    const apiCall = gym.isActive 
      ? this.branchService.suspendBranch(branchId)
      : this.branchService.resumeBranch(branchId);

    apiCall.subscribe({
      next: (response) => {
        if (response.isSuccess) {
          gym.isActive = !gym.isActive;
          gym.status = gym.isActive ? 'Active' : 'Inactive';
          console.log(`Branch ${gym.name} status updated successfully`);
        } else {
          console.error('Failed to update status:', response.message);
          alert(`Failed to update status: ${response.message}`);
        }
      },
      error: (error) => {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
      }
    });
  }

  onViewGym(gym: Gym): void {
    console.log('View gym:', gym);
    this.router.navigate(['/admin/gym-details', gym.id]);
  }

  onEditGym(gym: Gym): void {
    console.log('Edit gym:', gym);
    this.router.navigate(['/admin/edit-gym', gym.id]);
  }

  onDeleteGym(gym: Gym): void {
    this.gymToDelete = gym;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.gymToDelete) return;
    
    this.isDeleting = true;
    const branchId = parseInt(this.gymToDelete.id);
    
    // استخدام Suspend بدلاً من Delete (لأن مفيش Delete API)
    this.branchService.suspendBranch(branchId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          // إزالة من القائمة المحلية
          this.gyms = this.gyms.filter(g => g.id !== this.gymToDelete!.id);
          this.applyFilters();
          console.log('Branch suspended successfully');
        } else {
          alert(`Failed to suspend branch: ${response.message}`);
        }
        this.isDeleting = false;
        this.closeDeleteModal();
      },
      error: (error) => {
        console.error('Error suspending branch:', error);
        alert('Failed to suspend branch. Please try again.');
        this.isDeleting = false;
        this.closeDeleteModal();
      }
    });
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.gymToDelete = null;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const maxPages = 5;
    const half = Math.floor(maxPages / 2);
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxPages - 1);
    
    if (end - start < maxPages - 1) {
      start = Math.max(1, end - maxPages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Get paginated gyms for current page
  get paginatedGyms(): Gym[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredGyms.slice(startIndex, endIndex);
  }

  // Math object for template
  Math = Math;

  // Retry loading gyms
  retryLoad(): void {
    this.loadGyms();
  }

  // Get selected gyms count
  get selectedCount(): number {
    return this.gyms.filter(g => g.isSelected).length;
  }

  // Bulk actions (optional)
  bulkSuspend(): void {
    const selectedGyms = this.gyms.filter(g => g.isSelected);
    if (selectedGyms.length === 0) {
      alert('Please select at least one gym');
      return;
    }

    if (confirm(`Are you sure you want to suspend ${selectedGyms.length} gym(s)?`)) {
      selectedGyms.forEach(gym => {
        const branchId = parseInt(gym.id);
        this.branchService.suspendBranch(branchId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              gym.isActive = false;
              gym.status = 'Inactive';
              gym.isSelected = false;
            }
          },
          error: (error) => console.error('Error suspending gym:', error)
        });
      });
    }
  }

  bulkResume(): void {
    const selectedGyms = this.gyms.filter(g => g.isSelected);
    if (selectedGyms.length === 0) {
      alert('Please select at least one gym');
      return;
    }

    if (confirm(`Are you sure you want to resume ${selectedGyms.length} gym(s)?`)) {
      selectedGyms.forEach(gym => {
        const branchId = parseInt(gym.id);
        this.branchService.resumeBranch(branchId).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              gym.isActive = true;
              gym.status = 'Active';
              gym.isSelected = false;
            }
          },
          error: (error) => console.error('Error resuming gym:', error)
        });
      });
    }
  }
}