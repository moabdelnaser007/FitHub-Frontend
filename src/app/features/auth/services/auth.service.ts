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

  constructor(private http: HttpClient) { }

  // ================= Register =================
  registerUser(dto: RegisterUserDto): Observable<UserResponseDto> {
    return this.http
      .post<ResponseViewModel<UserResponseDto>>(
        `${this.base}/register-user`,
        dto,
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message, data } = this.parseResponse(res);
          if (!isSuccess) throw new Error(message || 'Registration failed');
          return data as UserResponseDto;
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
      .post<ResponseViewModel<UserResponseDto>>(
        `${this.base}/register-owner`,
        formData,
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message, data } = this.parseResponse(res);
          if (!isSuccess) throw new Error(message || 'Business registration failed');
          return data as UserResponseDto;
        })
      );
  }

  // ================= Login =================
  login(email: string, password: string): Observable<string> {
    const dto: LoginDto = { email, password };
    console.log('🔄 Calling login with body:', dto);

    return this.http
      .post<ResponseViewModel<TokenResponseDto>>(
        `${this.base}/login`,
        dto,
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          console.log('🔍 Raw API Response:', JSON.stringify(res, null, 2));
          const { isSuccess, message, data } = this.parseResponse(res);

          if (!isSuccess) throw new Error(message || 'Login failed');

          const token = data?.token;
          console.log('🔍 Extracted Token:', token);

          if (!token) throw new Error('Token not found in response');

          this.setToken(token);
          return token;
        })
      );
  }

  // ================= OTP =================
  sendOtp(email: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<ResponseViewModel<string>>(
        `${this.base}/send-otp`,
        { email },
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message } = this.parseResponse(res);
          return {
            success: !!isSuccess,
            message: message || '',
          };
        })
      );
  }

  resendOtp(email: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<ResponseViewModel<string>>(
        `${this.base}/resend-otp`,
        { email },
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message } = this.parseResponse(res);
          return {
            success: !!isSuccess,
            message: message || '',
          };
        })
      );
  }

  verifyOtp(email: string, otp: string): Observable<{ success: boolean; message: string }> {
    return this.http
      .post<ResponseViewModel<string>>(
        `${this.base}/verify-otp`,
        { email, otp },
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message } = this.parseResponse(res);
          return {
            success: !!isSuccess,
            message: message || '',
          };
        })
      );
  }

  // ================= Password =================
  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<ResponseViewModel<string>>(
        `${this.base}/forgot-password`,
        { email },
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          const { isSuccess, message } = this.parseResponse(res);
          if (!isSuccess) throw new Error(message || 'Forgot password failed');
        })
      );
  }

  resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ): Observable<{ success: boolean; message: string }> {
    // Standardize to match the working CURL request (lowercase keys)
    const body = {
      email,
      otp,
      newPassword,
      confirmPassword
    };
    console.log('🔄 Calling reset-password with body:', body);

    return this.http
      .post<ResponseViewModel<string>>(`${this.base}/reset-password`, body, {
        headers: {
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
      })
      .pipe(
        map((res) => {
          console.log('✅ Reset password response:', res);
          const { isSuccess, message } = this.parseResponse(res);
          return {
            success: !!isSuccess,
            message: message || '',
          };
        })
      );
  }

  /**
   * Helper to normalize response keys (handles both camelCase and PascalCase)
   */
  private parseResponse<T>(res: ResponseViewModel<T>): { isSuccess: boolean; message: string; data: T | null } {
    return {
      isSuccess: !!(res.isSuccess ?? res.IsSuccess),
      message: (res.message ?? res.Message) || '',
      data: (res.data ?? res.Data) || null
    };
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
    const url = `${environment.apiBaseUrl}/Users/get-me`;
    console.log('🔄 Calling current user:', url);
    return this.http
      .get<ResponseViewModel<UserResponseDto>>(
        url,
        { headers: { accept: '*/*' } }
      )
      .pipe(
        map((res) => {
          console.log('✅ Current user response:', res);
          // Handle both casing scenarios manually if parseResponse doesn't cover this specific DTO nesting
          // Or rely on parseResponse
          const { isSuccess, message, data } = this.parseResponse(res);

          if (!isSuccess) throw new Error(message || 'Failed to get user');

          const user = data as UserResponseDto;
          // خزن بيانات المستخدم
          this.setUser(user);
          return user;
        })
      );
  }

  // ================= Token Utilities =================
  private getDecodedToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  getRoleFromToken(token: string): string | null {
    const decoded = this.getDecodedToken(token);
    if (!decoded) return null;

    // Check known claims for role
    // Microsoft identity standard claim
    if (decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      return decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    // Standard role claim
    if (decoded['role']) {
      return decoded['role'];
    }
    return null;
  }
}
