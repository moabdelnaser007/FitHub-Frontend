import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
    const router = inject(Router);

    const token = localStorage.getItem('fitHubToken');
    if (!token) {
        router.navigate(['/login']);
        return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const role =
        payload['role'] ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const allowedRoles = route.data['roles'] as string[];

    if (!allowedRoles.includes(role)) {
        router.navigate(['/unauthorized']);
        return false;
    }

    return true;
};
