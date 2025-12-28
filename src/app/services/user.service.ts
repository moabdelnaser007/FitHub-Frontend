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

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiBaseUrl}/Users`;

    constructor(private http: HttpClient) { }

    getMe(): Observable<ResponseViewModel<UserProfileDto>> {
        return this.http.get<ResponseViewModel<UserProfileDto>>(`${this.apiUrl}/get-me`);
    }

    updateMe(dto: UpdateProfileDto): Observable<ResponseViewModel<null>> {
        return this.http.put<ResponseViewModel<null>>(`${this.apiUrl}/update-me`, dto);
    }
}
