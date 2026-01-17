import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
    const router = inject(Router);
    const token = localStorage.getItem('fitHubToken');

    if (!token) {
        router.navigate(['/login']);
        return false;
    }

    return true;
};
