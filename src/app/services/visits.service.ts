import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CheckInResponse {
    isSuccess: boolean;
    message: string;
    data?: any;
    errorCode?: string;
}

export interface VisitLog {
    visitId: number;
    branchName: string;
    memberName: string;
    checkInTime: string;
    creditsDeducted: number;
}

export interface VisitLogResponse {
    data: VisitLog[];
    isSuccess: boolean;
    message: string;
    errorCode: string;
}

@Injectable({
    providedIn: 'root'
})
export class VisitsService {
    private apiUrl = `${environment.apiBaseUrl}/visits`;

    constructor(private http: HttpClient) { }

    checkIn(bookingCode: string): Observable<CheckInResponse> {
        return this.http.post<CheckInResponse>(`${this.apiUrl}/check-in`, { bookingCode });
    }

    getBranchVisits(branchId: number): Observable<VisitLogResponse> {
        return this.http.get<VisitLogResponse>(`${this.apiUrl}/branch/${branchId}`);
    }
}
