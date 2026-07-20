import { ApiMeRankType } from "../me";

export enum GameRecordSongDifficulty {
    BASIC = "basic",
    ADVANCED = "advanced",
    EXPERT = "expert",
    MASTER = "master",
    REMASTER = "remaster",
}

export enum GameRecordSongKind {
    STANDARD = "standard",
    DX = "dx",
    UTAGE = "utage",
}

export enum GameRecordStatus {
    FAILED = "failed",
    CLEARED = "cleared",
    FULL_COMBO = "fc",
    FULL_COMBO_PLUS = "fcplus",
    ALL_PERFECT = "ap",
    ALL_PERFECT_PLUS = "applus",
}

export enum GameRecordScoreRank {
    D = "d",
    C = "c",
    B = "b",
    BB = "bb",
    BBB = "bbb",
    A = "a",
    AA = "aa",
    AAA = "aaa",
    S = "s",
    S_P = "splus",
    SS = "ss",
    SS_P = "ssplus",
    SSS = "sss",
    SSS_P = "sssplus",
}

export enum GameRecordSyncStatus {
    SOLO = "solo",
    SYNC_PLAY = "sync_play",
    FULL_SYNC = "fs",
    FULL_SYNC_PLUS = "fsplus",
    FULL_SYNC_DX = "fsd",
    FULL_SYNC_DX_PLUS = "fsdplus",
}

export enum GameRecordSyncStatusShort {
    SOLO = "solo",
    SYNC_PLAY = "sync",
    FULL_SYNC = "fs",
    FULL_SYNC_PLUS = "fsp",
    FULL_SYNC_DX = "fsd",
    FULL_SYNC_DX_PLUS = "fsdp",
}

export interface JudgeCount {
    criticalPerfect: number;
    perfect: number;
    great: number;
    good: number;
    miss: number;
}

export interface JudgeTable {
    tap: JudgeCount;
    hold: JudgeCount;
    slide: JudgeCount;
    touch: JudgeCount;
    break: JudgeCount;
}

export const difficultyColor: Record<GameRecordSongDifficulty, string> = {
    [GameRecordSongDifficulty.BASIC]: "#81D955",
    [GameRecordSongDifficulty.ADVANCED]: "#F8B709",
    [GameRecordSongDifficulty.EXPERT]: "#FF818D",
    [GameRecordSongDifficulty.MASTER]: "#C346E6",
    [GameRecordSongDifficulty.REMASTER]: "#FF6FFD",
};

export const playlogBaseImg = "https://maimaidx-eng.com/maimai-mobile/img/playlog/{}.png";
export const songKindBaseImg = "https://maimaidx-eng.com/maimai-mobile/img/music_{}.png";
export const dxStarBaseImg = "https://maimaidx-eng.com/maimai-mobile/img/playlog/dxstar_{}.png";
export const musicIconBaseImg = "https://maimaidx-eng.com/maimai-mobile/img/music_icon_{}.png";

export interface GameRecordLast50 {
    id: string;

    songTitle: string;
    songArtwork: string;
    songdifficulty: GameRecordSongDifficulty;
    songLevel: string; // e.g. 12, 12+, 13, 13+, 14, 14+, 15, 15+
    songKind: GameRecordSongKind;

    achievement: number;
    newAchievement: boolean; // true if the achievement is higher than the previous record
    dxScore: {
        current: number;
        max: number;
    };
    dxStar: number; // 0-5
    newDxScore: boolean; // true if the dxScore is higher than the previous record
    scoreRank: GameRecordScoreRank;

    status: GameRecordStatus;
    syncStatus: GameRecordSyncStatus;
    syncStatusShort: GameRecordSyncStatusShort;
    syncPlayGrade: string; // 1st, 2nd, 3rd, 4th

    isPerfectChallenge: boolean;
    liveStatus: {
        current: number;
        max: number;
    };

    trackNo: number;
    playDate: Date;
}

export type GameRecordPlayLogDetail = {
    id: string;

    detail: GameRecordLast50;

    judge: JudgeTable;
    fast: number;
    late: number;

    ratingPrev: number; // rating before this play
    ratingPrevType: ApiMeRankType;
    ratingResult: number;
    ratingDirection: "up" | "down" | "keep";
    ratingDelta: number; // rating change, can be negative

    maxCombo: {
        current: number;
        max: number;
    };

    // maxSync should be 0/0 if solo
    maxSync: {
        current: number;
        max: number;
    };
};
