// gym-owners.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  fullName: string;
  email: string;
  phone: string;
  city: string;
  commercialRegistrationNumber: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymOwnersService {
  private apiUrl = 'http://localhost:5024/api/AdminOwners';
  private token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjEiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9lbWFpbGFkZHJlc3MiOiJhZG1pbkBmaXRodWIuY29tIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NjY4NjQ3MzMsImlzcyI6IkZpdEh1YiIsImF1ZCI6IkZpdEh1YlVzZXJzIn0.75HVTUyfbxafp4m5Q_5VIjjNKT5XzAJnYDDO5o4KIkY';

  constructor(private http: HttpClient) {}

  // Helper function للـ Headers مع Token
  private getHeaders(): HttpHeaders {
    // محاولة جلب التوكن من localStorage أولاً، ثم استخدام التوكن الثابت
    const storageToken = localStorage.getItem('fitHubToken');
    const authToken = storageToken || this.token;
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });
  }

  // ✅ جلب الـ Pending Owners
  getPendingOwners(): Observable<PendingOwner[]> {
    return this.http.get<ApiResponse<PendingOwner[]>>(`${this.apiUrl}/pending`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.isSuccess && response.data) {
          console.log('✅ Pending owners fetched:', response.data);
          return response.data;
        }
        throw new Error(response.message || 'Failed to fetch pending owners');
      }),
      catchError(this.handleError)
    );
  }

  // ✅ قبول Gym Owner
  approveOwner(ownerId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${ownerId}/approve`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Owner approved:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // ✅ رفض Gym Owner
  rejectOwner(ownerId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${ownerId}/reject`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        console.log('✅ Owner rejected:', response);
        return response;
      }),
      catchError(this.handleError)
    );
  }

  // ✅ جلب إحصائيات Dashboard (Users, Gyms, etc.)
  getDashboardStats(): Observable<any> {
    // هنا بنجمع كل الإحصائيات من APIs مختلفة
    return this.http.get<any[]>(
      'http://localhost:5024/api/AdminUsers/GetAllUsers',
      { headers: this.getHeaders() }
    ).pipe(
      map(users => {
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
    return this.http.get<any>(
      'http://localhost:5024/api/AdminUsers/GetAllUsers',
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
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
    return this.http.get<ApiResponse<any[]>>(
      'http://localhost:5024/api/AdminBranch/GetAllBranches',
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
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