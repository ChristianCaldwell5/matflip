import { GameDifficulties, GameModes } from "../../enum/game.enums";
import { UserProfile } from "./user-profile";

export interface ProgressionUpdateRequest {
    gameModeDirective: GameModes;
    flipsMade?: number;
    difficulty?: GameDifficulties;

    pairsMade?: number;
    foundAllPairs?: boolean;
    timeTakenInSeconds?: number;

    solutionsFound?: number;
    solutionStreak?: number;

    dailyTimeTakenInSeconds?: number;
}

export interface ProgressionUpdateResponse {
    user: UserProfile;
    breakdown: ProgressionBreakdown[];
}

export interface ProgressionBreakdown {
    type: BreakdownType;
    amount: number;
    description?: string;
    toLevel?: number;
    multiplier?: number;
}

export enum BreakdownType {
    BASE_XP_GAINED = 'BASE_XP_GAINED',
    QUICK_BONUS_XP_GAINED = 'QUICK_BONUS_XP_GAINED',
    STREAK_BONUS_XP_GAINED = 'STREAK_BONUS_XP_GAINED',
    DAILY_BONUS_XP_GAINED = 'DAILY_BONUS_XP_GAINED',
    SUCCESS_BONUS_XP_GAINED = 'SUCCESS_BONUS_XP_GAINED',
    XP_MULTIPLIER_APPLIED = 'XP_MULTIPLIER_APPLIED',
    TOTAL_XP_GAINED = 'TOTAL_XP_GAINED',
    LEVEL_UP = 'LEVEL_UP',
    PRESTIGE_EARNED = 'PRESTIGE_EARNED'
}
