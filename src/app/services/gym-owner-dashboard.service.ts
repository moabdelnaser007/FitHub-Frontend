import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GymOwnerDashboardStats {
    totalBranches: number;
    totalVisits: number;
    totalCredits: number;
    totalSubscriptions: number;
}

export interface DashboardResponse {
    data: GymOwnerDashboardStats;
    isSuccess: boolean;
    message: string;
    errorCode: string;
}

@Injectable({
    providedIn: 'root'
})
export class GymOwnerDashboardService {
    private apiUrl = `${environment.apiBaseUrl}/GymOwner`;

    constructor(private http: HttpClient) { }

    getDashboardStats(): Observable<DashboardResponse> {
        const token = localStorage.getItem('fitHubToken');
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get<DashboardResponse>(`${this.apiUrl}/dashboard`, { headers });
    }
}
