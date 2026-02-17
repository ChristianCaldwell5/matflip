export interface CatalogItem {
    type: CatalogType
    name: string;
    displayName: string;
    rarity: RarityType
    unlockType: UnlockType;
    isRetired: boolean
    version: number;
    styleRecipe: string;
    levelRequirement: number;
    isSkyboxed: boolean;
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

export interface CatalogBreakdown {
    skins: CatalogItem[];
    effects: CatalogItem[];
    titles: CatalogItem[];
    timeline: TimelineMap;
}

export type TimelineEntry = {
    skins: CatalogItem[];
    effects: CatalogItem[];
    titles: CatalogItem[];
};

export type TimelineMap = Map<number, TimelineEntry>;

export function buildTimelineMap(items: CatalogItem[]): TimelineMap {
    const map: TimelineMap = new Map();

    for (const item of items) {
        if (item.unlockType === UnlockType.LEVEL_UP) {
            const level = item.levelRequirement;
            let entry = map.get(level);

            if (!entry) {
                entry = { skins: [], effects: [], titles: [] };
                map.set(level, entry);
            }

            switch (item.type) {
                case CatalogType.CARD_SKIN:
                    entry.skins.push(item);
                    break;
                case CatalogType.MATCH_EFFECT:
                    entry.effects.push(item);
                    break;
                case CatalogType.TITLE:
                    entry.titles.push(item);
                    break;
            }
        }
    }

    return map;
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
    cardSkin?: CatalogItem | null;
    matchEffect?: CatalogItem | null;
    title?: CatalogItem | null;
}
