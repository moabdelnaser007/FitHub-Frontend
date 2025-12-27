import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchService, BranchData } from '../../../../services/branch.service';

interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  openTime: string;
  closeTime: string;
  genderType: string;
  status: 'active' | 'inactive' | 'pending';
}

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-branches.component.html',
  styleUrls: ['./manage-branches.component.css']
})
export class BranchesComponent implements OnInit {
  
  searchQuery: string = '';
  currentFilter: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  isLoading: boolean = false;
  loadError: string | null = null;

  // للـ Delete Modal
  showDeleteModal: boolean = false;
  branchToDelete: Branch | null = null;
  isDeleting: boolean = false;

  constructor(
    private branchService: BranchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.loadError = null;

    this.branchService.getAllBranches().subscribe({
      next: (data: BranchData[]) => {
        console.log('🔍 Branches data from API:', data);
        
        this.branches = data.map((branch) => ({
          id: branch.id, // ✅ استخدام الـ ID الحقيقي من الـ API
          name: branch.branchName,
          address: branch.address,
          city: branch.city,
          phone: branch.phone,
          openTime: branch.openTime,
          closeTime: branch.closeTime,
          genderType: branch.genderType,
          status: this.mapStatus(branch.status)
        }));

        console.log('✅ Mapped branches with IDs:', this.branches);

        this.totalPages = Math.ceil(this.branches.length / this.itemsPerPage);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading branches:', error);
        this.loadError = 'Failed to load branches. Please try again.';
        this.isLoading = false;
      }
    });
  }

  mapStatus(status: string): 'active' | 'inactive' | 'pending' {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'active';
    if (statusLower === 'inactive') return 'inactive';
    return 'pending';
  }

  retryLoad(): void {
    this.loadBranches();
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.branches];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(branch => 
        branch.name.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query) ||
        branch.city.toLowerCase().includes(query)
      );
    }

    if (this.currentFilter !== 'all') {
      result = result.filter(branch => branch.status === this.currentFilter);
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredBranches = result.slice(startIndex, endIndex);
    
    this.totalPages = Math.ceil(result.length / this.itemsPerPage);
  }

  addNewBranch(): void {
    console.log('➕ Add new branch clicked');
    this.router.navigate(['/gym-owner/add-branch']);
  }

  viewBranch(branch: Branch): void {
    console.log('👁️ Viewing branch:', branch);
    console.log('👁️ Branch ID:', branch.id);
    this.router.navigate(['/gym-owner/branch-details', branch.id]);
  }

  editBranch(branch: Branch): void {
    console.log('✏️ Edit branch:', branch);
    this.router.navigate(['/gym-owner/edit-branch', branch.id]);
  }

  deleteBranch(branch: Branch): void {
    this.branchToDelete = branch;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    if (!this.isDeleting) {
      this.showDeleteModal = false;
      this.branchToDelete = null;
    }
  }

  confirmDelete(): void {
    if (!this.branchToDelete) return;

    this.isDeleting = true;
    const branchId = this.branchToDelete.id;
    const branchName = this.branchToDelete.name;

    console.log('🗑️ Deleting branch ID:', branchId);
    
    this.branchService.deleteBranch(branchId).subscribe({
      next: (success) => {
        console.log('✅ Delete response:', success);
        
        if (success) {
          this.branches = this.branches.filter(b => b.id !== branchId);
          this.applyFilters();
          this.showDeleteModal = false;
          this.branchToDelete = null;
          this.isDeleting = false;
          alert(`"${branchName}" has been deleted successfully!`);
        } else {
          this.isDeleting = false;
          alert('Failed to delete branch. Please try again.');
        }
      },
      error: (error) => {
        console.error('❌ Error deleting branch:', error);
        this.isDeleting = false;
        alert('Failed to delete branch. Please try again.\n' + error.message);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }
}