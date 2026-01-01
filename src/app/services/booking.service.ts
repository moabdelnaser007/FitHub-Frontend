import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BookingItem {
    id: number;
    bookingCode: string;
    branchName: string;
    scheduledDateTime: string;
    creditsCost: number;
    status: string;
    hasReview: boolean;
}

export interface Review {
    id: number;
    userName: string;
    bookingDate: string;
    rating: number;
    comment: string;
}

export interface BookingResponse<T = string> {
    data: T;
    isSuccess: boolean;
    message: string;
    errorCode: string;
}

@Injectable({
    providedIn: 'root',
})
export class BookingService {
    private apiUrl = `${environment.apiBaseUrl}/bookings`;

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

    createBooking(branchId: number, scheduledDateTime: string, subscriptionId?: number): Observable<BookingResponse> {
        const body: any = {
            branchId,
            scheduledDateTime,
        };
        if (subscriptionId) {
            body.subscriptionId = subscriptionId;
        }
        return this.http.post<BookingResponse>(this.apiUrl, body, {
            headers: this.getHeaders(),
        });
    }

    getMyBookings(): Observable<BookingResponse<BookingItem[]>> {
        return this.http.get<BookingResponse<BookingItem[]>>(`${this.apiUrl}/my`, {
            headers: this.getHeaders(),
        });
    }

    submitReview(bookingId: number, rating: number, comment: string, isAnonymous: boolean): Observable<BookingResponse<boolean>> {
        const body = {
            bookingId,
            rating,
            comment,
            isAnonymous,
        };
        return this.http.post<BookingResponse<boolean>>(`${environment.apiBaseUrl}/reviews`, body, {
            headers: this.getHeaders(),
        });
    }

    getReviewsByBranch(branchId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${environment.apiBaseUrl}/reviews/branch/${branchId}`, {
            headers: this.getHeaders(),
        });
    }
}
