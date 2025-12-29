import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
    id: number;
    bookingCode: string;
    branchName: string;
    scheduledDateTime: string;
    creditsCost: number;
    status: string;
    hasReview: boolean;
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
export class BookingsService {
    private apiUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) { }

    getBranchBookings(branchId: number): Observable<ApiResponse<Booking[]>> {
        return this.http.get<ApiResponse<Booking[]>>(`${this.apiUrl}/bookings/BranchBookings/${branchId}`);
    }
}
