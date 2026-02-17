import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { UserProfile } from '../../model/interfaces/user/user-profile';
import { AnalyticsService } from '../analytics.service';
import { BreakdownType, ProgressionBreakdown, ProgressionUpdateRequest, ProgressionUpdateResponse } from '../../model/interfaces/user/progression';
import { GameDifficulties, GameModes } from '../../model/enum/game.enums';
import { CurrentCustomizationSelects } from '../../model/interfaces/customization';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // User profile for the current user
  private userSubject = new BehaviorSubject<UserProfile | null>(null);
  readonly user$ = this.userSubject.asObservable();
  // Loading state for user-related API requests
  private userLoadingSubject = new BehaviorSubject<boolean>(false);
  readonly userLoading$ = this.userLoadingSubject.asObservable();
  // User post game breakdowns
  private userPostGameBreakdowns: string[] = [];
  private userPostGameBreakdownsSubject = new BehaviorSubject<string[]>([]);
  readonly userPostGameBreakdowns$ = this.userPostGameBreakdownsSubject.asObservable();

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
    // indicate loading started
    this.userLoadingSubject.next(true);
    return this.http
      .get<UserProfile>(`${environment.matFlipApiBaseUrl}/users/retrieve`,
        { withCredentials: true }).pipe(
          finalize(() => this.userLoadingSubject.next(false)),
          tap((profile) => {
            console.log("Profile retrieved:", profile);
            this.userSubject.next(profile);
          }),
          catchError((error) => {
            console.error('Error fetching user profile:', error);
            this.userSubject.next(null);
            return of(null);
          })
        );
  }

  updateUserProgression(progressionUpdateRequest: ProgressionUpdateRequest): Observable<ProgressionUpdateResponse | null> {
    // indicate loading started
    this.userLoadingSubject.next(true);
    return this.http.post<ProgressionUpdateResponse>(`${environment.matFlipApiBaseUrl}/users/progression`, progressionUpdateRequest, { withCredentials: true }).pipe(
      finalize(() => this.userLoadingSubject.next(false)),
      tap((res: ProgressionUpdateResponse) => {
        console.log('User progression updated:', res);
        this.userSubject.next(res.user);
        this.processUserPostGameBreakdowns(
          res.breakdown, 
          progressionUpdateRequest.gameModeDirective, 
          progressionUpdateRequest.difficulty!
        );
      }),
      catchError((error) => {
        console.error('Error updating user progression:', error);
        return of(null);
      })
    );
  }

  updateUserCustomization(customizationSelects: CurrentCustomizationSelects): Observable<UserProfile | null> {
    // indicate loading started
    this.userLoadingSubject.next(true);
    return this.http.post<UserProfile>(`${environment.matFlipApiBaseUrl}/users/customization`, customizationSelects, { withCredentials: true }).pipe(
      finalize(() => this.userLoadingSubject.next(false)),
      tap((updatedUser: UserProfile) => {
        console.log('User customization updated:', updatedUser);
        this.userSubject.next(updatedUser);
      }),
      catchError((error) => {
        console.error('Error updating user customization:', error);
        return of(null);
      })
    );
  }

  signOut(): Observable<void> {
    // indicate loading started
    this.userLoadingSubject.next(true);
    return this.http.post<void>(`${environment.matFlipApiBaseUrl}/users/logout`, {}, { withCredentials: true }).pipe(
      finalize(() => this.userLoadingSubject.next(false)),
      tap(() => {
        this.analyticsService.trackUserSignOut();
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

  /**
   * Process and store the user's post-game breakdown.
   */
  processUserPostGameBreakdowns(breakdowns: ProgressionBreakdown[], gameMode: GameModes, gameDifficulty: GameDifficulties): void {
    this.userPostGameBreakdowns = [];
    breakdowns.forEach(breakdown => {
      switch (breakdown.type) {
        case BreakdownType.LEVEL_UP:
          this.userPostGameBreakdowns.push(`Leveled up to Level ${breakdown.toLevel} with ${breakdown.amount} XP!`);
          break;
        case BreakdownType.PRESTIGE_EARNED:
          this.userPostGameBreakdowns.push(`Earned a Prestige! You can now enter Prestige mode under Progression page.`);
          break;
        case BreakdownType.BASE_XP_GAINED:
          if (gameMode === GameModes.PAIRS) {
            this.userPostGameBreakdowns.push(`${breakdown.amount} XP for finding pairs`);
          } else if (gameMode === GameModes.SOLUTION) {
            this.userPostGameBreakdowns.push(`${breakdown.amount} XP for finding solutions`);
          }
          break;
        case BreakdownType.QUICK_BONUS_XP_GAINED:
          this.userPostGameBreakdowns.push(`${breakdown.amount} bonus XP for quick completion!`);
          break;
        case BreakdownType.STREAK_BONUS_XP_GAINED:
          this.userPostGameBreakdowns.push(`${breakdown.amount} bonus XP for your solution streak!`);
          break;
        case BreakdownType.DAILY_BONUS_XP_GAINED:
          this.userPostGameBreakdowns.push(`${breakdown.amount} bonus XP for playing the daily!`);
          break;
        case BreakdownType.SUCCESS_BONUS_XP_GAINED:
          this.userPostGameBreakdowns.push(`${breakdown.amount} bonus XP for winning on ${gameDifficulty}!`);
          break;
        case BreakdownType.XP_MULTIPLIER_APPLIED:
          this.userPostGameBreakdowns.push(`Applied an XP multiplier of x${breakdown.multiplier} for ${gameDifficulty} mode. Resulting in ${breakdown.amount} bonus XP.`);
          break;
        case BreakdownType.TOTAL_XP_GAINED:
          if (this.userPostGameBreakdowns.length > 1) {
            this.userPostGameBreakdowns.push(`Total XP gained: ${breakdown.amount}`);
          }
          break;
      }
    });
    this.userPostGameBreakdownsSubject.next(this.userPostGameBreakdowns);
  }

}
