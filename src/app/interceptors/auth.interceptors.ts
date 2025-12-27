import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // جيب الـ Token من localStorage
  const token = localStorage.getItem('fitHubToken'); // استخدم اسم التوكن الصحيح

  console.log('🔐 Auth Interceptor - Token:', token ? 'Found' : 'NOT FOUND');

  if (token) {
    // أضف الـ Token للـ Request
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('🔐 Auth Interceptor - Request with token:', cloned.headers.get('Authorization'));
    return next(cloned);
  }

  console.log('⚠️ No token found in localStorage');
  return next(req);
};
