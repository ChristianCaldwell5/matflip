import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { afterRender, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { NewsComponent } from './components/dialogs/news/news.component';
import { AnalyticsService } from './services/analytics.service';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { UserService } from './services/user.service';
import { UserStartupService } from './services/user-startup.service';
import { Subject, takeUntil } from 'rxjs';
import { UserProfile } from './model/interfaces/user/user-profile';

@Component({
  selector: 'app-root',
  imports: [MatIconModule, MatButtonModule, MatToolbarModule, MatDialogModule, MatSidenavModule,
    CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'matflip';
  dialogRef: any;

  // google auth url
  googleAuthUrl: string = `${environment.matFlipApiBaseUrl}/auth/google`;
  googleClientId: string = environment.googleClientId || '';

  currentUser: UserProfile | null = null;

  destroy$ = new Subject<void>();

  // Google Sign-In render target
  @ViewChild('gsiButton', { static: false }) gsiButton!: ElementRef<HTMLDivElement>;
  @ViewChild('drawer', { static: false }) drawer!: MatDrawer;
  private gsiLoaded = false;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private userService: UserService,
    _userStartup: UserStartupService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.analyticsService.generateSessionId();
    // Runs on both server and client; guard to browser to inject after hydration
    afterRender(() => {
      if (!environment.production || !environment.gaMeasurementId) return;
      if (!isPlatformBrowser(this.platformId)) return;
      this.analyticsService.injectGAScript();
    });
  }

  ngOnInit(): void {
    if (environment.production && environment.gaMeasurementId) {
      this.analyticsService.injectGAScript();
    }

    this.userService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.cdr.markForCheck();
      });

    this.loadGsiScriptAndRenderButton();
  }

  private loadGsiScriptAndRenderButton(): Promise<void> {
    return this.loadGsiScript().then(() => {
      const google = (window as any).google;
      if (!google?.accounts?.id) return;

      // Initialize the client
      google.accounts.id.initialize({
        client_id: this.googleClientId,
        ux_mode: 'redirect',
        login_uri: this.googleAuthUrl,
        auto_select: false,
      });

      // Render button idempotently
      const el = this.gsiButton?.nativeElement;
      if (el) {
        el.innerHTML = '';
        google.accounts.id.renderButton(el, {
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
        // uncomment below for Google One Tap prompt
        // google.accounts.id.prompt();
      }
    });
  }

  // add the script on load
  private loadGsiScript(): Promise<void> {
    if (this.gsiLoaded) return Promise.resolve();
    return new Promise((resolve) => {
      const ready = () => {
        if ((window as any).google?.accounts?.id) {
          this.gsiLoaded = true;
          resolve();
          return true;
        }
        return false;
      };
      if (ready()) return;

      const existing = document.getElementById('google-gsi');
      if (existing) {
        // Wait until global object is ready
        const wait = () => { if (!ready()) setTimeout(wait, 50); };
        wait();
        return;
      }

      const s = document.createElement('script');
      s.id = 'google-gsi';
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.onload = () => { ready() || resolve(); };
      document.head.appendChild(s);
    });
  }

  signOut(): void {
    this.analyticsService.trackUserSignOut();
    this.userService.signOut().subscribe({
      next: () => {
        console.log("User signed out successfully");
        this.drawer.toggle();
        this.loadGsiScriptAndRenderButton();
        this.cdr.detectChanges();
      },
      error: () => {
        console.error("Error signing out");
      }
    });
  }

  goToPrivacy(): void {
    this.router.navigate(['/privacy']);
    this.drawer.toggle();
  }

  goToTerms(): void {
    this.router.navigate(['/terms']);
    this.drawer.toggle();
  }

  openNewsDialog(): void {
    this.dialogRef = this.dialog.open(NewsComponent, {
      height: 'auto',
      maxHeight: '90vh',
      width: '90%',
      maxWidth: '700px',
      disableClose: false,
    });
    this.analyticsService.newsEvent();
  }
}
