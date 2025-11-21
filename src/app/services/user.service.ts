import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserProfile } from '../model/interfaces/user/user-profile';
import { AnalyticsService } from './analytics.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Reactive stream for components to subscribe to
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private analyticsService: AnalyticsService
  ) { }

  /** Synchronously get the latest cached user value (or null). */
  getCurrentUser(): UserProfile | null {
    return this.userSubject.getValue();
  }

  getUserProfile(): Observable<UserProfile | null> {
    if (this.getCurrentUser()) {
      this.analyticsService.trackUserSignIn();
      return of(this.getCurrentUser());
    }
    return this.http
      .get<UserProfile>(`${environment.matFlipApiBaseUrl}/users/retrieve`,
        { withCredentials: true }).pipe(
          tap((profile) => {
            console.log("Profile retrieved:", profile);
            this.analyticsService.trackUserSignIn();
            this.userSubject.next(profile);
          }),
          catchError((error) => {
            console.error('Error fetching user profile:', error);
            this.userSubject.next(null);
            return of(null);
          })
        );
  }

  signOut(): Observable<void> {
    return this.http.post<void>(`${environment.matFlipApiBaseUrl}/users/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.userSubject.next(null);
      }),
      catchError((error) => {
        console.error('Error signing out:', error);
        this.userSubject.next(null);
        return of(undefined);
      })
    );
  }

  /**
   * Ensure the user is loaded exactly once; returns cached value if available.
   */
  ensureUserLoaded(): Observable<UserProfile | null> {
    const current = this.userSubject.getValue();
    if (current) return of(current);
    return this.getUserProfile();
  }

  /** Manually set/clear the current user and notify subscribers */
  setSignedInUser(user: UserProfile | null): void {
    this.userSubject.next(user);
  }

}
