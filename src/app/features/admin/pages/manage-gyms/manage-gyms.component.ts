// gym-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Gym {
  id: string;
  name: string;
  owner: string;
  location: string;
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
  gyms: Gym[] = [
    {
      id: '1',
      name: 'Flex Fitness Center',
      owner: 'John Doe',
      location: 'New York',
      status: 'Active',
      isActive: true,
      isSelected: false
    },
    {
      id: '2',
      name: 'Iron Paradise',
      owner: 'Jane Smith',
      location: 'Los Angeles',
      status: 'Inactive',
      isActive: false,
      isSelected: false
    },
    {
      id: '3',
      name: 'Powerhouse Gym',
      owner: 'Mike Johnson',
      location: 'Chicago',
      status: 'Inactive',
      isActive: false,
      isSelected: false
    },
    {
      id: '4',
      name: 'Yoga Flow Studio',
      owner: 'Emily White',
      location: 'San Francisco',
      status: 'Active',
      isActive: true,
      isSelected: false
    }
  ];

  filteredGyms: Gym[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  cityFilter: string = 'all';
  
  selectAll: boolean = false;
  
  // Pagination
  currentPage: number = 2;
  itemsPerPage: number = 4;
  totalItems: number = 100;
  
  // Delete Modal
  showDeleteModal: boolean = false;
  gymToDelete: Gym | null = null;
  isDeleting: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredGyms = [...this.gyms];
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onCityFilterChange(city: string): void {
    this.cityFilter = city;
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
  }

  onToggleSelectAll(): void {
    this.filteredGyms.forEach(gym => gym.isSelected = this.selectAll);
  }

  onToggleGymSelect(gym: Gym): void {
    this.selectAll = this.filteredGyms.every(g => g.isSelected);
  }

  onToggleStatus(gym: Gym): void {
    gym.isActive = !gym.isActive;
    gym.status = gym.isActive ? 'Active' : 'Inactive';
    console.log('Gym status toggled:', gym);
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
    console.log('Deleting gym:', this.gymToDelete);
    
    setTimeout(() => {
      if (this.gymToDelete) {
        this.gyms = this.gyms.filter(g => g.id !== this.gymToDelete!.id);
        this.applyFilters();
      }
      
      this.isDeleting = false;
      this.closeDeleteModal();
    }, 1000);
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.gymToDelete = null;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('Page changed to:', page);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: Math.min(3, this.totalPages) }, (_, i) => i + 1);
  }
}
