// branch.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BranchResponse {
  data: BranchData[];
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface SingleBranchResponse {
  data: BranchData;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface BranchData {
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
}

export interface UpdateBranchRequest {
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
}

export interface UpdateBranchResponse {
  data: BranchData;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface CreateBranchRequest {
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
}

export interface CreateBranchResponse {
  data: BranchData;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface DeleteBranchResponse {
  data: boolean;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

@Injectable({
  providedIn: 'root',
})
export class BranchService {
  private apiUrl = `${environment.apiBaseUrl}/owner/Branch`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');

    if (token) {
      return new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
    }

    return new HttpHeaders({
      'Content-Type': 'application/json',
    });
  }

  getAllBranches(): Observable<BranchData[]> {
    return this.http
      .get<BranchResponse>(`${this.apiUrl}/GetAllBranches`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('🔍 GetAllBranches Response:', response)),
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to load branches');
        }),
        catchError((error) => {
          console.error('❌ GetAllBranches Error:', error);
          return throwError(() => new Error(error.message || 'Error loading branches'));
        })
      );
  }

  getBranchById(id: number): Observable<BranchData> {
    return this.http
      .get<SingleBranchResponse>(`${this.apiUrl}/GetBranchById/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('🔍 GetBranchById Response:', response)),
        map((response) => {
          if (response.isSuccess) {
            console.log('✅ Branch data:', response.data);
            return response.data;
          }
          throw new Error(response.message || 'Failed to load branch details');
        }),
        catchError((error) => {
          console.error('❌ GetBranchById Error:', error);
          return throwError(() => new Error(error.message || 'Error loading branch details'));
        })
      );
  }

  updateBranch(id: number, branchData: UpdateBranchRequest): Observable<BranchData> {
    return this.http
      .put<UpdateBranchResponse>(
        `${this.apiUrl}/UpdateBranch/${id}`, // ✅ Fixed: Id in path instead of query string
        branchData,
        { headers: this.getHeaders() }
      )
      .pipe(
        tap((response) => console.log('🔍 UpdateBranch Response:', response)),
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to update branch');
        }),
        catchError((error) => {
          console.error('❌ UpdateBranch Error:', error);
          return throwError(() => new Error(error.message || 'Error updating branch'));
        })
      );
  }

  createBranch(branchData: CreateBranchRequest): Observable<BranchData> {
    return this.http
      .post<CreateBranchResponse>(`${this.apiUrl}/CreateBranch`, branchData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('🔍 CreateBranch Response:', response)),
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to create branch');
        }),
        catchError((error) => {
          console.error('❌ CreateBranch Error:', error);
          return throwError(() => new Error(error.message || 'Error creating branch'));
        })
      );
  }

  deleteBranch(id: number): Observable<boolean> {
    return this.http
      .delete<DeleteBranchResponse>(`${this.apiUrl}/DeleteGymBranch?id=${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('🔍 DeleteBranch Response:', response)),
        map((response) => {
          if (response.isSuccess) {
            return response.data;
          }
          throw new Error(response.message || 'Failed to delete branch');
        }),
        catchError((error) => {
          console.error('❌ DeleteBranch Error:', error);
          return throwError(() => new Error(error.message || 'Error deleting branch'));
        })
      );
  }
}
