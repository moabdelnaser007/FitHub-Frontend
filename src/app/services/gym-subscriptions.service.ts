import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

    getBranchSubscriptions(branchId: number): Observable<ApiResponse<Subscription[]>> {
        return this.http.get<ApiResponse<Subscription[]>>(`${this.apiUrl}/subscriptions/GetBranchSubscriptions/${branchId}`);
    }
}
