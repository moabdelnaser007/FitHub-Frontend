import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ActiveSubscription {
    subscriptionId: number;
    branchName: string;
    planName: string;
    remainingVisits: number;
    status: string;
    endDate: string;
}

export interface SubscriptionApiResponse {
    data: ActiveSubscription[];
    isSuccess: boolean;
    message: string;
    errorCode: string;
}

@Injectable({
    providedIn: 'root'
})
export class SubscriptionService {
    private apiUrl = `${environment.apiBaseUrl}/subscriptions`;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('fitHubToken');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    }

    getActiveSubscriptions(branchId: number): Observable<ActiveSubscription[]> {
        // Note: API endpoint specified in prompt: http://localhost:24357/api/subscriptions/GetActiveSubscriptions?branchId=7
        return this.http.get<SubscriptionApiResponse>(
            `${this.apiUrl}/GetActiveSubscriptions?branchId=${branchId}`,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => {
                if (response && response.isSuccess) {
                    return response.data;
                }
                return [];
            }),
            catchError(error => {
                console.error('Error fetching active subscriptions:', error);
                return throwError(() => new Error('Failed to fetch subscriptions'));
            })
        );
    }
    createSubscription(subscriptionRequest: { branchId: number; planId: number }): Observable<boolean> {
        return this.http.post<SubscriptionApiResponse>(
            this.apiUrl,
            subscriptionRequest,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => {
                return response && response.isSuccess && !!response.data;
            }),
            catchError(error => {
                console.error('Error creating subscription:', error);
                return throwError(() => error);
            })
        );
    }

    getMySubscriptions(): Observable<ActiveSubscription[]> {
        return this.http.get<SubscriptionApiResponse>(
            `${this.apiUrl}/my`,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => {
                if (response && response.isSuccess) {
                    return response.data;
                }
                return [];
            }),
            catchError(error => {
                console.error('Error fetching my subscriptions:', error);
                return throwError(() => new Error('Failed to fetch my subscriptions'));
            })
        );
    }

    cancelSubscription(subscriptionId: number): Observable<boolean> {
        return this.http.post<SubscriptionApiResponse>(
            `${this.apiUrl}/${subscriptionId}/cancel`,
            {},
            { headers: this.getHeaders() }
        ).pipe(
            map(response => response && response.isSuccess),
            catchError(error => {
                console.error('Error cancelling subscription:', error);
                return throwError(() => error);
            })
        );
    }
}
