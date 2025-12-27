import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchService, BranchData } from '../../../../services/branch.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css']
})
export class BranchesListComponent implements OnInit {

  branches: (BranchData & { id: number })[] = [];
  isLoading = true;
  loadError: string | null = null;

  constructor(private branchService: BranchService, private router: Router) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.isLoading = true;
    this.loadError = null;

    this.branchService.getAllBranches().subscribe({
      next: (branches) => {
        // Assign temporary IDs
        this.branches = branches.map((b, index) => ({ ...b, id: index + 1 }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.loadError = error.message || 'Failed to load branches';
        this.isLoading = false;
      }
    });
  }

  goToPlans(branchId: number): void {
    console.log('Navigating to branch plans:', branchId);
    this.router.navigate(['/gym-owner/subscription-plans', branchId]);
  }
}
