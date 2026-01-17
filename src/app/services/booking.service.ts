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
    private api = `${environment.apiBaseUrl}/bookings`;

    constructor(private http: HttpClient) { }

    createBooking(
        branchId: number,
        scheduledDateTime: string,
        subscriptionId?: number
    ) {
        const body: any = { branchId, scheduledDateTime };
        if (subscriptionId) body.subscriptionId = subscriptionId;

        return this.http.post<BookingResponse<string>>(this.api, body);
    }

    getMyBookings() {
        return this.http.get<BookingResponse<BookingItem[]>>(`${this.api}/my`);
    }

    cancelBooking(bookingId: number) {
        return this.http.post<BookingResponse<boolean>>(
            `${this.api}/${bookingId}/cancel`,
            {}
        );
    }

    submitReview(
        bookingId: number,
        rating: number,
        comment: string,
        isAnonymous: boolean
    ) {
        return this.http.post<BookingResponse<boolean>>(
            `${environment.apiBaseUrl}/reviews`,
            { bookingId, rating, comment, isAnonymous }
        );
    }

    getReviewsByBranch(branchId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${environment.apiBaseUrl}/reviews/branch/${branchId}`);
    }
}
