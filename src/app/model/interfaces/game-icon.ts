// Represents either a classic Material Icon (mi) or a Material Symbol variant
export type GameIconKind = 'mi' | 'sym-outlined' | 'sym-rounded' | 'sym-sharp';

export interface GameIcon {
  name: string;     // icon glyph name
  kind: GameIconKind; // which font family / variant to use
  // (Optional future) variation settings for Material Symbols variable font
  fill?: 0 | 1;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
}
