import { MaimaiSheetLookupResult } from "@/db/maimaiDataApi";
import { GameRecordScoreRank, GameRecordSongDifficulty, GameRecordSongKind } from "../records";

export interface GetPlayerAlbum {
    songKind: GameRecordSongKind;
    songTitle: string;
    songdifficulty: GameRecordSongDifficulty;
    songFullDetail?: MaimaiSheetLookupResult;

    location: string;
    imageUrl: string;
    date: Date;
}

export interface GetPlayerDXRatingItem {
    id: string;

    songTitle: string;
    songdifficulty: GameRecordSongDifficulty;
    songLevel: string; // e.g. 12, 12+, 13, 13+, 14, 14+, 15, 15+
    songKind: GameRecordSongKind;
    songFullDetail?: MaimaiSheetLookupResult; // this should be optional to prevent in case the song does not exist in the maimai song db

    achievement: number;
    scoreRank: GameRecordScoreRank;
    rating?: number; // rating, only available when songFullDetail is available, otherwise undefined
}

export interface GetPlayerDXRating {
    new: GetPlayerDXRatingItem[];
    old: GetPlayerDXRatingItem[];
    selectionNew: GetPlayerDXRatingItem[];
    selectionOld: GetPlayerDXRatingItem[];
}
