import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { UserService } from '../services/user.service';

/**
 * Ensures API calls include credentials (mf_session cookie) and
 * clears the signed-in user on auth failures so the UI can react.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Only attach credentials for requests to our API base URL
  if (req.url.startsWith(environment.matFlipApiBaseUrl)) {
    req = req.clone({ withCredentials: true });
  }

  const userService = inject(UserService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 || err.status === 403) {
        userService.setSignedInUser(null);
      }
      return throwError(() => err);
    })
  );
};
