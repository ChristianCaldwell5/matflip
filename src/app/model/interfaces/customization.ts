export interface CatalogItem {
    type: CatalogType
    name: string;
    displayName: string;
    rarity: RarityType
    unlockType: UnlockType;
    isRetired: boolean
    version: number;
    styleRecipe: string;
    isAnimated: boolean;
}

export enum CatalogType {
    CARD_SKIN = 'card_skin',
    MATCH_EFFECT = 'match_effect',
    TITLE = 'title',
}

export interface ActiveCatalog {
    name: string;
    items: CatalogItem[];
    version: number;
    requestedAt: Date;
}

export enum RarityType {
    COMMON = 'common',
    UNCOMMON = 'uncommon',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

export enum UnlockType {
    LEVEL_UP = 'level_up',
    ACHIEVEMENT = 'achievement',
    IN_GAME_PURCHASE = 'in_game_purchase'
}

export interface CurrentCustomizationSelects {
    cardSkin?: string;
    matchEffect?: string;
    title?: string;
}
