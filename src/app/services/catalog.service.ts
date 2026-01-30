import { Injectable } from '@angular/core';
import { UserService } from './user/user.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { ActiveCatalog } from '../model/interfaces/customization';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  $catalogSubDestroyed = new Subject<void>();

  private activeCatalogSubject = new BehaviorSubject<ActiveCatalog | null>(null);
  readonly activeCatalog$ = this.activeCatalogSubject.asObservable();

  // Adjust these endpoints to match your API
  private readonly catalogPath= '/catalog';
  private readonly catalogVersionPath = '/version';

  // Storage keys
  private static readonly DATA_KEY = 'catalog:data';
  // Max catalog age before revalidation (1 week)
  private static readonly MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  // make a test shorter duration
  // private static readonly TESTING_MAX_AGE_MS = 0.5 * 60 * 1000; // 30 seconds

  constructor(
    userService: UserService,
    private http: HttpClient
  ) { 
    userService.user$.subscribe(user => {
      if (user) {
        const cachedCatalog: ActiveCatalog | null = this.loadFromCache();
        if (cachedCatalog) {
          this.activeCatalogSubject.next(cachedCatalog);
          this.revalidate(cachedCatalog.name, cachedCatalog.version, cachedCatalog.requestedAt.getTime());
        } else {
          this.fetchDefaultCatalog().subscribe();
        }
      }
    });
  }

  // Public method to force refresh (ignores version)
  refresh(force = false) {
    if (!force) {
      const cachedCatalog: ActiveCatalog | null = this.loadFromCache();
      if (cachedCatalog) {
        this.activeCatalogSubject.next(cachedCatalog);
      }
    }
    this.fetchDefaultCatalog().subscribe();
  }

  private revalidate(name?: string | null, cachedVersion?: number | null, cachedActivatedAt?: number | null) {
    this.checkVersion(name)
      .pipe(
        switchMap(serverVersion => {
          const versionChanged = !!serverVersion && serverVersion !== cachedVersion;
          const isTooOld = this.isStale(cachedActivatedAt);
          if (versionChanged || isTooOld || !cachedVersion) {
            this.fetchDefaultCatalog().subscribe();
          }
          return of(null);
        }),
        catchError(() => of(null))
      )
      .subscribe();
  }

  private checkVersion(name?: string | null) {
    return this.http
      .get<{ version: number }>(`${environment.matFlipApiBaseUrl}${this.catalogPath}/${name}${this.catalogVersionPath}`)
      .pipe(
        map(r => r?.version ?? null),
        catchError(() => of(null))
      );
  }

  private fetchDefaultCatalog() {
    return this.http.get<ActiveCatalog>(`${environment.matFlipApiBaseUrl}${this.catalogPath}/default`, { observe: 'body' }).pipe(
      tap(catalog => {
        this.saveToCache(catalog);
        this.activeCatalogSubject.next(catalog);
      }),
      catchError(() =>  of(null))
    );
  }

  private saveToCache(activeCatalog: ActiveCatalog) {
    try {
      localStorage.setItem(CatalogService.DATA_KEY, JSON.stringify(activeCatalog));
    } catch {
      // ignore storage errors (e.g., private mode / quota)
    }
  }

  private loadFromCache(): ActiveCatalog | null {
    try {
      const raw = localStorage.getItem(CatalogService.DATA_KEY);
      const parsed = raw ? JSON.parse(raw) as ActiveCatalog : null;
      const version = parsed?.version ?? null;
      const requestedAtRaw = parsed?.requestedAt ?? null;
      if (!raw || !version || !requestedAtRaw) {
        return null;
      }
      return { 
        name: parsed?.name ?? '', 
        items: parsed?.items ?? [], 
        version, 
        requestedAt: new Date(requestedAtRaw)
      };
    } catch {
      return null;
    }
  }

  private isStale(requestedAt: number | null | undefined): boolean {
    if (!requestedAt) return true;
    return Date.now() - requestedAt > CatalogService.MAX_AGE_MS;
  }

  clearCatalogCache() {
    try {
      localStorage.removeItem(CatalogService.DATA_KEY);
    } catch {
      // ignore
    }
    this.activeCatalogSubject.next(null);
  }
}
