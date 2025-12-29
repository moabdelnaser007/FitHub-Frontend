import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RechargeResponse {
    redirectUrl: string;
}

@Injectable({
    providedIn: 'root',
})
export class WalletService {
    private apiUrl = `${environment.apiBaseUrl}/wallet`;

    constructor(private http: HttpClient) { }

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

    rechargeWallet(planId: number): Observable<RechargeResponse> {
        const url = `${this.apiUrl}/recharge`;
        const body = { planId };

        return this.http.post<RechargeResponse>(url, body, {
            headers: this.getHeaders(),
        });
    }

    getAllFitHubPlans(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/GetAllFitHubPlans`);
    }

    getTransactions(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/transactions`, {
            headers: this.getHeaders()
        });
    }
}
