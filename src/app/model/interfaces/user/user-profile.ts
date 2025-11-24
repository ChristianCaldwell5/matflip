import { LevelInfo } from "./level-info";
import { PlayerStats } from "./player-stats";

export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    avatarUrl?: string;
    googleId?: string;
    displayName?: string;
    stats?: PlayerStats;
    levelInfo?: LevelInfo;
    createdAt: Date;
    updatedAt: Date;
}