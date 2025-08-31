import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { GameDifficulties, GameModes } from '../model/enum/game.enums';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private measurementId = environment.gaMeasurementId;
  private sessionId: string | null = null;

  constructor() { }

  injectGAScript(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined' || !this.measurementId) return;

    // Avoid duplicate injection
    if (document.getElementById('gtag-js') || typeof window.gtag === 'function') return;

    // Initialize dataLayer and gtag queue
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); } as any;

    // Queue initial commands
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId);

    // Load the gtag script
    const script = document.createElement('script');
    script.id = 'gtag-js';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
    document.head.appendChild(script);
  }

  private send(eventName: string, params?: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.measurementId) return;

    if (typeof window.gtag !== 'function') {
      this.injectGAScript();
    }

    try {
      window.gtag('event', eventName, params || {});
    } catch {
      // Fail silently
    }
  }

  trackGameModeStart(
    mode: GameModes,
    opts?: { difficulty?: GameDifficulties; }
  ): void {
    this.send('game_mode_start', {
      game_mode: mode,
      session_id: this.sessionId,
      ...(opts?.difficulty && { difficulty: opts.difficulty })
    });
  }

  trackGameModeEnd(
    mode: GameModes,
    opts?: { difficulty?: GameDifficulties; success?: boolean; solves?: number; streak?: number; time_taken?: number }
  ): void {
    this.send('game_mode_end', {
      game_mode: mode,
      session_id: this.sessionId,
      ...(opts?.difficulty && { difficulty: opts.difficulty }),
      ...(opts?.success !== undefined && { success: opts.success }),
      ...(opts?.time_taken !== undefined && { time_taken: opts.time_taken }),
      ...(opts?.solves !== undefined && { solves: opts.solves }),
      ...(opts?.streak !== undefined && { streak: opts.streak })
    });
  }

  quitGameEvent(mode: GameModes, opts?: { difficulty?: GameDifficulties; }): void {
    this.send('quit_game', {
      game_mode: mode,
      session_id: this.sessionId,
      ...(opts?.difficulty && { difficulty: opts.difficulty })
    });
  }

  howToPlayEvent(): void {
    this.send('how_to_play', {
      session_id: this.sessionId
    });
  }

  newsEvent(): void {
    this.send('news_event', {
      session_id: this.sessionId
    });
  }

  generateSessionId(): string {
    this.sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    return this.sessionId;
  }

}
