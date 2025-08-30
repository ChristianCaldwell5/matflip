import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';
import { afterRender, ChangeDetectionStrategy, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NewsComponent } from './components/dialogs/news/news.component';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  imports: [MatIconModule, MatButtonModule, MatToolbarModule, MatDialogModule, CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  title = 'matflip';
  dialogRef: any;

  private platformId = inject(PLATFORM_ID);

  constructor(
    private dialog: MatDialog,
    private analyticsService: AnalyticsService
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
