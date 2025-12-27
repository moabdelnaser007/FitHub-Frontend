import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // جيب التوكن من الـ Service
    const token = this.authService.getToken();

    // لو في توكن، ضيفه للـ Authorization header
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Handle الـ response
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // لو 401 (Unauthorized) يعني التوكن expired أو invalid
        if (error.status === 401) {
          // اعمل logout
          this.authService.logout();
          // روح على صفحة Login
          this.router.navigate(['/auth/login']);
        }

        // لو 403 (Forbidden) يعني مش عنده صلاحية
        if (error.status === 403) {
          console.error('Access denied');
          // ممكن تعمل redirect لصفحة "Access Denied"
        }

        return throwError(() => error);
      })
    );
  }
}