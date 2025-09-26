// Inlined to avoid module resolution issues with strict app tsconfig
export type GameIconKind = 'mi' | 'sym-outlined' | 'sym-rounded' | 'sym-sharp';
export interface GameIcon {
    name: string;
    kind: GameIconKind;
    fill?: 0 | 1;
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
    grade?: -25 | 0 | 200;
    opticalSize?: 20 | 24 | 40 | 48;
}

export interface card {
    icon?: GameIcon; // Material icon or symbol descriptor
    color: string;
    flipped: boolean;
    matched: boolean;
    displayText?: string; // Used for math solution mode
}