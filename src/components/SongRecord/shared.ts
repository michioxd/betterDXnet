import { dataSource } from "@/db/maimaiDataTypes";
import { GameRecordScoreRank, GameRecordSongDifficulty, GameRecordStatus, type GameRecordSong } from "@/api/records";

export const difficulties = [
    GameRecordSongDifficulty.BASIC,
    GameRecordSongDifficulty.ADVANCED,
    GameRecordSongDifficulty.EXPERT,
    GameRecordSongDifficulty.MASTER,
    GameRecordSongDifficulty.REMASTER,
    GameRecordSongDifficulty.UTAGE,
];

export const ranks = [
    GameRecordScoreRank.D,
    GameRecordScoreRank.C,
    GameRecordScoreRank.B,
    GameRecordScoreRank.BB,
    GameRecordScoreRank.BBB,
    GameRecordScoreRank.A,
    GameRecordScoreRank.AA,
    GameRecordScoreRank.AAA,
    GameRecordScoreRank.S,
    GameRecordScoreRank.S_P,
    GameRecordScoreRank.SS,
    GameRecordScoreRank.SS_P,
    GameRecordScoreRank.SSS,
    GameRecordScoreRank.SSS_P,
];

export const clearStatuses = [
    GameRecordStatus.FAILED,
    GameRecordStatus.CLEARED,
    GameRecordStatus.FULL_COMBO,
    GameRecordStatus.FULL_COMBO_PLUS,
    GameRecordStatus.ALL_PERFECT,
    GameRecordStatus.ALL_PERFECT_PLUS,
];

export function formatPercent(value: number) {
    return `${value.toFixed(4)}%`;
}

export function getArtworkUrl(record: GameRecordSong) {
    return record.songFullDetail ? dataSource.getSongArtworkUrl(record.songFullDetail.song) : "";
}

export function getSongKindImageUrl(songKind: GameRecordSong["songKind"]) {
    return `https://maimaidx-eng.com/maimai-mobile/img/music_${songKind === "std" ? "standard" : songKind}.png`;
}

export function normalizeSearchText(value: string) {
    return value.trim().toLowerCase();
}

export function parseOptionalNumber(value: string) {
    if (!value.trim()) return undefined;

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatRankLabel(rank: GameRecordScoreRank) {
    switch (rank) {
        case GameRecordScoreRank.S_P:
            return "S+";
        case GameRecordScoreRank.SS_P:
            return "SS+";
        case GameRecordScoreRank.SSS_P:
            return "SSS+";
        default:
            return rank.toUpperCase();
    }
}

export function formatClearLabel(status: GameRecordStatus) {
    switch (status) {
        case GameRecordStatus.FULL_COMBO_PLUS:
            return "FC+";
        case GameRecordStatus.ALL_PERFECT_PLUS:
            return "AP+";
        case GameRecordStatus.FULL_COMBO:
            return "FC";
        case GameRecordStatus.ALL_PERFECT:
            return "AP";
        case GameRecordStatus.CLEARED:
            return "CLEARED";
        case GameRecordStatus.FAILED:
            return "FAILED";
        default:
            return status;
    }
}
