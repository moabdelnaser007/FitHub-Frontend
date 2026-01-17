// gym-owners.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

// ✅ Interface متوافق مع الـ API Response الفعلي
export interface PendingOwner {
  id: number;
  userId?: number; // Added to handle potential ID mismatch
  fullName: string;
  email: string;
  phone: string;
  city: string;
  commercialRegistrationNumber: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class GymOwnersService {
  private apiUrl = `${environment.apiBaseUrl}/AdminOwners`;

  constructor(private http: HttpClient) { }

  // Helper function للـ Headers مع Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');
    // If no token, we can't authenticate as Admin. The component handles redirection to login.
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ✅ جلب بيانات Gym Owner محدد بواسطة ID
  getOwnerById(id: number): Observable<PendingOwner> {
    // Note: If the backend doesn't have a specific "GetById", we can filter from the pending list
    // OR assuming there is an endpoint like /AdminOwners/{id}
    // Since we don't know the exact endpoint for single owner details, 
    // we'll try to fetch from pending list and find it, or use a likely endpoint.
    // Let's assume the standard GET /AdminOwners/{id} exists or we fallback to filtering pending.

    // Strategy: First try generic GetById if it exists, else filter pending.
    // Given the context, we will try to fetch the list and find it since we know that endpoint works.
    return this.getPendingOwners().pipe(
      map(owners => {
        const owner = owners.find(o => o.id === id);
        if (owner) return owner;
        throw new Error('Owner not found');
      })
    );
  }

  // ✅ جلب الـ Pending Owners
  getPendingOwners(): Observable<PendingOwner[]> {
    return this.http
      .get<ApiResponse<PendingOwner[]>>(`${this.apiUrl}/pending`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            console.log('✅ Pending owners fetched:', response.data);
            return response.data;
          }
          return [];
        }),
        catchError(this.handleError)
      );
  }

  // ✅ قبول Gym Owner
  approveOwner(ownerId: number): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(
        `${this.apiUrl}/${ownerId}/approve`,
        null,
        { headers: this.getHeaders() }
      )
      .pipe(
        map((response) => {
          console.log('✅ Owner approved:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // ✅ رفض Gym Owner
  rejectOwner(ownerId: number): Observable<ApiResponse<any>> {
    return this.http
      .put<ApiResponse<any>>(`${this.apiUrl}/${ownerId}/reject`, null, { headers: this.getHeaders() })
      .pipe(
        map((response) => {
          console.log('✅ Owner rejected:', response);
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // ✅ جلب إحصائيات Dashboard (Users, Gyms, etc.)
  getDashboardStats(): Observable<any> {
    // هنا بنجمع كل الإحصائيات من APIs مختلفة
    return this.http
      .get<any[]>(`${environment.apiBaseUrl}/AdminUsers/GetAllUsers`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((users) => {
          return {
            totalUsers: users?.length || 0,
            // يمكن إضافة إحصائيات أخرى هنا
          };
        }),
        catchError(() => {
          console.warn('⚠️ Could not fetch dashboard stats');
          return [{ totalUsers: 0 }];
        })
      );
  }

  // ✅ جلب عدد Users فقط
  getTotalUsers(): Observable<number> {
    return this.http
      .get<any>(`${environment.apiBaseUrl}/AdminUsers/GetAllUsers`, { headers: this.getHeaders() })
      .pipe(
        map((response) => {
          console.log('🔍 Raw API Response for users:', response);

          // التحقق من نوع الـ response
          if (Array.isArray(response)) {
            // لو الـ response array مباشرة
            const count = response.length;
            console.log('✅ Total users count (direct array):', count);
            return count;
          } else if (response.data && Array.isArray(response.data)) {
            // لو الـ response فيها data property
            const count = response.data.length;
            console.log('✅ Total users count (from data property):', count);
            return count;
          } else {
            console.warn('⚠️ Unexpected response format:', response);
            return 0;
          }
        }),
        catchError((error) => {
          console.error('❌ Error fetching users:', error);
          return [0];
        })
      );
  }

  // ✅ جلب عدد Gyms النشطة
  getActiveGymsCount(): Observable<number> {
    return this.http
      .get<ApiResponse<any[]>>(`${environment.apiBaseUrl}/AdminBranch/GetAllBranches`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess && response.data) {
            const activeCount = response.data.filter(
              (branch: any) => branch.status === 'ACTIVE'
            ).length;
            console.log('✅ Active gyms count:', activeCount);
            return activeCount;
          }
          return 0;
        }),
        catchError(() => {
          console.warn('⚠️ Could not fetch active gyms count');
          return [0];
        })
      );
  }

  // ✅ Error Handler محسّن
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.status === 401) {
      errorMessage = 'Unauthorized. Please login first.';
      // يمكن إعادة التوجيه للـ login page
      // this.router.navigate(['/login']);
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Owner not found.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid data provided.';
    } else if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.status) {
      errorMessage = `Error ${error.status}: ${error.message || 'Server error'}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }

    console.error('❌ API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
