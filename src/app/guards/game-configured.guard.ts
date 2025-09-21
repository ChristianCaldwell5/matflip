import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { GameService } from '../services/game.service';

// Standalone functional route guard (Angular 15+)
export const gameConfiguredGuard: CanActivateFn = () => {
  const game = inject(GameService);
  const router = inject(Router);

  if (game.isConfigured()) {
    return true;
  }
  // Not configured: navigate to menu
  return router.parseUrl('/');
};
