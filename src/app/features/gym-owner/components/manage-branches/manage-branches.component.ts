import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Branch {
  id: number;
  name: string;
  address: string;
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
  totalPages: number = 3;

  branches: Branch[] = [
    {
      id: 1,
      name: 'Downtown Fitness Hub',
      address: '123 Main Street, Anytown, USA 12345',
      status: 'active'
    },
    {
      id: 2,
      name: 'Uptown Strength & Cardio',
      address: '456 Oak Avenue, Metropolis, USA 67890',
      status: 'active'
    },
    {
      id: 3,
      name: 'Westside Wellness Center',
      address: '789 Pine Lane, Suburbia, USA 54321',
      status: 'inactive'
    },
    {
      id: 4,
      name: 'Eastend Athletic Club',
      address: '101 Maple Drive, Rivertown, USA 11223',
      status: 'pending'
    }
  ];

  filteredBranches: Branch[] = [];

  ngOnInit(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.branches];

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(branch => 
        branch.name.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.currentFilter !== 'all') {
      result = result.filter(branch => branch.status === this.currentFilter);
    }

    this.filteredBranches = result;
  }

  addNewBranch(): void {
    console.log('Add new branch clicked');
    // Add navigation or modal logic here
  }

  viewBranch(branch: Branch): void {
    console.log('View branch:', branch);
    // Add view logic here
  }

  editBranch(branch: Branch): void {
    console.log('Edit branch:', branch);
    // Add edit logic here
  }

  deleteBranch(branch: Branch): void {
    if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
      console.log('Delete branch:', branch);
      // Add delete logic here
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      console.log('Navigate to page:', page);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getStatusClass(status: string): string {
    return status;
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}