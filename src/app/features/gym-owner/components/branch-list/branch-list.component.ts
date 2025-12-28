import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BranchService, BranchData } from '../../../../services/branch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchesListComponent implements OnInit {

  branches: (BranchData & { id: number })[] = [];
  filteredBranches: (BranchData & { id: number })[] = [];
  isLoading = true;
  loadError: string | null = null;

  searchText: string = '';
  showFilterMenu: boolean = false;
  selectedStatus: string | null = null;
  uniqueStatuses: string[] = ['Active', 'Inactive', 'Pending']; // Assuming these statuses

  constructor(private branchService: BranchService, private router: Router) {
    // Trigger rebuild
  }

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.loadError = null;

    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        // Assign temporary IDs and initialize filtered list
        this.branches = branches.map((b, index) => ({ ...b, id: index + 1 }));

        // Extract unique statuses dynamically if possible, or use defaults
        const statuses = [...new Set(this.branches.map(b => b.status))].filter(s => s);
        if (statuses.length > 0) {
          this.uniqueStatuses = statuses;
        }

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.loadError = error.message || 'Failed to load branches';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let result = [...this.branches];

    // Filter by Search Text (Name, City, Address)
    if (this.searchText.trim()) {
      const query = this.searchText.toLowerCase();
      result = result.filter(branch =>
        branch.branchName.toLowerCase().includes(query) ||
        branch.city.toLowerCase().includes(query) ||
        branch.address.toLowerCase().includes(query)
      );
    }

    // Filter by Status
    if (this.selectedStatus) {
      result = result.filter(branch => branch.status?.toLowerCase() === this.selectedStatus?.toLowerCase());
    }

    this.filteredBranches = result;
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilter(): void {
    this.showFilterMenu = !this.showFilterMenu;
  }

  selectStatusFilter(status: string | null): void {
    this.selectedStatus = status;
    this.showFilterMenu = false;
    this.applyFilters();
  }

  goToPlans(branchId: number): void {
    console.log('Navigating to branch plans:', branchId);
    this.router.navigate(['/gym-owner/subscription-plans', branchId]);
  }
}
