import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ResponseViewModel } from '../models/auth.models';

export interface Settlement {
    id: number;
    amount: number;
    status: string;
    createdAt: string;
    payoutDate: string | null;
    adminNotes: string | null;
}

export interface CreateSettlementDto {
    amount: number;
}

@Injectable({
    providedIn: 'root'
})
export class SettlementsService {
    private apiUrl = `${environment.apiBaseUrl}/owner/settlements`;

    constructor(private http: HttpClient) { }

    getSettlements(): Observable<ResponseViewModel<Settlement[]>> {
        return this.http.get<ResponseViewModel<Settlement[]>>(this.apiUrl);
    }

    createSettlement(dto: CreateSettlementDto): Observable<ResponseViewModel<boolean>> {
        return this.http.post<ResponseViewModel<boolean>>(this.apiUrl, dto);
    }
}
