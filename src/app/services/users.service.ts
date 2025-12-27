import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { map, catchError } from 'rxjs/operators';

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface UserViewModel {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  isActive: boolean;
  createdAt: string;
}

// Interface للـ Update User Request
export interface UpdateUserRequest {
  fullName: string;
  email: string;
  phone: string;
  city?: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = `${environment.apiBaseUrl}/AdminUsers`;

  constructor(private http: HttpClient) {}

  // Helper function للـ Headers مع Token
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

  getAllUsers(): Observable<UserViewModel[]> {
    return this.http
      .get<ApiResponse<User[]>>(`${this.apiUrl}/GetAllUsers`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            return response.data.map((user) => this.transformToViewModel(user));
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError)
      );
  }

  // ✅ الـ Method الجديدة للـ Update User
  getUserById(userId: number): Observable<UserViewModel> {
    return this.http
      .get<ApiResponse<User>>(`${this.apiUrl}/GetUser/${userId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            return this.transformToViewModel(response.data);
          }
          throw new Error(response.message);
        }),
        catchError(this.handleError)
      );
  }

  // ✅ Update User - الـ Method الأساسية
  updateUser(userId: number, userData: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http
      .put<ApiResponse<User>>(`${this.apiUrl}/${userId}/UpdateUser`, userData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
  getMe(): Observable<ApiResponse<User>> {
    return this.http
      .get<ApiResponse<User>>(`${environment.apiBaseUrl}/Users/get-me`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  updateMe(payload: UpdateUserRequest): Observable<ApiResponse<User>> {
    return this.http
      .put<ApiResponse<User>>(`${environment.apiBaseUrl}/Users/update-me`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }
  deleteUser(userId: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${userId}/DeleteUser`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  updateUserStatus(userId: number, status: string): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/UpdateUserStatus/${userId}`, { status }, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  private transformToViewModel(user: User): UserViewModel {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      status: user.status as 'Active' | 'Inactive' | 'Suspended',
      isActive: user.status === 'Active',
      createdAt: user.createdAt,
    };
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.status === 401) {
      errorMessage = 'Unauthorized. Please login first.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'User not found.';
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
