import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log('%c#debug [src/app/core/guards/auth.guard.ts] authGuard:', 'color: salmon;', {
    isAuth: authService.isAuthenticated(),
  });

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.navigate(['/login']);
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  console.log('%c#debug [src/app/core/guards/auth.guard.ts] guestGuard:', 'color: chartreuse;', {
    isAuth: authService.isAuthenticated(),
  });

  if (!authService.isAuthenticated()) {
    return true;
  }

  return router.navigate(['/dashboard']);
};
