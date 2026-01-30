import { Injectable, signal } from '@angular/core';

export type DrawerAction = 'toggle' | 'open' | 'close' | null;

@Injectable({ providedIn: 'root' })
export class DrawerService {
  // Signal carrying the latest requested action
  private _action = signal<DrawerAction>(null);

  // Expose a read-only accessor for consumers
  readonly action = this._action.asReadonly();

  requestToggle(): void { this._action.set('toggle'); }
  requestOpen(): void { this._action.set('open'); }
  requestClose(): void { this._action.set('close'); }

  // Optional: clear after consumption if desired
  clear(): void { this._action.set(null); }
}
