import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ActiveCatalog, CatalogItem, CatalogType, CurrentCustomizationSelects, RarityType, UnlockType } from '../model/interfaces/customization';
import { UserProfile } from '../model/interfaces/user/user-profile';
import { CatalogService, CatalogSortMode } from './catalog.service';
import { StoreService, StoreItems } from './store.service';
import { UserService } from './user/user.service';

function makeItem(type: CatalogType, name: string, unlockType: UnlockType = UnlockType.IN_GAME_PURCHASE): CatalogItem {
  return {
    type,
    name,
    displayName: name,
    rarity: RarityType.COMMON,
    unlockType,
    isRetired: false,
    version: 1,
    styleRecipe: `${name}-recipe`,
    levelRequirement: 0,
    isSkyboxed: false,
    isAnimated: false,
  };
}

function makeUser(ownedCatalogItems: CatalogItem[]): UserProfile {
  return {
    id: 'u-1',
    email: 'test@matflip.com',
    displayName: 'Tester',
    ownedCatalogItems,
    flipBucks: 1000,
    currentCustomizationSelects: {
      cardSkin: null,
      matchEffect: null,
      title: null,
    } as CurrentCustomizationSelects,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('StoreService', () => {
  let service: StoreService;

  let activeCatalogSubject: BehaviorSubject<ActiveCatalog | null>;
  let userSubject: BehaviorSubject<UserProfile | null>;

  let catalogServiceMock: {
    activeCatalog$: any;
    withDefaultPrices: jasmine.Spy;
    sortCatalogItems: jasmine.Spy;
  };

  let latestStoreItems: StoreItems | null;
  let subscription: Subscription;

  beforeEach(() => {
    activeCatalogSubject = new BehaviorSubject<ActiveCatalog | null>(null);
    userSubject = new BehaviorSubject<UserProfile | null>(null);

    catalogServiceMock = {
      activeCatalog$: activeCatalogSubject.asObservable(),
      withDefaultPrices: jasmine.createSpy('withDefaultPrices').and.callFake((items: CatalogItem[]) => items),
      sortCatalogItems: jasmine.createSpy('sortCatalogItems').and.callFake((items: CatalogItem[], _mode: CatalogSortMode) => items),
    };

    TestBed.configureTestingModule({
      providers: [
        StoreService,
        { provide: CatalogService, useValue: catalogServiceMock },
        { provide: UserService, useValue: { user$: userSubject.asObservable() } },
      ],
    });

    service = TestBed.inject(StoreService);
    latestStoreItems = null;
    subscription = service.storeItems$.subscribe((value) => {
      latestStoreItems = value;
    });
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('filters out owned items when catalog and user are loaded', () => {
    const ownedSkin = makeItem(CatalogType.CARD_SKIN, 'owned_skin');
    const catalog: ActiveCatalog = {
      name: 'default',
      version: 1,
      requestedAt: new Date(),
      items: [
        ownedSkin,
        makeItem(CatalogType.CARD_SKIN, 'available_skin'),
        makeItem(CatalogType.MATCH_EFFECT, 'available_effect'),
        makeItem(CatalogType.TITLE, 'available_title'),
      ],
    };

    activeCatalogSubject.next(catalog);
    userSubject.next(makeUser([ownedSkin]));

    expect(latestStoreItems).toBeTruthy();
    expect(latestStoreItems!.skinItems.some((item) => item.name === 'owned_skin')).toBeFalse();
    expect(latestStoreItems!.skinItems.some((item) => item.name === 'available_skin')).toBeTrue();
  });

  it('dedupes items by type + name when catalog and mock items overlap', () => {
    const catalog: ActiveCatalog = {
      name: 'default',
      version: 1,
      requestedAt: new Date(),
      items: [
        makeItem(CatalogType.MATCH_EFFECT, 'distort'),
      ],
    };

    activeCatalogSubject.next(catalog);
    userSubject.next(makeUser([]));

    expect(latestStoreItems).toBeTruthy();
    const distortItems = latestStoreItems!.effectItems.filter((item) => item.name === 'distort');
    expect(distortItems.length).toBe(1);
  });

  it('recomputes with new sort mode', () => {
    const catalog: ActiveCatalog = {
      name: 'default',
      version: 1,
      requestedAt: new Date(),
      items: [makeItem(CatalogType.CARD_SKIN, 'alpha')],
    };

    activeCatalogSubject.next(catalog);
    userSubject.next(makeUser([]));
    catalogServiceMock.sortCatalogItems.calls.reset();

    service.setSortMode('price-desc');

    const calledWithPriceDesc = catalogServiceMock.sortCatalogItems.calls.allArgs().some((args) => args[1] === 'price-desc');
    expect(calledWithPriceDesc).toBeTrue();
  });
});
