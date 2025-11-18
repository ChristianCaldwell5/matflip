import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';

/**
 * Simple auth guard: allows activation only when a user profile is present.
 * If absent, redirects to root. Uses the in-memory cached user; does not
 * perform a network fetch (bootstrap initializer already tried).
 */
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const current = userService.getCurrentUser();
  if (current) return true;
  return router.parseUrl('/');
};
