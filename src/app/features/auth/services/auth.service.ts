import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map, tap } from 'rxjs';
import {
  ResponseViewModel,
  RegisterUserDto,
  RegisterBusinessDto,
  UserResponseDto,
  LoginDto,
  TokenResponseDto,
  AuthUserData,
} from '../../../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = `${environment.apiBaseUrl}/Auth`;
  private readonly TOKEN_KEY = 'fitHubToken';
  private readonly USER_KEY = 'fitHubUser';

  constructor(private http: HttpClient) {}

  // ================= Register =================
  registerUser(dto: RegisterUserDto): Observable<UserResponseDto> {
    return this.http
      .post<ResponseViewModel<UserResponseDto>>(`${this.base}/register-user`, dto)
      .pipe(
        map((res) => {
          if (!res.isSuccess) throw new Error(res.message || 'Registration failed');
          return res.data as UserResponseDto;
        })
      );
  }

  registerBusiness(dto: RegisterBusinessDto): Observable<UserResponseDto> {
    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('FullName', dto.fullName);
    formData.append('Email', dto.email);
    formData.append('Phone', dto.phone);
    formData.append('City', dto.city);
    formData.append('CommercialRegistrationNumber', dto.commercialRegistrationNumber);
    formData.append('Password', dto.password);
    formData.append('ConfirmPassword', dto.confirmPassword);

    return this.http
      .post<ResponseViewModel<UserResponseDto>>(`${this.base}/register-owner`, formData)
      .pipe(
        map((res) => {
          if (!res.isSuccess) throw new Error(res.message || 'Business registration failed');
          return res.data as UserResponseDto;
        })
      );
  }

  // ================= Login =================
  login(email: string, password: string): Observable<string> {
    const dto: LoginDto = { email, password };

    return this.http.post<ResponseViewModel<TokenResponseDto>>(`${this.base}/login`, dto).pipe(
      map((res) => {
        console.log('🔍 Raw API Response:', JSON.stringify(res, null, 2));

        if (!res.isSuccess) throw new Error(res.message || 'Login failed');

        const token = res.data?.token;
        console.log('🔍 Extracted Token:', token);
        console.log('🔍 Token type:', typeof token);

        if (!token) throw new Error('Token not found in response');

        // خزن التوكن تلقائياً
        console.log('🔍 Before setToken - localStorage:', localStorage.getItem(this.TOKEN_KEY));
        this.setToken(token);
        console.log('🔍 After setToken - localStorage:', localStorage.getItem(this.TOKEN_KEY));

        return token;
      })
    );
  }

  // ================= OTP =================
  sendOtp(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<ResponseViewModel<string>>(`${this.base}/send-otp`, { email }).pipe(
      map((res) => ({
        success: res.isSuccess,
        message: res.message,
      }))
    );
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<ResponseViewModel<string>>(`${this.base}/verify-otp`, {
        email,
        otp,
      })
      .pipe(
        map((res) => ({
          success: res.isSuccess,
          message: res.message,
        }))
      );
  }

  // ================= Password =================
  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<ResponseViewModel<string>>(`${this.base}/forgot-password`, {
        email,
      })
      .pipe(
        map((res) => {
          if (!res.isSuccess) throw new Error(res.message || 'Forgot password failed');
        })
      );
  }

  resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<void> {
    return this.http
      .post<ResponseViewModel<string>>(`${this.base}/reset-password`, {
        email,
        otp,
        newPassword,
        confirmPassword,
      })
      .pipe(
        map((res) => {
          if (!res.isSuccess) throw new Error(res.message || 'Reset password failed');
        })
      );
  }

  // ================= Token Management =================
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // ================= User Data Management =================
  setUser(user: UserResponseDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): UserResponseDto | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // ================= Get Current User من الـ API =================
  getCurrentUser(): Observable<UserResponseDto> {
    return this.http.get<ResponseViewModel<UserResponseDto>>(`${this.base}/current-user`).pipe(
      map((res) => {
        if (!res.isSuccess) throw new Error(res.message || 'Failed to get user');
        const user = res.data as UserResponseDto;
        // خزن بيانات المستخدم
        this.setUser(user);
        return user;
      })
    );
  }
}
