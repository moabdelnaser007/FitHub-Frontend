import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

/* =======================
   Interfaces
======================= */

export interface Plan {
  id: number;
  branchId: number;
  name: string;
  description: string;
  creditsCost: number;
  visitsLimit: number;
  durationDays: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: string;
}

export interface CreatePlanRequest {
  branchId: number;
  name: string;
  description: string;
  creditsCost: number;
  visitsLimit: number;
  durationDays: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface UpdatePlanRequest {
  id: number;
  branchId: number;
  name: string;
  description: string;
  creditsCost: number;
  visitsLimit: number;
  durationDays: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/* =======================
   Service
======================= */

@Injectable({
  providedIn: 'root',
})
export class PlansService {
  private apiUrl = `${environment.apiBaseUrl}/owner/Plans`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  /* =======================
     GET Plans By Branch
     GET /ByBranch/{branchId}
  ======================= */
  getPlansByBranch(branchId: number): Observable<Plan[]> {
    console.log('🔵 Fetching plans for branch:', branchId);
    
    return this.http
      .get<ApiResponse<Plan[]>>(`${this.apiUrl}/ByBranch/${branchId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Plans API Response:', response)),
        map((res) => {
          if (res.isSuccess && res.data) {
            console.log('✅ Plans loaded:', res.data);
            return res.data;
          }
          console.log('⚠️ No plans found or error');
          return [];
        }),
        catchError((error) => {
          console.error('❌ Error loading plans:', error);
          return of([]);
        })
      );
  }

  /* =======================
     GET Single Plan
     GET /{planId}
  ======================= */
  getPlan(planId: number): Observable<Plan> {
    console.log('🔵 Fetching plan:', planId);
    
    return this.http
      .get<ApiResponse<Plan>>(`${this.apiUrl}/${planId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Plan API Response:', response)),
        map((res) => {
          if (res.isSuccess && res.data) {
            return res.data;
          }
          throw new Error(res.message || 'Failed to load plan');
        }),
        catchError((error) => {
          console.error('❌ Error loading plan:', error);
          return throwError(() => new Error(error.message || 'Error loading plan'));
        })
      );
  }

  /* =======================
     CREATE Plan
     POST /{branchId}/Create
  ======================= */
  createPlan(branchId: number, planData: CreatePlanRequest): Observable<Plan> {
    console.log('🔵 Creating plan for branch:', branchId, planData);
    
    return this.http
      .post<ApiResponse<Plan>>(`${this.apiUrl}/${branchId}/Create`, planData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Create Plan Response:', response)),
        map((res) => {
          if (res.isSuccess && res.data) {
            return res.data;
          }
          throw new Error(res.message || 'Failed to create plan');
        }),
        catchError((error) => {
          console.error('❌ Error creating plan:', error);
          return throwError(() => new Error(error.message || 'Error creating plan'));
        })
      );
  }

  /* =======================
     UPDATE Plan
     PUT /Update
  ======================= */
  updatePlan(planData: UpdatePlanRequest): Observable<Plan> {
    console.log('🔵 Updating plan:', planData);
    
    return this.http
      .put<ApiResponse<Plan>>(`${this.apiUrl}/Update`, planData, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Update Plan Response:', response)),
        map((res) => {
          if (res.isSuccess && res.data) {
            return res.data;
          }
          throw new Error(res.message || 'Failed to update plan');
        }),
        catchError((error) => {
          console.error('❌ Error updating plan:', error);
          return throwError(() => new Error(error.message || 'Error updating plan'));
        })
      );
  }

  /* =======================
     DELETE Plan
     DELETE /Delete/{planId}
  ======================= */
  deletePlan(planId: number): Observable<boolean> {
    console.log('🔵 Deleting plan:', planId);
    
    return this.http
      .delete<ApiResponse<boolean>>(`${this.apiUrl}/Delete/${planId}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Delete Plan Response:', response)),
        map((res) => {
          if (res.isSuccess) {
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error('❌ Error deleting plan:', error);
          return of(false);
        })
      );
  }

  /* =======================
     ACTIVATE Plan
     PUT /Activate/{planId}
  ======================= */
  activatePlan(planId: number): Observable<boolean> {
    console.log('🔵 Activating plan:', planId);
    
    return this.http
      .put<ApiResponse<boolean>>(`${this.apiUrl}/Activate/${planId}`, {}, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Activate Plan Response:', response)),
        map((res) => {
          if (res.isSuccess) {
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error('❌ Error activating plan:', error);
          return of(false);
        })
      );
  }

  /* =======================
     DEACTIVATE Plan
     PUT /Deactivate/{planId}
  ======================= */
  deactivatePlan(planId: number): Observable<boolean> {
    console.log('🔵 Deactivating plan:', planId);
    
    return this.http
      .put<ApiResponse<boolean>>(`${this.apiUrl}/Deactivate/${planId}`, {}, {
        headers: this.getHeaders(),
      })
      .pipe(
        tap((response) => console.log('✅ Deactivate Plan Response:', response)),
        map((res) => {
          if (res.isSuccess) {
            return true;
          }
          return false;
        }),
        catchError((error) => {
          console.error('❌ Error deactivating plan:', error);
          return of(false);
        })
      );
  }
}