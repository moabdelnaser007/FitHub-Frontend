import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();

    console.log('🔐 AuthInterceptor - URL:', req.url);
    console.log('🔐 AuthInterceptor - Token:', token ? 'Found ✅' : 'NOT FOUND ❌');

    if (!token) {
      console.warn('⚠️ No token found! Request will be sent without authorization');
      return next.handle(req);
    }

    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      '🔐 AuthInterceptor - Authorization header added:',
      `Bearer ${token.substring(0, 20)}...`
    );

    return next.handle(cloned);
  }
}
