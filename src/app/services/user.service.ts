import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseViewModel } from '../models/auth.models';

export interface UserProfileDto {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    status: string;
}


export interface UpdateProfileDto {
    fullName: string;
    email: string;
    phone: string;
    city: string;
}

export interface CreditHistory {
    id: number;
    userId: number;
    planId: number;
    basePrice: number;
    taxAmount: number;
    totalAmount: number;
    purchaseDate: string;
}

export interface Settlement {
    id: number;
    amount: number;
    status: string;
    createdAt: string;
    payoutDate: string | null;
    adminNotes: string | null;
}

export interface ApproveSettlementRequest {
    approve: boolean;
    adminNotes: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiBaseUrl}/Users`;
    private adminUrl = `${environment.apiBaseUrl}/AdminUsers`;
    private adminSettlementUrl = `${environment.apiBaseUrl}/admin/settlements`;

    constructor(private http: HttpClient) { }

    getMe(): Observable<ResponseViewModel<UserProfileDto>> {
        return this.http.get<ResponseViewModel<UserProfileDto>>(`${this.apiUrl}/get-me`);
    }

    updateMe(dto: UpdateProfileDto): Observable<ResponseViewModel<null>> {
        return this.http.put<ResponseViewModel<null>>(`${this.apiUrl}/update-me`, dto);
    }

    getAllUsersCreditHistory(): Observable<ResponseViewModel<CreditHistory[]>> {
        return this.http.get<ResponseViewModel<CreditHistory[]>>(`${this.adminUrl}/GetAllUsersCreditHistory`);
    }

    getSettlements(): Observable<ResponseViewModel<Settlement[]>> {
        return this.http.get<ResponseViewModel<Settlement[]>>(this.adminSettlementUrl);
    }

    approveSettlement(id: number, request: ApproveSettlementRequest): Observable<ResponseViewModel<boolean>> {
        return this.http.put<ResponseViewModel<boolean>>(`${this.adminSettlementUrl}/${id}`, request);
    }
}
