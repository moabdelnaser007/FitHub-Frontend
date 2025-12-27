// admin-branches.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces
export interface Branch {
  id: number;
  ownerId: number;
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
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message: string;
  errorCode: string;
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

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private apiUrl = 'http://localhost:5024/api/AdminBranch';

  constructor(private http: HttpClient) {}

  // Get HTTP Headers with Authorization
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('fitHubToken');
    
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get All Branches
  getAllBranches(): Observable<ApiResponse<Branch[]>> {
    return this.http.get<ApiResponse<Branch[]>>(
      `${this.apiUrl}/GetAllBranches`,
      { headers: this.getHeaders() }
    );
  }

  // Get Branches By Owner ID
  getBranchesByOwner(ownerId: number): Observable<ApiResponse<Branch[]>> {
    return this.http.get<ApiResponse<Branch[]>>(
      `${this.apiUrl}/GetBranchesByOwner/${ownerId}`,
      { headers: this.getHeaders() }
    );
  }

  // Get Branch By ID
  getBranchById(branchId: number): Observable<ApiResponse<Branch>> {
    return this.http.get<ApiResponse<Branch>>(
      `${this.apiUrl}/GetBranchById/${branchId}`,
      { headers: this.getHeaders() }
    );
  }

  // Suspend Branch (Change status to INACTIVE)
  suspendBranch(branchId: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/SuspendBranch/${branchId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Resume Branch (Change status to ACTIVE)
  resumeBranch(branchId: number): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(
      `${this.apiUrl}/ResumeBranch/${branchId}`,
      null,
      { headers: this.getHeaders() }
    );
  }

  // Update Branch - استخدام PUT API
  updateBranch(branchId: number, branchData: UpdateBranchRequest): Observable<ApiResponse<UpdateBranchRequest>> {
    return this.http.put<ApiResponse<UpdateBranchRequest>>(
      `${this.apiUrl}/UpdateBranch/${branchId}`,
      branchData,
      { headers: this.getHeaders() }
    );
  }
}