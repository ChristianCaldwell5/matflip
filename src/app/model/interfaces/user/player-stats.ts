export interface GeneralStats {
	totalGamesPlayed: number;
	totalFlips: number;
}

export interface DailyStats {
	currentStreak: number;
	longestStreak: number;
	lastPlayed: Date | null;
	timesPlayed: number;
	timesPlacedOnLeaderboard: number;
	bestLeaderboardPosition: number | null;
	bestTimeInSeconds: number | null;
}

export interface SolutionDifficultyStats {
	timesPlayed: number;
	highestSolutionCount: number;
	bestStreakCount: number;
}

export interface SolutionDifficulties {
	easy: SolutionDifficultyStats;
	medium: SolutionDifficultyStats;
	hard: SolutionDifficultyStats;
	expert: SolutionDifficultyStats;
}

export interface SolutionStats {
	totalTimesPlayed: number;
	difficultyBreakdown: SolutionDifficulties;
}

export interface PairDifficultyStats {
	timesPlayed: number;
	timesWon: number;
	bestTimeInSeconds: number;
}

export interface PairDifficulties {
	easy: PairDifficultyStats;
	medium: PairDifficultyStats;
	hard: PairDifficultyStats;
	expert: PairDifficultyStats;
	mastery: PairDifficultyStats;
}

export interface PairStats {
	totalTimesPlayed: number;
	totalMatchesFound: number;
	difficultyBreakdown: PairDifficulties;
}

export interface PlayerStats {
	general: GeneralStats;
	daily: DailyStats;
	pairs: PairStats;
	solutions: SolutionStats;
}
