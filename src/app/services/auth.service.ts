import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';
import { ResponseViewModel, RegisterUserDto, UserResponseDto } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiBaseUrl}/Auth`;

  constructor(private http: HttpClient) {}

  registerUser(dto: RegisterUserDto): Observable<UserResponseDto> {
    return this.http
      .post<ResponseViewModel<UserResponseDto>>(`${this.base}/register-user`, dto)
      .pipe(
        map((res) => {
          if (!res.isSuccess) {
            throw new Error(res.message || 'Registration failed');
          }
          return res.data as UserResponseDto;
        })
      );
  }
}
