import { Injectable } from '@angular/core';
import { UserService } from './user.service';

/**
 * Eagerly restores the signed-in user when instantiated.
 * Inject this service in the root component to trigger on app start.
 */
@Injectable({ providedIn: 'root' })
export class UserStartupService {
  constructor(userService: UserService) {
    userService.ensureUserLoaded().subscribe();
  }
}
