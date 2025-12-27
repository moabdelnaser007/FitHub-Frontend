import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GymImage {
  imageName: string;
  imagePath: string;
}

export interface Branch {
  id: number;
  branchName: string;
  phone: string;
  address: string;
  city: string;
  visitCreditsCost: number;
  description: string;
  openTime: string;
  closeTime: string;
  genderType: string;
  status: string;
  workingDays: string;
  amenitiesAvailable: string;
  images: GymImage[];
}

export interface GymApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface SearchGymResponse {
  id: number;
  name: string;
  image: string | null;
  address: string;
  rating: number;
  amenities: string[];
}

export interface GymSearchFilters {
  name?: string;
  city?: string;
  minRating?: number;
}

export interface Gym {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  activities: string[];
  branchName?: string;
  phone?: string;
  address?: string;
  city?: string;
  visitCreditsCost?: number;
  description?: string;
  openTime?: string;
  closeTime?: string;
  genderType?: string;
  status?: string;
  workingDays?: string;
  amenitiesAvailable?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GymService {
  private apiUrl = `${environment.apiBaseUrl}/UserBranch`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  searchGyms(filters: GymSearchFilters): Observable<Gym[]> {
    // Backend search API doesn't return images, so we fetch all branches and filter client-side
    return this.getAllActiveBranches().pipe(
      map((gyms) => {
        let filteredGyms = gyms;

        // Filter by name
        if (filters.name && filters.name.trim()) {
          const searchTerm = filters.name.toLowerCase().trim();
          filteredGyms = filteredGyms.filter((gym) => gym.name.toLowerCase().includes(searchTerm));
        }

        // Filter by city
        if (filters.city && filters.city.trim()) {
          const cityTerm = filters.city.toLowerCase().trim();
          filteredGyms = filteredGyms.filter((gym) => gym.city?.toLowerCase().includes(cityTerm));
        }

        // Filter by minimum rating
        if (filters.minRating !== undefined && filters.minRating > 0) {
          filteredGyms = filteredGyms.filter((gym) => gym.rating >= filters.minRating!);
        }

        return filteredGyms;
      })
    );
  }

  getAllActiveBranches(): Observable<Gym[]> {
    return this.http
      .get<GymApiResponse<Branch[]>>(`${this.apiUrl}/GetAllActiveBranches`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            // Transform backend branches to Gym interface
            return response.data.map((branch) => this.transformBranchToGym(branch));
          }
          throw new Error(response.message || 'Failed to fetch gyms');
        }),
        catchError((error) => {
          console.error('Error fetching gyms:', error);
          return throwError(() => new Error(error.message || 'Error loading gyms'));
        })
      );
  }

  // Fetch active branch details by ID for gym details page
  getActiveBranchById(branchId: number): Observable<Branch> {
    return this.http
      .get<GymApiResponse<Branch>>(`${this.apiUrl}/GetActiveBranchById/${branchId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch active branch details');
        }),
        catchError((error) => {
          console.error('Error fetching active branch details:', error);
          return throwError(() => new Error(error.message || 'Error loading branch'));
        })
      );
  }

  getBranchById(branchId: number): Observable<Gym> {
    return this.http
      .get<GymApiResponse<Branch>>(`${this.apiUrl}/GetBranchById/${branchId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            return this.transformBranchToGym(response.data);
          }
          throw new Error(response.message || 'Failed to fetch gym details');
        }),
        catchError((error) => {
          console.error('Error fetching gym details:', error);
          return throwError(() => new Error(error.message || 'Error loading gym details'));
        })
      );
  }

  private transformBranchToGym(branch: Branch): Gym {
    return {
      id: branch.id.toString(),
      name: branch.branchName,
      image:
        branch.images && branch.images.length > 0
          ? this.getImageUrl(branch.branchName, branch.images[0].imageName)
          : 'assets/default-gym.jpg',
      rating: 4.5, // Default rating - update when backend provides it
      reviewCount: 0, // Default - update when backend provides it
      location: `${branch.city}`,
      activities: this.parseAmenities(branch.amenitiesAvailable),
      branchName: branch.branchName,
      phone: branch.phone,
      address: branch.address,
      city: branch.city,
      visitCreditsCost: branch.visitCreditsCost,
      description: branch.description,
      openTime: branch.openTime,
      closeTime: branch.closeTime,
      genderType: branch.genderType,
      status: branch.status,
      workingDays: branch.workingDays,
      amenitiesAvailable: branch.amenitiesAvailable,
    };
  }

  getImageUrl(branchName: string, imageName: string): string {
    // Backend stores images at: wwwroot/images/Gym/{BranchName}/{ImageName}
    // We construct the URL to serve from backend
    if (!branchName || !imageName) return 'assets/default-gym.jpg';

    // URL format: http://localhost:24357/images/Gym/Oxygen/569279a6-260d-4134-bca5-e4893197832a-Oxygen.jfif
    return `http://localhost:24357/images/Gym/${encodeURIComponent(
      branchName
    )}/${encodeURIComponent(imageName)}`;
  }

  private parseAmenities(amenitiesString: string): string[] {
    if (!amenitiesString) return [];
    return amenitiesString
      .split(',')
      .map((amenity) => amenity.trim())
      .filter((amenity) => amenity.length > 0);
  }

  private transformSearchResponseToGym(searchResult: SearchGymResponse): Gym {
    return {
      id: searchResult.id.toString(),
      name: searchResult.name,
      image: searchResult.image || 'assets/default-gym.jpg',
      rating: searchResult.rating || 0,
      reviewCount: 0,
      location: searchResult.address || '',
      activities: searchResult.amenities || [],
    };
  }
}
