import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    // ✅ استخدم provideHttpClient مرة واحدة بس مع withInterceptorsFromDi
    provideHttpClient(withInterceptorsFromDi()),
    // ✅ سجل الـ Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,

    }

  ],
};