import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

export interface OtpResponse {
  success: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class OtpService {
  constructor(private auth: AuthService) { }

  sendOtp(email: string): Observable<OtpResponse> {
    return this.auth.sendOtp(email);
  }

  verifyOtp(email: string, code: string): Observable<OtpResponse> {
    return this.auth.verifyOtp(email, code);
  }

  resendOtp(email: string): Observable<OtpResponse> {
    return this.auth.resendOtp(email);
  }
}
