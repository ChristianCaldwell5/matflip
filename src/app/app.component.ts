import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { NewsComponent } from './components/dialogs/news/news.component';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

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

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if (environment.production && environment.gaMeasurementId) {
      this.injectGAScript(environment.gaMeasurementId);
    }
  }

  private injectGAScript(measurementId: string): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // Avoid duplicate injection
    if (document.getElementById('gtag-js') || typeof window.gtag === 'function') return;

    // Initialize dataLayer and gtag queue
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); } as any;

    // Queue initial commands
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    // Load the gtag script
    const script = document.createElement('script');
    script.id = 'gtag-js';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  openNewsDialog(): void {
    this.dialogRef = this.dialog.open(NewsComponent, {
      height: 'auto',
      maxHeight: '90vh',
      width: '90%',
      maxWidth: '700px',
      disableClose: false,
    });
  }
}
