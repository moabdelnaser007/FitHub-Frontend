import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/* =======================
   Interfaces
======================= */

export interface Plan {
  id: number;
  branchId: number;
  name: string;
  description: string;
  price: number;
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
  price: number;
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
  price: number;
  creditsCost: number;
  visitsLimit: number;
  durationDays: number;
  status: 'ACTIVE' | 'INACTIVE';
}

/* =======================
   Service
======================= */

@Injectable({
  providedIn: 'root'
})
export class PlansService {

  private apiUrl = 'http://localhost:5024/api/owner/Plans';

  constructor(private http: HttpClient) {}

  /* =======================
     GET Plans By Branch
     GET /ByBranch/{branchId}
  ======================= */
  getPlansByBranch(branchId: number): Observable<Plan[]> {
    return this.http
      .get<ApiResponse<Plan[]>>(`${this.apiUrl}/ByBranch/${branchId}`)
      .pipe(
        map(res => res.data ?? []),
        catchError(() => of([]))
      );
  }

  /* =======================
     GET Single Plan
     GET /{planId}
  ======================= */
  getPlan(planId: number): Observable<Plan> {
    return this.http
      .get<ApiResponse<Plan>>(`${this.apiUrl}/${planId}`)
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  /* =======================
     CREATE Plan
     POST /{branchId}/Create
  ======================= */
  createPlan(
    branchId: number,
    planData: CreatePlanRequest
  ): Observable<Plan> {
    return this.http
      .post<ApiResponse<Plan>>(
        `${this.apiUrl}/${branchId}/Create`,
        planData
      )
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  /* =======================
     UPDATE Plan
     PUT /Update
  ======================= */
  updatePlan(planData: UpdatePlanRequest): Observable<Plan> {
    return this.http
      .put<ApiResponse<Plan>>(
        `${this.apiUrl}/Update`,
        planData
      )
      .pipe(
        map(res => res.data),
        catchError(err => throwError(() => err))
      );
  }

  /* =======================
     DELETE Plan
     DELETE /Delete/{planId}
  ======================= */
  deletePlan(planId: number): Observable<boolean> {
    return this.http
      .delete<ApiResponse<boolean>>(
        `${this.apiUrl}/Delete/${planId}`
      )
      .pipe(
        map(res => res.data === true),
        catchError(() => of(false))
      );
  }

  /* =======================
     ACTIVATE Plan
     PUT /Activate/{planId}
  ======================= */
  activatePlan(planId: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(
        `${this.apiUrl}/Activate/${planId}`,
        {}
      )
      .pipe(
        map(res => res.data === true),
        catchError(() => of(false))
      );
  }

  /* =======================
     DEACTIVATE Plan
     PUT /Deactivate/{planId}
  ======================= */
  deactivatePlan(planId: number): Observable<boolean> {
    return this.http
      .put<ApiResponse<boolean>>(
        `${this.apiUrl}/Deactivate/${planId}`,
        {}
      )
      .pipe(
        map(res => res.data === true),
        catchError(() => of(false))
      );
  }
}
