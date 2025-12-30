import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Subscription {
    subscriptionId: number;
    branchName: string;
    planName: string;
    remainingVisits: number;
    status: string;
    endDate: string;
}

export interface ApiResponse<T> {
    data: T;
    isSuccess: boolean;
    message: string;
    errorCode: string;
}

@Injectable({
    providedIn: 'root'
})
export class GymSubscriptionsService {
    private apiUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('fitHubToken');
        let headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'accept': '*/*',
        });
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    getBranchSubscriptions(branchId: number): Observable<ApiResponse<Subscription[]>> {
        return this.http.get<ApiResponse<Subscription[]>>(`${this.apiUrl}/subscriptions/GetBranchSubscriptions/${branchId}`, {
            headers: this.getHeaders()
        });
    }
}
