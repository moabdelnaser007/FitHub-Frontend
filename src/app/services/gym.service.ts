import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
  address: string;
  city: string;
  rating: number;
  visitCreditsCost: number;
  amenities: string;
}

export interface GymSearchFilters {
  name?: string;
  city?: string;
  minRating?: number;
  maxCredits?: number;
  address?: string;
  amenities?: string[];
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

  constructor(private http: HttpClient) { }

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
    const buildParams = (f: GymSearchFilters, overrideKey?: 'Name' | 'Address'): HttpParams => {
      let params = new HttpParams();
      // If overrideKey is provided, we only set that specific filter from the generic search term
      if (overrideKey === 'Name' && f.name) params = params.set('Name', f.name);
      if (overrideKey === 'Address' && f.address) params = params.set('Address', f.address);

      // If no override, behave normally (for specific filters)
      if (!overrideKey) {
        if (f.name) params = params.set('Name', f.name);
        if (f.address) params = params.set('Address', f.address);
      }

      // Set other common filters
      if (f.city) params = params.set('City', f.city);
      if (f.minRating) params = params.set('MinRating', f.minRating);
      if (f.maxCredits) params = params.set('MaxVisitCredits', f.maxCredits); // Ensure property matches interface

      if (f.amenities && f.amenities.length > 0) {
        f.amenities.forEach(amenity => {
          params = params.append('Amenities', amenity);
        });
      }
      return params;
    };

    // Check if this is a "Generic Search" where name and address are identical (set by component)
    const isGenericSearch = filters.name && filters.address && filters.name === filters.address;

    let searchObs: Observable<SearchGymResponse[]>;

    if (isGenericSearch) {
      // Create two independent requests: one for Name matching, one for Address matching
      const paramsName = buildParams(filters, 'Name');
      const paramsAddress = buildParams(filters, 'Address');

      const reqName = this.http.get<GymApiResponse<SearchGymResponse[]>>(`${environment.apiBaseUrl}/gyms`, { params: paramsName })
        .pipe(map(res => res.isSuccess && res.data ? res.data : []));

      const reqAddress = this.http.get<GymApiResponse<SearchGymResponse[]>>(`${environment.apiBaseUrl}/gyms`, { params: paramsAddress })
        .pipe(map(res => res.isSuccess && res.data ? res.data : []));

      // Combine and deduplicate
      searchObs = forkJoin([reqName, reqAddress]).pipe(
        map(([resultsName, resultsAddress]) => {
          const combined = [...resultsName, ...resultsAddress];
          // Deduplicate by ID
          const unique = new Map();
          combined.forEach(item => unique.set(item.id, item));
          return Array.from(unique.values());
        })
      );
    } else {
      // Standard specific filtering (AND logic)
      const params = buildParams(filters);
      searchObs = this.http.get<GymApiResponse<SearchGymResponse[]>>(`${environment.apiBaseUrl}/gyms`, { params })
        .pipe(map(res => res.isSuccess && res.data ? res.data : []));
    }

    return searchObs.pipe(
      map(data => data.map(item => this.transformSearchResponseToGym(item))),
      // Enrich with images by fetching details for each gym
      switchMap((gyms: Gym[]) => {
        if (gyms.length === 0) return of([]);

        const detailRequests = gyms.map(gym =>
          this.getActiveBranchById(Number(gym.id)).pipe(
            map(branch => {
              if (branch.images && branch.images.length > 0) {
                gym.image = this.getImageUrl(branch.branchName, branch.images[0].imageName);
              }
              return gym;
            }),
            catchError(() => of(gym))
          )
        );

        return forkJoin(detailRequests);
      }),
      catchError(error => {
        console.error('Search error', error);
        return of([]);
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
      rating: 0,
      reviewCount: 0,
      location: `${branch.address ? branch.address + ', ' : ''}${branch.city}`,
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
    if (!branchName || !imageName) return 'assets/default-gym.jpg';
    return `http://localhost:5024/images/Gym/${encodeURIComponent(
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
      image: 'assets/default-gym.jpg',
      rating: searchResult.rating || 0,
      reviewCount: 0,
      location: searchResult.address || '',
      activities: this.parseAmenities(searchResult.amenities),
      city: searchResult.city,
      visitCreditsCost: searchResult.visitCreditsCost
    };
  }
}
