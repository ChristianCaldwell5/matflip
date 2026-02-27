import { Injectable, signal, WritableSignal } from '@angular/core';
import { UserService } from './user/user.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject, catchError, map, of, switchMap, tap } from 'rxjs';
import { ActiveCatalog, buildTimelineMap, CatalogBreakdown, CatalogItem, CatalogType, RarityType } from '../model/interfaces/customization';
import { environment } from '../../environments/environment';

export type CatalogSortMode = 'price-asc' | 'price-desc' | 'rarity-asc' | 'rarity-desc';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  $catalogSubDestroyed = new Subject<void>();

  private activeCatalogSubject = new BehaviorSubject<ActiveCatalog | null>(null);
  readonly activeCatalog$ = this.activeCatalogSubject.asObservable();
  readonly catalogBreakdown: WritableSignal<CatalogBreakdown | null> = signal(null);

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
        this.breakdownActiveCatalog(catalog);
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
      const activeCatalog: ActiveCatalog = {
        name: parsed?.name ?? '', 
        items: parsed?.items ?? [], 
        version, 
        requestedAt: new Date(requestedAtRaw)
      };
      this.breakdownActiveCatalog(activeCatalog);
      return activeCatalog
    } catch {
      return null;
    }
  }

  private isStale(requestedAt: number | null | undefined): boolean {
    if (!requestedAt) return true;
    return Date.now() - requestedAt > CatalogService.MAX_AGE_MS;
  }

  private breakdownActiveCatalog(catalog: ActiveCatalog) {
    const skins = catalog.items.filter(i => i.type === CatalogType.CARD_SKIN);
    const effects = catalog.items.filter(i => i.type === CatalogType.MATCH_EFFECT);
    const titles = catalog.items.filter(i => i.type === CatalogType.TITLE);
    const timeline = buildTimelineMap(catalog.items);
    console.log('Catalog Breakdown:', { skins, effects, titles, timeline });
    this.catalogBreakdown.set({
      skins,
      effects,
      titles,
      timeline
    });
  }

  clearCatalogCache() {
    try {
      localStorage.removeItem(CatalogService.DATA_KEY);
    } catch {
      // ignore
    }
    this.activeCatalogSubject.next(null);
  }

  withDefaultPrices(items: CatalogItem[]): CatalogItem[] {
    return items.map((item) => ({
      ...item,
      flipBucksRequirement: item.flipBucksRequirement ?? this.getPriceForRarity(item.rarity)
    }));
  }

  sortCatalogItems(items: CatalogItem[], mode: CatalogSortMode): CatalogItem[] {
    const sorted = [...items];
    switch (mode) {
      case 'price-asc':
        return sorted.sort((a, b) => this.comparePriceAsc(a, b));
      case 'price-desc':
        return sorted.sort((a, b) => this.comparePriceAsc(b, a));
      case 'rarity-asc':
        return sorted.sort((a, b) => this.compareRarityAsc(a, b));
      case 'rarity-desc':
        return sorted.sort((a, b) => this.compareRarityAsc(b, a));
      default:
        return sorted;
    }
  }

  private comparePriceAsc(a: CatalogItem, b: CatalogItem): number {
    const priceA = a.flipBucksRequirement ?? this.getPriceForRarity(a.rarity);
    const priceB = b.flipBucksRequirement ?? this.getPriceForRarity(b.rarity);
    return priceA - priceB;
  }

  private compareRarityAsc(a: CatalogItem, b: CatalogItem): number {
    return this.getRarityRank(a.rarity) - this.getRarityRank(b.rarity);
  }

  private getRarityRank(rarity: RarityType): number {
    switch (rarity) {
      case RarityType.COMMON:
        return 1;
      case RarityType.UNCOMMON:
        return 2;
      case RarityType.RARE:
        return 3;
      case RarityType.EPIC:
        return 4;
      case RarityType.LEGENDARY:
        return 5;
      default:
        return 99;
    }
  }

  private getPriceForRarity(rarity: RarityType): number {
    switch (rarity) {
      case RarityType.COMMON:
        return 100;
      case RarityType.UNCOMMON:
        return 250;
      case RarityType.RARE:
        return 500;
      case RarityType.EPIC:
        return 900;
      case RarityType.LEGENDARY:
        return 1500;
      default:
        return 250;
    }
  }
}
