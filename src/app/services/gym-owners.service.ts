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

export interface PendingOwner {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gymName: string;
  gymLocation: string;
  gymDescription?: string;
  status: string;
  appliedDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class GymOwnersService {
  private apiUrl = 'http://localhost:5024/api/AdminOwners';

  constructor(private http: HttpClient) {}

  // Helper function للـ Headers مع Token
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');
    
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // ✅ جلب الـ Pending Owners
  getPendingOwners(): Observable<PendingOwner[]> {
    return this.http.get<ApiResponse<PendingOwner[]>>(`${this.apiUrl}/pending`, {
      headers: this.getHeaders()
    }).pipe(
      map(response => {
        if (response.isSuccess) {
          return response.data;
        }
        throw new Error(response.message);
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
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Unauthorized. Please login first.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'Owner not found.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Invalid data provided.';
    } else if (error.status) {
      errorMessage = `Error ${error.status}: ${error.message || 'Server error'}`;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}