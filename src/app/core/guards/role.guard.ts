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
    console.log('🛡️ RoleGuard Checking Token Payload:', payload);

    const rawRole =
        payload['role'] ||
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    let userRoles: string[] = [];
    if (Array.isArray(rawRole)) {
        userRoles = rawRole;
    } else if (rawRole) {
        userRoles = [rawRole];
    }

    console.log('🛡️ Extracted Roles:', userRoles);
    console.log('🛡️ Required Roles:', route.data['roles']);

    const allowedRoles = route.data['roles'] as string[];

    // Check if user has ANY of the allowed roles
    const hasPermission = userRoles.some(r => allowedRoles.includes(r));

    if (!hasPermission) {
        console.warn(`⛔ Unauthorized! User roles '${userRoles.join(', ')}' do not match allowed roles: ${allowedRoles}`);
        router.navigate(['/unauthorized']);
        return false;
    }

    return true;
};
